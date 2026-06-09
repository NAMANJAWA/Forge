import React, { useState, useEffect } from 'react';
import './Analytics.css';
import { analyticsAPI } from '../utils/api';

const Analytics = ({ userId, data }) => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [macroAdherence, setMacroAdherence] = useState(null);
  const [volumeData, setVolumeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [weekly, adherence, volume] = await Promise.all([
          analyticsAPI.getWeeklySummary(userId),
          analyticsAPI.getMacroAdherence(userId),
          analyticsAPI.getVolume(userId)
        ]);
        setWeeklyData(weekly.data);
        setMacroAdherence(adherence.data);
        setVolumeData(volume.data || []);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return <div className="analytics"><p>Loading analytics...</p></div>;
  }

  const todayWorkouts = (data.workouts || []).filter(w => {
    const workoutDate = new Date(w.date).toISOString().split('T')[0];
    return workoutDate === new Date().toISOString().split('T')[0];
  }).length;

  const todayMeals = (data.meals || []).length;

  // Calculate average daily calories and macros this week
  const avgDailyCalories = weeklyData?.total_calories ? Math.round(weeklyData.total_calories / 7) : 0;
  const avgDailyProtein = weeklyData?.total_protein_g ? Math.round(weeklyData.total_protein_g / 7) : 0;

  // Get top 3 exercises by max weight
  const topExercises = volumeData.slice(0, 5);

  // Calculate insights
  const getInsights = () => {
    const insights = [];

    if (weeklyData?.workouts_completed >= 4) {
      insights.push('💪 Solid week! You\'ve crushed 4+ workouts.');
    } else if (weeklyData?.workouts_completed > 0) {
      insights.push(`🏋️ Good start! ${7 - weeklyData.workouts_completed} more workouts to hit 7 this week.`);
    } else {
      insights.push('🎯 Time to get moving! Log your first workout.');
    }

    if (avgDailyCalories > 0) {
      insights.push(`📊 Average daily intake: ${avgDailyCalories} cal`);
    }

    if (avgDailyProtein > 0) {
      insights.push(`🥩 Average daily protein: ${avgDailyProtein}g`);
    }

    if (topExercises.length > 0) {
      insights.push(`🏆 Your strongest: ${topExercises[0].exercise_name} at ${Math.round(topExercises[0].max_weight)}kg`);
    }

    if (macroAdherence?.percentage > 75) {
      insights.push('🎉 Excellent macro adherence! Stay consistent!');
    } else if (macroAdherence?.percentage > 50) {
      insights.push('✅ Good macro tracking. Keep improving!');
    }

    if (todayWorkouts === 0 && todayMeals === 0) {
      insights.push('📱 Haven\'t logged anything today. Start with a workout or meal!');
    } else if (todayWorkouts > 0 && todayMeals === 0) {
      insights.push('🍽️ Great workout! Now log your meals to complete today.');
    } else if (todayWorkouts === 0 && todayMeals > 0) {
      insights.push('🏋️ You\'ve logged meals. Time for a workout?');
    }

    return insights;
  };

  const insights = getInsights();

  return (
    <div className="analytics">
      <div className="header-section">
        <h2>📈 Analytics</h2>
        <p>Track your progress and insights</p>
      </div>

      {/* This Week Summary */}
      <div className="card summary-card">
        <h3>This Week</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-value">{weeklyData?.workouts_completed || 0}</div>
            <p>Workouts</p>
          </div>
          <div className="summary-item">
            <div className="summary-value">{avgDailyCalories}</div>
            <p>Avg Daily Cal</p>
          </div>
          <div className="summary-item">
            <div className="summary-value">{avgDailyProtein}g</div>
            <p>Avg Protein</p>
          </div>
          <div className="summary-item">
            <div className="summary-value">{macroAdherence?.percentage || 0}%</div>
            <p>Adherence</p>
          </div>
        </div>
      </div>

      {/* Today's Activity */}
      <div className="card activity-card">
        <h3>Today's Activity</h3>
        <div className="activity-grid">
          <div className="activity-item">
            <div className="activity-icon">🏋️</div>
            <div className="activity-info">
              <div className="activity-value">{todayWorkouts}</div>
              <p>Workouts</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">🍽️</div>
            <div className="activity-info">
              <div className="activity-value">{todayMeals}</div>
              <p>Meals</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">🔥</div>
            <div className="activity-info">
              <div className="activity-value">{Math.round(data.todayMacros?.calories || 0)}</div>
              <p>Calories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Macro Adherence */}
      {macroAdherence && (
        <div className="card">
          <h3>Macro Adherence</h3>
          <p className="text-muted">{macroAdherence.adhered || 0} out of {macroAdherence.total || 7} days within 10% of target</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ 
                width: `${Math.min(macroAdherence.percentage || 0, 100)}%`,
                background: macroAdherence.percentage > 75 ? '#10B981' : macroAdherence.percentage > 50 ? '#F59E0B' : '#EF4444'
              }}
            ></div>
          </div>
          <p style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
            {macroAdherence.percentage > 75 ? '✅ Excellent consistency!' : macroAdherence.percentage > 50 ? '👍 Good effort!' : '📈 Room for improvement'}
          </p>
        </div>
      )}

      {/* Top Exercises */}
      {topExercises.length > 0 && (
        <div className="card">
          <h3>Top Exercises (by Max Weight)</h3>
          <div className="exercises-table">
            {topExercises.map((ex, idx) => (
              <div key={idx} className="exercise-row">
                <div className="exercise-rank">{idx + 1}</div>
                <div className="exercise-info">
                  <div className="exercise-name">{ex.exercise_name}</div>
                  <div className="exercise-stats">{ex.total_sets || 0} sets</div>
                </div>
                <div className="exercise-weight">{Math.round(ex.max_weight || 0)}kg</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Breakdown */}
      <div className="card">
        <h3>Weekly Macros</h3>
        <div className="macro-breakdown">
          <div className="macro-bar">
            <div className="macro-label">Calories</div>
            <div className="macro-value">{Math.round(weeklyData?.total_calories || 0)}</div>
          </div>
          <div className="macro-bar">
            <div className="macro-label">Protein</div>
            <div className="macro-value">{Math.round(weeklyData?.total_protein_g || 0)}g</div>
          </div>
          <div className="macro-bar">
            <div className="macro-label">Carbs</div>
            <div className="macro-value">{Math.round(weeklyData?.total_carbs_g || 0)}g</div>
          </div>
          <div className="macro-bar">
            <div className="macro-label">Fat</div>
            <div className="macro-value">{Math.round(weeklyData?.total_fat_g || 0)}g</div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="card insights-card">
        <h3>💡 Insights</h3>
        <div className="insights-list">
          {insights.length > 0 ? (
            insights.map((insight, idx) => (
              <div key={idx} className="insight-item">
                <p>{insight}</p>
              </div>
            ))
          ) : (
            <p className="text-muted">Start logging to get personalized insights!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
