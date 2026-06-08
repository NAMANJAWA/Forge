import React from 'react';
import './Analytics.css';

const Analytics = ({ userId, data }) => {
  const weeklySummary = data.weeklySummary || {};
  const macroAdherence = data.macroAdherence || { percentage: 0 };
  const volume = data.volume || [];

  return (
    <div className="analytics">
      <h2>Analytics</h2>

      {/* Weekly Summary */}
      <div className="card summary-card">
        <h3>Weekly Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-value">{weeklySummary.workouts_completed || 0}</div>
            <p>Workouts</p>
          </div>
          <div className="summary-item">
            <div className="summary-value">{Math.round(weeklySummary.total_protein_g || 0)}g</div>
            <p>Protein</p>
          </div>
          <div className="summary-item">
            <div className="summary-value">{Math.round(weeklySummary.total_calories || 0)}</div>
            <p>Calories</p>
          </div>
          <div className="summary-item">
            <div className="summary-value">{macroAdherence.percentage || 0}%</div>
            <p>Adherence</p>
          </div>
        </div>
      </div>

      {/* Macro Adherence */}
      <div className="card">
        <h3>Macro Compliance</h3>
        <p className="text-muted">{macroAdherence.adhered || 0} out of {macroAdherence.total || 0} days on target</p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${macroAdherence.percentage || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Volume Progression */}
      <div className="card">
        <h3>Top Exercises</h3>
        <div className="exercises-table">
          <div className="table-header">
            <div>Exercise</div>
            <div>Max Weight</div>
            <div>Sets Done</div>
          </div>
          {volume.slice(0, 5).map((ex, idx) => (
            <div key={idx} className="table-row">
              <div>{ex.exercise_name}</div>
              <div>{Math.round(ex.max_weight || 0)}kg</div>
              <div>{ex.total_sets || 0}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card recommendations-card">
        <h3>💡 Insights</h3>
        <ul className="insights-list">
          <li>You've completed {weeklySummary.workouts_completed || 0} workouts this week!</li>
          <li>Your macro adherence is {macroAdherence.percentage || 0}% — keep it consistent!</li>
          <li>Consider increasing protein intake on rest days.</li>
          <li>Track 5 more meals this week to improve data accuracy.</li>
        </ul>
      </div>
    </div>
  );
};

export default Analytics;
