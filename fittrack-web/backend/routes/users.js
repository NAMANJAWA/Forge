const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { calculateTDEE, calculateMacros } = require('../utils/calculations');

const router = express.Router();

// Create initial user profile
router.post('/', async (req, res) => {
  try {
    const { height_cm, current_weight_kg, target_weight_kg, age, gender, activity_level, goal } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();

    // Calculate TDEE and macros
    const tdee = calculateTDEE(current_weight_kg, height_cm, age, gender, activity_level);
    const macros = calculateMacros(current_weight_kg, tdee, goal);

    await db.run(
      `INSERT INTO users (id, height_cm, current_weight_kg, target_weight_kg, age, gender, activity_level, goal, daily_calorie_target, daily_protein_g, daily_carbs_g, daily_fat_g, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, height_cm, current_weight_kg, target_weight_kg, age, gender, activity_level, goal, macros.daily_calorie_target, macros.daily_protein_g, macros.daily_carbs_g, macros.daily_fat_g, now, now]
    );

    res.status(201).json({ id, ...req.body, ...macros });
  } catch (error) {
    console.error('POST /users error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { current_weight_kg, target_weight_kg, activity_level, goal } = req.body;
    const now = new Date().toISOString();

    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Recalculate macros if needed
    const weight = current_weight_kg || user.current_weight_kg;
    const tdee = calculateTDEE(weight, user.height_cm, user.age, user.gender, activity_level || user.activity_level);
    const macros = calculateMacros(weight, tdee, goal || user.goal);

    await db.run(
      `UPDATE users SET current_weight_kg = ?, target_weight_kg = ?, activity_level = ?, goal = ?, daily_calorie_target = ?, daily_protein_g = ?, daily_carbs_g = ?, daily_fat_g = ?, updated_at = ?
       WHERE id = ?`,
      [weight, target_weight_kg || user.target_weight_kg, activity_level || user.activity_level, goal || user.goal, macros.daily_calorie_target, macros.daily_protein_g, macros.daily_carbs_g, macros.daily_fat_g, now, req.params.id]
    );

    res.json({ id: req.params.id, ...req.body, ...macros, updated_at: now });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Log weight
router.post('/:id/weight', async (req, res) => {
  try {
    const { weight_kg } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];

    await db.run(
      `INSERT INTO weight_history (id, user_id, weight_kg, date, created_at) VALUES (?, ?, ?, ?, ?)`,
      [id, req.params.id, weight_kg, today, now]
    );

    res.status(201).json({ id, user_id: req.params.id, weight_kg, date: today });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get weight history
router.get('/:id/weight', async (req, res) => {
  try {
    const weights = await db.all(
      `SELECT * FROM weight_history WHERE user_id = ? ORDER BY date DESC LIMIT 90`,
      [req.params.id]
    );
    res.json(weights);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
