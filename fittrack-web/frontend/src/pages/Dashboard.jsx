import React from 'react';
import './Dashboard.css';

const Dashboard = ({ user, data, onNavigate }) => {
  if (!user) return <div className="container text-center py-20">Loading...</div>;

  const remainingCalories = (user.daily_calorie_target || 2000) - (data.todayMacros?.calories || 0);
  const remainingProtein = (user.daily_protein_g || 180) - (data.todayMacros?.protein_g || 0);
  const remainingCarbs = (user.daily_carbs_g || 250) - (data.todayMacros?.carbs_g || 0);
  const remainingFat = (user.daily_fat_g || 65) - (data.todayMacros?.fat_g || 0);

  return (
    <div className="dashboard">
      <div className="header-section">
        <h1>Today</h1>
        <p>{new Date().toLocaleDateString()}</p>
      </div>

      {/* Streak Card */}
      <div className="card streak-card">
        <div className="trophy">🏆</div>
        <div className="streak-info">
          <h2>{data.streak || 0} days</h2>
          <p>Current Streak</p>
        </div>
      </div>

      {/* Weight Progress */}
      <div className="card">
        <h3>Weight Progress</h3>
        <p className="text-muted">Current: {user.current_weight_kg}kg → Target: {user.target_weight_kg}kg</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{
            width: `${Math.min(((user.current_weight_kg - user.target_weight_kg) / (user.current_weight_kg - user.target_weight_kg)) * 100, 100)}%`
          }}></div>
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
          <li>✓ You're {remainingCalories > 0 ? `${Math.round(remainingCalories)} calories` : 'over'} under target</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
