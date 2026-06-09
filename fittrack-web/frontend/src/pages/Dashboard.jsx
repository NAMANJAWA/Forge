import React, { useState, useMemo } from 'react';
import './Dashboard.css';
import { userAPI } from '../utils/api';
import calculateGamification from '../utils/gamification';

const Dashboard = ({ user, data, onNavigate, onUpdate }) => {
  const [showWeightEditor, setShowWeightEditor] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(user?.current_weight_kg || '');
  const [targetWeight, setTargetWeight] = useState(user?.target_weight_kg || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Get gamification data
  const gamification = useMemo(() => calculateGamification(data, user), [data, user]);

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
        <p className="text-muted">Current: {user.current_weight_kg}kg → Target: {user.target_weight_kg}kg</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{
            width: `${Math.min(((user.current_weight_kg - user.target_weight_kg) / (user.current_weight_kg - user.target_weight_kg)) * 100, 100)}%`
          }}></div>
        </div>
        <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#4ECDC4' }}>Tap to edit →</p>
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

      {/* Macros Ring */}
      <div className="card macros-card">
        <h3>Macros</h3>
        <div className="macro-grid">
          <div className="macro-item">
            <div className="macro-ring">
              <div className="macro-value">{Math.round(data.todayMacros?.protein_g || 0)}</div>
              <div className="macro-target">{user.daily_protein_g}g</div>
            </div>
            <p>Protein</p>
          </div>
          <div className="macro-item">
            <div className="macro-ring">
              <div className="macro-value">{Math.round(data.todayMacros?.carbs_g || 0)}</div>
              <div className="macro-target">{user.daily_carbs_g}g</div>
            </div>
            <p>Carbs</p>
          </div>
          <div className="macro-item">
            <div className="macro-ring">
              <div className="macro-value">{Math.round(data.todayMacros?.fat_g || 0)}</div>
              <div className="macro-target">{user.daily_fat_g}g</div>
            </div>
            <p>Fat</p>
          </div>
          <div className="macro-item">
            <div className="macro-ring">
              <div className="macro-value">{Math.round(data.todayMacros?.calories || 0)}</div>
              <div className="macro-target">{user.daily_calorie_target}</div>
            </div>
            <p>Calories</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
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

      {/* Weight Editor Modal */}
      {showWeightEditor && (
        <div className="modal-overlay" onClick={() => setShowWeightEditor(false)}>
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
    </div>
  );
};

export default Dashboard;
