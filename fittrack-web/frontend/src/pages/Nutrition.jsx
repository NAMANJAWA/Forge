import React, { useState } from 'react';
import { mealAPI } from '../utils/api';
import './Nutrition.css';

const Nutrition = ({ userId, user, data }) => {
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const foods = data.foods || [];
  const todayMacros = data.todayMacros || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };

  const remaining = {
    calories: (user?.daily_calorie_target || 2000) - todayMacros.calories,
    protein: (user?.daily_protein_g || 180) - todayMacros.protein_g,
    carbs: (user?.daily_carbs_g || 250) - todayMacros.carbs_g,
    fat: (user?.daily_fat_g || 65) - todayMacros.fat_g
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
      setMessage('✓ Meal saved successfully!');
      setSelectedFoods([]);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving meal:', error);
      setMessage('Failed to save meal. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="nutrition">
      <div className="header-section">
        <h2>🍽️ Nutrition</h2>
        <p>Track your daily meals and macros</p>
      </div>

      {/* Remaining Macros */}
      <div className="card macros-status">
        <h3>Today's Remaining Macros</h3>
        <div className="remaining-grid">
          <div className="remaining-item">
            <div className="remaining-value" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
              {Math.round(Math.max(remaining.calories, 0))}
            </div>
            <p>Calories</p>
          </div>
          <div className="remaining-item">
            <div className="remaining-value" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}>
              {Math.round(Math.max(remaining.protein, 0))}g
            </div>
            <p>Protein</p>
          </div>
          <div className="remaining-item">
            <div className="remaining-value" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              {Math.round(Math.max(remaining.carbs, 0))}g
            </div>
            <p>Carbs</p>
          </div>
          <div className="remaining-item">
            <div className="remaining-value" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              {Math.round(Math.max(remaining.fat, 0))}g
            </div>
            <p>Fat</p>
          </div>
        </div>
      </div>

      {/* Food Search */}
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
    </div>
  );
};

export default Nutrition;
