import React, { useState, useEffect } from 'react';
import './WeightProgress.css';
import { userAPI } from '../utils/api';

const WeightProgress = ({ user, onUpdate }) => {
  const [currentWeight, setCurrentWeight] = useState(user?.current_weight_kg || '');
  const [targetWeight, setTargetWeight] = useState(user?.target_weight_kg || '');
  const [weightHistory, setWeightHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user?.id) {
      fetchWeightHistory();
    }
  }, [user?.id]);

  const fetchWeightHistory = async () => {
    try {
      const response = await userAPI.getWeightHistory(user.id);
      setWeightHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching weight history:', error);
    }
  };

  const handleSaveWeights = async () => {
    if (!currentWeight || !targetWeight) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    try {
      setLoading(true);
      await userAPI.updateProfile(user.id, {
        current_weight_kg: parseFloat(currentWeight),
        target_weight_kg: parseFloat(targetWeight)
      });

      // Log the new weight
      await userAPI.logWeight(user.id, parseFloat(currentWeight));
      
      setEditing(false);
      showMessage('Weight updated successfully!', 'success');
      onUpdate?.();
      fetchWeightHistory();
    } catch (error) {
      console.error('Error updating weight:', error);
      showMessage('Failed to update weight', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLog = async (weight) => {
    try {
      setLoading(true);
      setCurrentWeight(weight);
      await userAPI.updateProfile(user.id, { current_weight_kg: weight });
      await userAPI.logWeight(user.id, weight);
      showMessage(`Weight logged: ${weight}kg`, 'success');
      fetchWeightHistory();
      onUpdate?.();
    } catch (error) {
      console.error('Error logging weight:', error);
      showMessage('Failed to log weight', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const weightDifference = (user?.current_weight_kg - user?.target_weight_kg)?.toFixed(1);
  const progressPercentage = user?.target_weight_kg
    ? Math.max(0, Math.min(100, ((user.current_weight_kg - user.target_weight_kg) / (user.current_weight_kg - user.target_weight_kg)) * 100))
    : 0;

  return (
    <div className="weight-progress">
      <h2>Weight Progress</h2>

      {/* Current Status Card */}
      <div className="card status-card">
        <div className="status-grid">
          <div className="status-item">
            <div className="status-label">Current Weight</div>
            <div className="status-value">{user?.current_weight_kg}kg</div>
          </div>
          <div className="status-item">
            <div className="status-label">Target Weight</div>
            <div className="status-value">{user?.target_weight_kg}kg</div>
          </div>
          <div className="status-item">
            <div className="status-label">To Go</div>
            <div className="status-value" style={{ color: weightDifference > 0 ? '#FF6B6B' : '#4ECDC4' }}>
              {Math.abs(weightDifference)}kg
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <p className="progress-text">{progressPercentage.toFixed(0)}% to goal</p>
        </div>
      </div>

      {/* Edit Weights */}
      <div className="card edit-card">
        {!editing ? (
          <button className="btn btn-primary full-width" onClick={() => setEditing(true)}>
            Edit Weight Goals
          </button>
        ) : (
          <div className="edit-form">
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
                  setEditing(false);
                  setCurrentWeight(user?.current_weight_kg || '');
                  setTargetWeight(user?.target_weight_kg || '');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Log */}
      <div className="card">
        <h3>Quick Log</h3>
        <p className="text-muted">Log today's weight quickly</p>
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

      {/* Weight History */}
      <div className="card">
        <h3>Weight History</h3>
        {weightHistory.length > 0 ? (
          <div className="history-list">
            {weightHistory.slice(0, 10).map((entry, idx) => (
              <div key={idx} className="history-item">
                <div className="history-date">{new Date(entry.date).toLocaleDateString()}</div>
                <div className="history-weight">{entry.weight_kg}kg</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">No weight history yet. Start logging!</p>
        )}
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

export default WeightProgress;
