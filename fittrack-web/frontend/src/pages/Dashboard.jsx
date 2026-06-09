import React, { useState, useMemo, useEffect } from 'react';
import './Dashboard.css';
import { userAPI } from '../utils/api';
import calculateGamification from '../utils/gamification';

const Dashboard = ({ user, data, onNavigate, onUpdate }) => {
  const [showWeightEditor, setShowWeightEditor] = useState(false);
  const [showMacrosModal, setShowMacrosModal] = useState(false);
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(user?.current_weight_kg || '');
  const [targetWeight, setTargetWeight] = useState(user?.target_weight_kg || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Get gamification data
  const gamification = useMemo(() => calculateGamification(data, user), [data, user]);

  // Daily motivational quotes
  const motivationalQuotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Success is not final, failure is not fatal. - Winston Churchill",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "It does not matter how slowly you go as long as you do not stop. - Confucius",
    "Everything you want is on the other side of fear. - Jack Canfield",
    "Your limitation—it's only your imagination.",
    "Great things never come from comfort zones.",
    "Dream it. Believe it. Build it. - Thomas Keller",
    "Do something today that your future self will thank you for.",
    "Little things make big days.",
    "It's going to be hard, but hard does not mean impossible.",
    "Don't watch the clock; do what it does. Keep going.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Your body can stand almost anything. It's your mind that you need to convince.",
    "Whether you think you can, or you think you can't—you're right. - Henry Ford",
    "Motivation is what gets you started. Habit is what keeps you going.",
    "You don't have to be great to start, but you have to start to be great.",
    "A champion is defined not by their wins but by how many times they can rise when they fall.",
    "The only impossible journey is the one you never begin."
  ];

  const getDailyQuote = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    return motivationalQuotes[dayOfYear % motivationalQuotes.length];
  };

  // Prevent parent page scrolling when modal is open
  useEffect(() => {
    if (showWeightEditor || showMacrosModal || showGoalSelector) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showWeightEditor, showMacrosModal, showGoalSelector]);

  if (!user) return <div className="container text-center py-20">Loading...</div>;

  const remainingCalories = (user.daily_calorie_target || 2000) - (data.todayMacros?.calories || 0);
  const remainingProtein = (user.daily_protein_g || 180) - (data.todayMacros?.protein_g || 0);
  const remainingCarbs = (user.daily_carbs_g || 250) - (data.todayMacros?.carbs_g || 0);
  const remainingFat = (user.daily_fat_g || 65) - (data.todayMacros?.fat_g || 0);

  const formatValue = (value) => {
    if (value >= 0) {
      return Math.round(value);
    } else {
      return '+' + Math.round(Math.abs(value));
    }
  };

  const mealCount = (data.meals || []).length;
  const today = new Date().toISOString().split('T')[0];
  const workoutCount = (data.workouts || []).filter(w => {
    const workoutDate = new Date(w.date).toISOString().split('T')[0];
    return workoutDate === today;
  }).length;

  const handleSaveWeights = async () => {
    if (!currentWeight || !targetWeight) {
      setMessage('Please fill in all fields');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setLoading(true);
      await userAPI.updateProfile(user.id, {
        current_weight_kg: parseFloat(currentWeight),
        target_weight_kg: parseFloat(targetWeight)
      });

      await userAPI.logWeight(user.id, parseFloat(currentWeight));
      
      setCurrentWeight(parseFloat(currentWeight));
      setTargetWeight(parseFloat(targetWeight));
      setMessage('✓ Weight updated successfully!');
      setShowWeightEditor(false);
      setTimeout(() => {
        onUpdate?.();
        setMessage('');
      }, 500);
    } catch (error) {
      console.error('Error updating weight:', error);
      setMessage('Failed to update weight');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLog = async (weight) => {
    try {
      setLoading(true);
      await userAPI.updateProfile(user.id, { current_weight_kg: weight });
      await userAPI.logWeight(user.id, weight);
      setCurrentWeight(weight);
      setMessage(`✓ Weight logged: ${weight}kg`);
      setTimeout(() => {
        onUpdate?.();
        setMessage('');
      }, 500);
    } catch (error) {
      console.error('Error logging weight:', error);
      setMessage('Failed to log weight');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const calculateMacros = (goal) => {
    const weight = user?.current_weight_kg || 75;
    const age = user?.age || 25;
    const activityLevel = user?.activity_level || 'moderate';
    const gender = user?.gender || 'male';

    // Calculate BMR using Mifflin-St Jeor equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * (user?.height_cm || 175) - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * (user?.height_cm || 160) - 5 * age - 161;
    }

    // Apply activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };
    const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

    // Apply goal adjustments
    let calories, protein, carbs, fat;
    if (goal === 'cutting') {
      calories = Math.round(tdee - 500); // 500 cal deficit
      protein = Math.round(weight * 2.2); // High protein for muscle retention
      fat = Math.round(calories * 0.25 / 9);
      carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
    } else if (goal === 'bulking') {
      calories = Math.round(tdee + 500); // 500 cal surplus
      protein = Math.round(weight * 1.8);
      fat = Math.round(calories * 0.25 / 9);
      carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
    } else {
      // maintenance
      calories = Math.round(tdee);
      protein = Math.round(weight * 1.6);
      fat = Math.round(calories * 0.25 / 9);
      carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
    }

    return { calories, protein, carbs, fat };
  };

  const handleSelectGoal = async (goal) => {
    try {
      setLoading(true);
      const macros = calculateMacros(goal);

      await userAPI.updateProfile(user.id, {
        goal: goal,
        daily_calorie_target: macros.calories,
        daily_protein_g: macros.protein,
        daily_carbs_g: macros.carbs,
        daily_fat_g: macros.fat
      });

      setMessage(`✓ Goal set to ${goal.toUpperCase()}!`);
      setShowGoalSelector(false);
      setTimeout(() => {
        onUpdate?.();
        setMessage('');
      }, 500);
    } catch (error) {
      console.error('Error updating goal:', error);
      setMessage('Failed to update goal');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="header-section">
        <h1>Today</h1>
        <p>{new Date().toLocaleDateString()}</p>
      </div>

      {/* Level & XP Bar */}
      <div className="card level-card">
        <div className="level-header">
          <div className="level-badge">{gamification.level}</div>
          <div className="level-info">
            <h3>Level {gamification.level}</h3>
            <p>{gamification.xpInLevel} / {gamification.xpToNextLevel} XP</p>
          </div>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${gamification.levelProgress}%` }}></div>
        </div>
      </div>

      {/* Streak Card */}
      <div className="card streak-card">
        <div className="trophy">🏆</div>
        <div className="streak-info">
          <h2>{data.streak || 0} days</h2>
          <p>Current Streak</p>
        </div>
      </div>

      {/* Daily Challenges */}
      <div className="card challenges-card">
        <h3>Daily Challenges ({gamification.completedChallenges}/{gamification.dailyChallenges.length})</h3>
        <div className="challenges-grid">
          {gamification.dailyChallenges.map(challenge => (
            <div key={challenge.id} className={`challenge-item ${challenge.completed ? 'completed' : ''}`}>
              <div className="challenge-icon">{challenge.icon}</div>
              <div className="challenge-info">
                <p>{challenge.name}</p>
                <span className="challenge-xp">+{challenge.xp} XP</span>
              </div>
              {challenge.completed && <div className="challenge-check">✓</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      {gamification.badges.length > 0 && (
        <div className="card badges-card">
          <h3>Achievements ({gamification.badges.length})</h3>
          <div className="badges-grid">
            {gamification.badges.map(badge => (
              <div key={badge.id} className="badge" title={badge.name}>
                <div className="badge-icon">{badge.icon}</div>
                <p>{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Progress */}
      <div className="card progress-card">
        <h3>Today's Progress</h3>
        <div className="progress-grid">
          <div className="progress-item">
            <div className="progress-icon">🏋️</div>
            <div className="progress-value">{workoutCount}</div>
            <p>Workouts</p>
          </div>
          <div className="progress-item">
            <div className="progress-icon">🍽️</div>
            <div className="progress-value">{mealCount}</div>
            <p>Meals</p>
          </div>
          <div className="progress-item">
            <div className="progress-icon">🔥</div>
            <div className="progress-value">{Math.round(data.todayMacros?.calories || 0)}</div>
            <p>Calories</p>
          </div>
          <div className="progress-item">
            <div className="progress-icon">💪</div>
            <div className="progress-value">{Math.round(data.todayMacros?.protein_g || 0)}g</div>
            <p>Protein</p>
          </div>
        </div>
      </div>

      {/* Weight Progress */}
      <div className="card" onClick={() => setShowWeightEditor(true)} style={{ cursor: 'pointer' }}>
        <h3>Weight Progress</h3>
        <p className="text-muted">Current: {user?.current_weight_kg || 'N/A'}kg → Target: {user?.target_weight_kg || 'N/A'}kg</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{
            width: `${user && user.current_weight_kg !== user.target_weight_kg ? Math.min(Math.abs((user.current_weight_kg - user.target_weight_kg) / 10) * 10, 100) : 0}%`
          }}></div>
        </div>
        <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>Tap to edit →</p>
      </div>

      {/* Remaining Macros */}
      <div className="card macros-status">
        <h3>Remaining Macros</h3>
        <div className="remaining-grid">
          <div className="remaining-item">
            <div className="remaining-value" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
              {formatValue(remainingCalories)}
            </div>
            <p>Calories</p>
          </div>
          <div className="remaining-item">
            <div className="remaining-value" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}>
              {formatValue(remainingProtein)}g
            </div>
            <p>Protein</p>
          </div>
          <div className="remaining-item">
            <div className="remaining-value" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              {formatValue(remainingCarbs)}g
            </div>
            <p>Carbs</p>
          </div>
          <div className="remaining-item">
            <div className="remaining-value" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              {formatValue(remainingFat)}g
            </div>
            <p>Fat</p>
          </div>
        </div>
      </div>

      {/* Goals & Macros Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
        {/* Goals Button */}
        <button
          className="card"
          onClick={() => setShowGoalSelector(true)}
          style={{
            cursor: 'pointer',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(6, 182, 212, 0.05))',
            padding: '16px',
            borderRadius: '16px',
            margin: 0,
          }}
        >
          <h3 style={{ fontSize: '13px', marginBottom: '12px' }}>🎯 Goal</h3>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--text-light)' }}>Current Goal</p>
            <p style={{ margin: '4px 0', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-dark)' }}>{user?.goal ? user.goal.charAt(0).toUpperCase() + user.goal.slice(1) : 'Not Set'}</p>
            <p style={{ margin: '4px 0', fontSize: '11px', color: 'var(--text-light)' }}>Click to change</p>
          </div>
        </button>

        {/* Macros Button */}
        <button
          className="card macros-quick-view"
          onClick={() => setShowMacrosModal(true)}
          style={{
            cursor: 'pointer',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(6, 182, 212, 0.05))',
            padding: '16px',
            borderRadius: '16px',
            margin: 0,
          }}
        >
          <h3 style={{ fontSize: '13px', marginBottom: '12px' }}>📊 Macros</h3>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--text-light)' }}>Today\'s Intake</p>
            <p style={{ margin: '4px 0', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-dark)' }}>{Math.round(data.todayMacros?.calories || 0)} cal</p>
            <p style={{ margin: '4px 0', fontSize: '11px', color: 'var(--text-light)' }}>Click to view</p>
          </div>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons" style={{ marginBottom: '24px' }}>
        <button className="btn btn-primary" onClick={() => onNavigate?.('Workouts')}>Log Workout</button>
        <button className="btn btn-secondary" onClick={() => onNavigate?.('Nutrition')}>Log Food</button>
      </div>

      {/* Quick Stats */}
      <div className="card">
        <h3>Recommendations</h3>
        <ul className="recommendations">
          <li>✓ Try 4x8 Squats at higher weight</li>
          <li>✓ Add Chicken Breast (45g protein)</li>
          <li>✓ {remainingCalories > 0 ? `${Math.round(remainingCalories)} calories remaining` : `${Math.round(Math.abs(remainingCalories))} calories over`}</li>
        </ul>
      </div>

      {/* Daily Motivational Quote */}
      <div className="motivational-quote-container">
        <div className="quote-box">
          <div className="quote-text">
            {(() => {
              const quote = getDailyQuote();
              const parts = quote.split(' - ');
              const quoteText = parts[0];
              const author = parts[1] || '';
              return (
                <>
                  <div className="quote-content">{quoteText}</div>
                  {author && <div className="quote-author">— {author}</div>}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Weight Editor Modal */}
      {showWeightEditor && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowWeightEditor(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Weight Goals</h3>

            <div className="form-group">
              <label>Current Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                placeholder="Enter current weight"
              />
            </div>

            <div className="form-group">
              <label>Target Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="Enter target weight"
              />
            </div>

            <div className="quick-log-section">
              <p className="text-muted">Quick log:</p>
              <div className="quick-log-grid">
                {[-0.5, 0, 0.5].map((offset) => (
                  <button
                    key={offset}
                    className="quick-log-btn"
                    onClick={() => handleQuickLog(parseFloat(currentWeight) + offset)}
                    disabled={loading}
                  >
                    {(parseFloat(currentWeight) + offset).toFixed(1)}kg
                  </button>
                ))}
              </div>
            </div>

            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={handleSaveWeights}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowWeightEditor(false);
                  setCurrentWeight(user?.current_weight_kg || '');
                  setTargetWeight(user?.target_weight_kg || '');
                }}
              >
                Cancel
              </button>
            </div>

            {message && <div className="message-alert">{message}</div>}
          </div>
        </div>
      )}

      {/* Goal Selector Modal */}
      {showGoalSelector && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowGoalSelector(false)}>
          <div className="modal-content goal-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', marginBottom: '8px', color: 'var(--text-dark)' }}>🎯 Choose Your Goal</h2>
              <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Select a fitness goal to auto-adjust your macro targets</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
              {/* Cutting Option */}
              <button
                onClick={() => handleSelectGoal('cutting')}
                disabled={loading}
                className="goal-card"
                style={{
                  padding: '24px',
                  border: user?.goal === 'cutting' ? '2px solid #8B5CF6' : '2px solid transparent',
                  borderRadius: '16px',
                  background: user?.goal === 'cutting'
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(139, 92, 246, 0.1))'
                    : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  textAlign: 'left',
                  color: 'var(--text-dark)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: user?.goal === 'cutting' ? '0 0 30px rgba(139, 92, 246, 0.3)' : 'none',
                  transform: user?.goal === 'cutting' ? 'scale(1.02)' : 'scale(1)',
                }}
                onMouseEnter={(e) => !loading && !user?.goal && (e.currentTarget.style.transform = 'scale(1.01)')}
                onMouseLeave={(e) => !loading && !user?.goal && (e.currentTarget.style.transform = 'scale(1)')}
              >
                {user?.goal === 'cutting' && <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '20px' }}>✓</div>}
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📉</div>
                <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '6px' }}>Cutting</div>
                <div style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '12px', lineHeight: '1.5' }}>Lose weight with a calorie deficit</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Daily Calories</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{Math.round(calculateMacros('cutting').calories)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Protein</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{Math.round(calculateMacros('cutting').protein)}g</div>
                  </div>
                </div>
              </button>

              {/* Maintenance Option */}
              <button
                onClick={() => handleSelectGoal('maintenance')}
                disabled={loading}
                className="goal-card"
                style={{
                  padding: '24px',
                  border: user?.goal === 'maintenance' ? '2px solid #06B6D4' : '2px solid transparent',
                  borderRadius: '16px',
                  background: user?.goal === 'maintenance'
                    ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(6, 182, 212, 0.1))'
                    : 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(6, 182, 212, 0.05))',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  textAlign: 'left',
                  color: 'var(--text-dark)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: user?.goal === 'maintenance' ? '0 0 30px rgba(6, 182, 212, 0.3)' : 'none',
                  transform: user?.goal === 'maintenance' ? 'scale(1.02)' : 'scale(1)',
                }}
                onMouseEnter={(e) => !loading && !user?.goal && (e.currentTarget.style.transform = 'scale(1.01)')}
                onMouseLeave={(e) => !loading && !user?.goal && (e.currentTarget.style.transform = 'scale(1)')}
              >
                {user?.goal === 'maintenance' && <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '20px' }}>✓</div>}
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚖️</div>
                <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '6px' }}>Maintenance</div>
                <div style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '12px', lineHeight: '1.5' }}>Stay at current weight</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(6, 182, 212, 0.2)' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Daily Calories</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{Math.round(calculateMacros('maintenance').calories)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Protein</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{Math.round(calculateMacros('maintenance').protein)}g</div>
                  </div>
                </div>
              </button>

              {/* Bulking Option */}
              <button
                onClick={() => handleSelectGoal('bulking')}
                disabled={loading}
                className="goal-card"
                style={{
                  padding: '24px',
                  border: user?.goal === 'bulking' ? '2px solid #10B981' : '2px solid transparent',
                  borderRadius: '16px',
                  background: user?.goal === 'bulking'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.1))'
                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  textAlign: 'left',
                  color: 'var(--text-dark)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: user?.goal === 'bulking' ? '0 0 30px rgba(16, 185, 129, 0.3)' : 'none',
                  transform: user?.goal === 'bulking' ? 'scale(1.02)' : 'scale(1)',
                }}
                onMouseEnter={(e) => !loading && !user?.goal && (e.currentTarget.style.transform = 'scale(1.01)')}
                onMouseLeave={(e) => !loading && !user?.goal && (e.currentTarget.style.transform = 'scale(1)')}
              >
                {user?.goal === 'bulking' && <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '20px' }}>✓</div>}
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📈</div>
                <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '6px' }}>Bulking</div>
                <div style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '12px', lineHeight: '1.5' }}>Gain muscle with a calorie surplus</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Daily Calories</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{Math.round(calculateMacros('bulking').calories)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Protein</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{Math.round(calculateMacros('bulking').protein)}g</div>
                  </div>
                </div>
              </button>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => setShowGoalSelector(false)}
              style={{ width: '100%' }}
            >
              Close
            </button>

            {message && <div className="message-alert">{message}</div>}
          </div>
        </div>
      )}

      {/* Macros Modal */}
      {showMacrosModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowMacrosModal(false)}>
          <div className="modal-content macros-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', marginBottom: '8px', color: 'var(--text-dark)' }}>📊 Daily Macros</h2>
              <p style={{ color: 'var(--text-light)', fontSize: '13px' }}>Today's nutrition breakdown</p>
            </div>

            {/* Main Macros Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              {/* Protein */}
              <div style={{ padding: '20px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(6, 182, 212, 0.05)', textAlign: 'center', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>💪</div>
                <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Protein</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '4px' }}>{Math.round(data.todayMacros?.protein_g || 0)}g</div>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>/ {user?.daily_protein_g}g</div>
              </div>

              {/* Carbs */}
              <div style={{ padding: '20px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05)', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>🍞</div>
                <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Carbs</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '4px' }}>{Math.round(data.todayMacros?.carbs_g || 0)}g</div>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>/ {user?.daily_carbs_g}g</div>
              </div>

              {/* Fat */}
              <div style={{ padding: '20px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>🥑</div>
                <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fat</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10B981', marginBottom: '4px' }}>{Math.round(data.todayMacros?.fat_g || 0)}g</div>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>/ {user?.daily_fat_g}g</div>
              </div>

              {/* Calories */}
              <div style={{ padding: '20px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)', textAlign: 'center', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>🔥</div>
                <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Calories</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8B5CF6', marginBottom: '4px' }}>{Math.round(data.todayMacros?.calories || 0)}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>/ {user?.daily_calorie_target}</div>
              </div>
            </div>

            {/* Remaining Macros */}
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '2px solid rgba(139, 92, 246, 0.1)' }}>
              <h3 style={{ marginBottom: '18px', color: 'var(--text-dark)', fontSize: '16px', fontWeight: '700', textAlign: 'center' }}>Remaining to Consume</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Calories</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: remainingCalories > 0 ? '#10B981' : '#EF4444' }}>{remainingCalories > 0 ? '+' : ''}{Math.round(remainingCalories)}</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Protein</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: remainingProtein > 0 ? '#10B981' : '#EF4444' }}>{remainingProtein > 0 ? '+' : ''}{Math.round(remainingProtein)}g</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Carbs</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: remainingCarbs > 0 ? '#10B981' : '#EF4444' }}>{remainingCarbs > 0 ? '+' : ''}{Math.round(remainingCarbs)}g</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fat</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: remainingFat > 0 ? '#10B981' : '#EF4444' }}>{remainingFat > 0 ? '+' : ''}{Math.round(remainingFat)}g</div>
                </div>
              </div>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => setShowMacrosModal(false)}
              style={{ marginTop: '24px', width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
