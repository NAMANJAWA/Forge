import React, { useState, useEffect } from 'react';
import { mealAPI } from '../utils/api';
import './Nutrition.css';

const Nutrition = ({ userId, user, data, onMealSaved }) => {
  const [view, setView] = useState('add');
  const [foods, setFoods] = useState(data.foods || []);
  const [meals, setMeals] = useState(data.meals || []);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [customFood, setCustomFood] = useState({
    name: '',
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    calories: 0,
    serving_size: '1 serving'
  });
  const [todayMacros, setTodayMacros] = useState(data.todayMacros || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });

  useEffect(() => {
    setFoods(data.foods || []);
    setMeals(data.meals || []);
    setTodayMacros(data.todayMacros || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
  }, [data]);

  const remaining = {
    calories: (user?.daily_calorie_target || 2000) - todayMacros.calories,
    protein: (user?.daily_protein_g || 180) - todayMacros.protein_g,
    carbs: (user?.daily_carbs_g || 250) - todayMacros.carbs_g,
    fat: (user?.daily_fat_g || 65) - todayMacros.fat_g
  };

  const formatMacro = (value) => {
    if (value >= 0) {
      return Math.round(value);
    } else {
      return '+' + Math.round(Math.abs(value));
    }
  };

  const handleAddFood = (food) => {
    setSelectedFoods([...selectedFoods, { ...food, portion: 1 }]);
  };

  const handleRemoveFood = (idx) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== idx));
  };

  const handlePortionChange = (idx, portion) => {
    const updated = [...selectedFoods];
    updated[idx].portion = portion;
    setSelectedFoods(updated);
  };

  const handleCreateCustomFood = async () => {
    if (!customFood.name || customFood.calories === 0) {
      setMessage('Please fill in food name and calories');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const response = await mealAPI.createCustomFood(customFood);
      setFoods([...foods, response.data]);
      setCustomFood({
        name: '',
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        calories: 0,
        serving_size: '1 serving'
      });
      setShowCustomForm(false);
      setMessage('✓ Custom food created successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating custom food:', error);
      setMessage('Failed to create custom food');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const filteredFoods = foods.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveMeal = async () => {
    if (!selectedFoods.length) {
      setMessage('Please select at least one food');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSaving(true);
    try {
      for (const food of selectedFoods) {
        await mealAPI.createMeal({
          user_id: userId,
          food_id: food.id,
          portion_size: food.portion,
          meal_type: 'lunch'
        });
      }

      let newMacros = { ...todayMacros };
      selectedFoods.forEach(food => {
        const multiplier = food.portion || 1;
        newMacros.calories += food.calories * multiplier;
        newMacros.protein_g += food.protein_g * multiplier;
        newMacros.carbs_g += food.carbs_g * multiplier;
        newMacros.fat_g += food.fat_g * multiplier;
      });
      setTodayMacros(newMacros);

      setMessage('✓ Meal saved successfully!');
      setSelectedFoods([]);
      setTimeout(() => {
        onMealSaved?.();
        setMessage('');
      }, 1000);
    } catch (error) {
      console.error('Error saving meal:', error);
      setMessage('Failed to save meal. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (!window.confirm('Are you sure you want to delete this meal?')) {
      return;
    }

    try {
      await mealAPI.deleteMeal(mealId);
      setMeals(meals.filter(m => m.id !== mealId));
      setMessage('✓ Meal deleted successfully!');
      setTimeout(() => {
        onMealSaved?.();
        setMessage('');
      }, 1000);
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
    <div className="nutrition">
      <div className="header-section">
        <h2>🍽️ Nutrition</h2>
        <p>Track your daily meals and macros</p>
        <div className="view-tabs" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            className={`tab-btn ${view === 'add' ? 'active' : ''}`}
            onClick={() => setView('add')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: view === 'add' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.1)',
              color: 'inherit',
              fontWeight: view === 'add' ? 'bold' : 'normal'
            }}
          >
            ➕ Log New
          </button>
          <button
            className={`tab-btn ${view === 'logged' ? 'active' : ''}`}
            onClick={() => setView('logged')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: view === 'logged' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.1)',
              color: 'inherit',
              fontWeight: view === 'logged' ? 'bold' : 'normal'
            }}
          >
            📋 Logged Meals ({meals?.length || 0})
          </button>
        </div>
      </div>

      {view === 'add' && (
        <>
          {/* Remaining Macros */}
          <div className="card macros-status">
            <h3>Today's Remaining Macros</h3>
            <div className="remaining-grid">
              <div className="remaining-item">
                <div className="remaining-value" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                  {formatMacro(remaining.calories)}
                </div>
                <p>Calories</p>
              </div>
              <div className="remaining-item">
                <div className="remaining-value" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}>
                  {formatMacro(remaining.protein)}g
                </div>
                <p>Protein</p>
              </div>
              <div className="remaining-item">
                <div className="remaining-value" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                  {formatMacro(remaining.carbs)}g
                </div>
                <p>Carbs</p>
              </div>
              <div className="remaining-item">
                <div className="remaining-value" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                  {formatMacro(remaining.fat)}g
                </div>
                <p>Fat</p>
              </div>
            </div>
          </div>

          {/* Add Food Section */}
          <div className="card">
            <h3>Add Food</h3>
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search foods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => setShowCustomForm(!showCustomForm)}
              style={{ marginBottom: '12px', width: '100%' }}
            >
              {showCustomForm ? '✕ Cancel' : '+ Create Custom Food'}
            </button>

            {showCustomForm && (
              <div className="custom-food-form" style={{ marginBottom: '16px', padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px' }}>
                <div className="form-group">
                  <label>Food Name</label>
                  <input
                    type="text"
                    value={customFood.name}
                    onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                    placeholder="e.g., Pizza, Smoothie Bowl"
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '6px', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <div className="form-group">
                    <label>Protein (g)</label>
                    <input
                      type="number"
                      value={customFood.protein_g}
                      onChange={(e) => setCustomFood({ ...customFood, protein_g: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.1"
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Carbs (g)</label>
                    <input
                      type="number"
                      value={customFood.carbs_g}
                      onChange={(e) => setCustomFood({ ...customFood, carbs_g: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.1"
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <div className="form-group">
                    <label>Fat (g)</label>
                    <input
                      type="number"
                      value={customFood.fat_g}
                      onChange={(e) => setCustomFood({ ...customFood, fat_g: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.1"
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Calories</label>
                    <input
                      type="number"
                      value={customFood.calories}
                      onChange={(e) => setCustomFood({ ...customFood, calories: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="1"
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Serving Size</label>
                  <input
                    type="text"
                    value={customFood.serving_size}
                    onChange={(e) => setCustomFood({ ...customFood, serving_size: e.target.value })}
                    placeholder="e.g., 1 slice, 1 bowl"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleCreateCustomFood}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  Create Food
                </button>
              </div>
            )}

            {filteredFoods.length > 0 ? (
              <div className="foods-list">
                {filteredFoods.map((food, idx) => (
                  <div key={idx} className="food-item">
                    <div className="food-info">
                      <h4>{food.name}</h4>
                      <div className="food-macros">
                        <span className="macro-badge protein">{food.protein_g}g P</span>
                        <span className="macro-badge carbs">{food.carbs_g}g C</span>
                        <span className="macro-badge fat">{food.fat_g}g F</span>
                        <span className="macro-badge calories">{food.calories} cal</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-add"
                      onClick={() => handleAddFood(food)}
                      title="Add food"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              searchTerm && <p className="text-muted">No foods found</p>
            )}
          </div>

          {/* Selected Foods */}
          {selectedFoods.length > 0 && (
            <div className="card selected-foods">
              <h3>Selected Foods ({selectedFoods.length})</h3>
              <div className="selected-foods-list">
                {selectedFoods.map((food, idx) => (
                  <div key={idx} className="selected-food-item">
                    <div className="food-selection-info">
                      <h4>{food.name}</h4>
                      <div className="portion-control">
                        <label>Portion:</label>
                        <input
                          type="number"
                          value={food.portion}
                          onChange={(e) => handlePortionChange(idx, parseFloat(e.target.value) || 1)}
                          min="0.5"
                          step="0.5"
                          className="portion-input"
                        />
                      </div>
                    </div>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveFood(idx)}
                      title="Remove food"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="btn btn-primary"
                onClick={handleSaveMeal}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Meal'}
              </button>
              {message && <div className="message-alert">{message}</div>}
            </div>
          )}
        </>
      )}

      {view === 'logged' && (
        <div className="card">
          <h3>🍴 Today's Meals</h3>
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
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-muted">No items in this meal</p>
                          )}
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
            <p className="text-muted">No meals logged yet</p>
          )}
        </div>
      )}

      {message && <div className="message-alert">{message}</div>}
    </div>
  );
};

export default Nutrition;
