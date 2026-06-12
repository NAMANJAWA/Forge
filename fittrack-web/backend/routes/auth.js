const express = require('express');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const db = require('../database');
const { calculateTDEE, calculateMacros } = require('../utils/calculations');

const router = express.Router();

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, height_cm, current_weight_kg, target_weight_kg, age, gender, activity_level, goal } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const existing = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const hashedPassword = hashPassword(password);

    const tdee = calculateTDEE(current_weight_kg, height_cm, age, gender, activity_level);
    const macros = calculateMacros(current_weight_kg, tdee, goal, target_weight_kg);

    await db.run(
      `INSERT INTO users (id, email, password, height_cm, current_weight_kg, target_weight_kg, age, gender, activity_level, goal, daily_calorie_target, daily_protein_g, daily_carbs_g, daily_fat_g, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, email, hashedPassword, height_cm, current_weight_kg, target_weight_kg, age, gender, activity_level, goal, macros.daily_calorie_target, macros.daily_protein_g, macros.daily_carbs_g, macros.daily_fat_g, now, now]
    );

    res.status(201).json({ id, email, ...macros });
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      id: user.id,
      email: user.email,
      height_cm: user.height_cm,
      current_weight_kg: user.current_weight_kg,
      target_weight_kg: user.target_weight_kg,
      age: user.age,
      gender: user.gender,
      activity_level: user.activity_level,
      goal: user.goal,
      daily_calorie_target: user.daily_calorie_target,
      daily_protein_g: user.daily_protein_g,
      daily_carbs_g: user.daily_carbs_g,
      daily_fat_g: user.daily_fat_g
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
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

    const weight = current_weight_kg || user.current_weight_kg;
    const tdee = calculateTDEE(weight, user.height_cm, user.age, user.gender, activity_level || user.activity_level);
    const macros = calculateMacros(weight, tdee, goal || user.goal, target_weight_kg || user.target_weight_kg);

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
