const express = require('express');
const db = require('../database');

const router = express.Router();

// Get weight progress
router.get('/:user_id/weight-progress', async (req, res) => {
  try {
    const weights = await db.all(
      `SELECT date, weight_kg FROM weight_history WHERE user_id = ? ORDER BY date ASC LIMIT 90`,
      [req.params.user_id]
    );
    res.json(weights);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get workout streak
router.get('/:user_id/streak', async (req, res) => {
  try {
    const workouts = await db.all(
      `SELECT DISTINCT date FROM workouts WHERE user_id = ? ORDER BY date DESC LIMIT 30`,
      [req.params.user_id]
    );
    
    const meals = await db.all(
      `SELECT DISTINCT date FROM meals WHERE user_id = ? ORDER BY date DESC LIMIT 30`,
      [req.params.user_id]
    );

    // Calculate current streak
    const today = new Date().toISOString().split('T')[0];
    const activeDates = new Set();
    
    workouts.forEach(w => activeDates.add(w.date));
    meals.forEach(m => activeDates.add(m.date));

    let currentStreak = 0;
    let currentDate = new Date(today);

    while (activeDates.has(currentDate.toISOString().split('T')[0])) {
      currentStreak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    res.json({ currentStreak, activeDates: Array.from(activeDates) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get volume progression (exercises over time)
router.get('/:user_id/volume', async (req, res) => {
  try {
    const exercises = await db.all(
      `SELECT exercise_name, MAX(weight_kg) as max_weight, SUM(sets) as total_sets
       FROM exercise_logs el
       JOIN workouts w ON el.workout_id = w.id
       WHERE w.user_id = ?
       GROUP BY exercise_name
       ORDER BY max_weight DESC`,
      [req.params.user_id]
    );
    res.json(exercises);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get macro adherence (weekly compliance)
router.get('/:user_id/macro-adherence', async (req, res) => {
  try {
    const user = await db.get(`SELECT daily_calorie_target FROM users WHERE id = ?`, [req.params.user_id]);
    
    const data = await db.all(
      `SELECT DISTINCT DATE(date) as date, SUM(calories) as calories
       FROM meal_items mi
       JOIN meals m ON mi.meal_id = m.id
       JOIN foods f ON mi.food_id = f.id
       WHERE m.user_id = ?
       GROUP BY DATE(date)
       ORDER BY date DESC
       LIMIT 30`,
      [req.params.user_id]
    );

    const adhered = data.filter(d => 
      Math.abs(d.calories - user.daily_calorie_target) / user.daily_calorie_target <= 0.1
    ).length;

    res.json({ 
      total: data.length, 
      adhered, 
      percentage: Math.round((adhered / data.length) * 100) || 0,
      data 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get weekly summary
router.get('/:user_id/weekly-summary', async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStr = today.toISOString().split('T')[0];
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const workoutCount = await db.get(
      `SELECT COUNT(*) as count FROM workouts WHERE user_id = ? AND date BETWEEN ? AND ?`,
      [req.params.user_id, weekAgoStr, todayStr]
    );

    const totalMacros = await db.all(
      `SELECT SUM(f.calories) as calories, SUM(f.protein_g) as protein_g, SUM(f.carbs_g) as carbs_g, SUM(f.fat_g) as fat_g
       FROM meal_items mi
       JOIN meals m ON mi.meal_id = m.id
       JOIN foods f ON mi.food_id = f.id
       WHERE m.user_id = ? AND m.date BETWEEN ? AND ?`,
      [req.params.user_id, weekAgoStr, todayStr]
    );

    res.json({
      workouts_completed: workoutCount.count || 0,
      total_calories: totalMacros[0]?.calories || 0,
      total_protein_g: totalMacros[0]?.protein_g || 0,
      total_carbs_g: totalMacros[0]?.carbs_g || 0,
      total_fat_g: totalMacros[0]?.fat_g || 0
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
