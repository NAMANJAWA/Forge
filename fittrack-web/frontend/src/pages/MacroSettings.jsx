import React, { useState } from 'react';
import './MacroSettings.css';
import { userAPI } from '../utils/api';

const MacroSettings = ({ user, onUpdate }) => {
  const [goal, setGoal] = useState(user?.goal || 'maintain');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const goalOptions = [
    { value: 'cut', label: '🔻 Cut (Lose Weight)', description: 'Caloric deficit, preserve muscle' },
    { value: 'maintain', label: '⚖️ Maintain', description: 'Stay at current weight' },
    { value: 'bulk', label: '🔺 Bulk (Gain Weight)', description: 'Caloric surplus, build muscle' }
  ];

  const getMacroInfo = () => {
    const weight = user?.target_weight_kg || user?.current_weight_kg || 75;
    
    let info = {
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0,
      description: ''
    };

    if (goal === 'bulk') {
      info.protein = Math.round(weight * 2.0);
      info.carbs = Math.round(weight * 5.0);
      info.fat = Math.round(weight * 1.0);
      info.calories = (info.protein * 4) + (info.carbs * 4) + (info.fat * 9);
      info.description = 'Optimized for muscle growth with surplus calories';
    } else if (goal === 'cut') {
      info.protein = Math.round(weight * 2.0);
      info.fat = Math.round(weight * 1.0);
      info.description = 'High protein to preserve muscle in deficit';
      info.calories = user?.daily_calorie_target || 2000;
      info.carbs = Math.round((info.calories - (info.protein * 4) - (info.fat * 9)) / 4);
    } else {
      info.protein = Math.round(weight * 1.6);
      info.fat = Math.round(weight * 0.9);
      info.description = 'Balanced macros for weight maintenance';
      info.calories = user?.daily_calorie_target || 2500;
      info.carbs = Math.round((info.calories - (info.protein * 4) - (info.fat * 9)) / 4);
    }

    return info;
  };

  const handleGoalChange = async (newGoal) => {
    try {
      setLoading(true);
      await userAPI.updateProfile(user.id, { goal: newGoal });
      setGoal(newGoal);
      showMessage('Goal updated! Macros recalculated.', 'success');
      onUpdate?.();
    } catch (error) {
      console.error('Error updating goal:', error);
      showMessage('Failed to update goal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const macroInfo = getMacroInfo();

  return (
    <div className="macro-settings">
      <h2>Nutrition Goals</h2>

      {/* Goal Selection */}
      <div className="goals-section">
        {goalOptions.map((option) => (
          <div
            key={option.value}
            className={`goal-card ${goal === option.value ? 'active' : ''}`}
            onClick={() => handleGoalChange(option.value)}
            style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            <div className="goal-title">{option.label}</div>
            <div className="goal-description">{option.description}</div>
          </div>
        ))}
      </div>

      {/* Current Macros Display */}
      <div className="card macros-display">
        <h3>Daily Targets ({goal.toUpperCase()})</h3>
        <p className="text-muted">{macroInfo.description}</p>

        <div className="macros-grid">
          <div className="macro-box protein">
            <div className="macro-label">Protein</div>
            <div className="macro-value">{macroInfo.protein}g</div>
            <div className="macro-ratio">{(macroInfo.protein * 4)} cal</div>
          </div>
          <div className="macro-box carbs">
            <div className="macro-label">Carbs</div>
            <div className="macro-value">{macroInfo.carbs}g</div>
            <div className="macro-ratio">{(macroInfo.carbs * 4)} cal</div>
          </div>
          <div className="macro-box fat">
            <div className="macro-label">Fat</div>
            <div className="macro-value">{macroInfo.fat}g</div>
            <div className="macro-ratio">{(macroInfo.fat * 9)} cal</div>
          </div>
        </div>

        <div className="calorie-summary">
          <div className="summary-item">
            <span>Total Calories</span>
            <span className="value">{macroInfo.calories} cal</span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="info-section">
        <div className="card info-card">
          <h4>💡 How It Works</h4>
          <ul>
            <li><strong>Cutting:</strong> 2g protein/kg, 1g fat/kg, remaining carbs → builds muscle while losing fat</li>
            <li><strong>Bulking:</strong> 2g protein/kg, 5g carbs/kg, 1g fat/kg → maximizes muscle growth</li>
            <li><strong>Maintaining:</strong> 1.6g protein/kg, 0.9g fat/kg, remaining carbs → stable weight</li>
          </ul>
        </div>

        <div className="card info-card">
          <h4>📊 Reference Weight</h4>
          <p>Macros are calculated based on your target weight: <strong>{user?.target_weight_kg}kg</strong></p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>This helps ensure consistent macros as you progress toward your goal.</p>
        </div>
      </div>

      {/* Message Notification */}
      {message.text && (
        <div className={`notification notification-${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default MacroSettings;
