import React, { useState, useEffect } from 'react';
import { mealAPI } from '../utils/api';
import './Meals.css';

const Meals = ({ userId, data, onMealUpdate }) => {
  const [meals, setMeals] = useState([]);
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMeals(data.meals || []);
  }, [data.meals]);

  const handleDeleteMeal = async (mealId) => {
    if (!window.confirm('Are you sure you want to delete this meal?')) {
      return;
    }

    try {
      await mealAPI.deleteMeal(mealId);
      setMeals(meals.filter(m => m.id !== mealId));
      setMessage('✓ Meal deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
      onMealUpdate?.();
    } catch (error) {
      console.error('Error deleting meal:', error);
      setMessage('Failed to delete meal');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getMealTotals = (items) => {
    let totals = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
    if (items) {
      items.forEach(item => {
        const multiplier = item.portion_size || 1;
        totals.calories += (item.calories || 0) * multiplier;
        totals.protein_g += (item.protein_g || 0) * multiplier;
        totals.carbs_g += (item.carbs_g || 0) * multiplier;
        totals.fat_g += (item.fat_g || 0) * multiplier;
      });
    }
    return totals;
  };

  return (
    <div className="meals">
      <div className="header-section">
        <h2>🍽️ Today's Meals</h2>
        <p>View and manage your logged meals</p>
      </div>

      {meals && meals.length > 0 ? (
        <div className="meals-list">
          {meals.map((meal, idx) => {
            const totals = getMealTotals(meal.items);
            const isExpanded = expandedMeal === idx;

            return (
              <div key={idx} className="meal-card">
                <div
                  className="meal-header"
                  onClick={() => setExpandedMeal(isExpanded ? null : idx)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="meal-info">
                    <span className="meal-type">{meal.meal_type?.toUpperCase() || 'MEAL'}</span>
                    <span className="meal-time">{new Date(meal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="meal-macros-summary">
                    <span className="macro-tag">{Math.round(totals.calories)} cal</span>
                    <span className="macro-tag">{Math.round(totals.protein_g)}g P</span>
                  </div>
                  <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                </div>

                {isExpanded && (
                  <div className="meal-expanded">
                    <div className="meal-items">
                      {meal.items && meal.items.length > 0 ? (
                        meal.items.map((item, itemIdx) => {
                          const itemTotal = {
                            calories: (item.calories || 0) * (item.portion_size || 1),
                            protein: (item.protein_g || 0) * (item.portion_size || 1),
                            carbs: (item.carbs_g || 0) * (item.portion_size || 1),
                            fat: (item.fat_g || 0) * (item.portion_size || 1),
                          };

                          return (
                            <div key={itemIdx} className="meal-item-detail">
                              <div className="item-name">{item.name}</div>
                              <div className="item-portion">
                                {item.portion_size > 1 ? `${item.portion_size}x` : '1x'} serving
                              </div>
                              <div className="item-macros">
                                <span>{Math.round(itemTotal.calories)} cal</span>
                                <span>{Math.round(itemTotal.protein)}g P</span>
                                <span>{Math.round(itemTotal.carbs)}g C</span>
                                <span>{Math.round(itemTotal.fat)}g F</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-muted">No items in this meal</p>
                      )}
                    </div>

                    <div className="meal-totals">
                      <div className="total-item">
                        <span>Calories</span>
                        <span className="total-value">{Math.round(totals.calories)}</span>
                      </div>
                      <div className="total-item">
                        <span>Protein</span>
                        <span className="total-value">{Math.round(totals.protein_g)}g</span>
                      </div>
                      <div className="total-item">
                        <span>Carbs</span>
                        <span className="total-value">{Math.round(totals.carbs_g)}g</span>
                      </div>
                      <div className="total-item">
                        <span>Fat</span>
                        <span className="total-value">{Math.round(totals.fat_g)}g</span>
                      </div>
                    </div>

                    <button
                      className="btn-delete-meal"
                      onClick={() => handleDeleteMeal(meal.id)}
                    >
                      🗑️ Delete Meal
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="text-muted">No meals logged yet</p>
          <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Go to Nutrition tab to add meals</p>
        </div>
      )}

      {message && <div className="message-alert">{message}</div>}
    </div>
  );
};

export default Meals;
