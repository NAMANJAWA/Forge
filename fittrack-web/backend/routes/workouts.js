const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const router = express.Router();

// Create workout
router.post('/', async (req, res) => {
  try {
    const { user_id, split_type, duration_minutes, notes, exercises } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];

    await db.run(
      `INSERT INTO workouts (id, user_id, date, split_type, duration_minutes, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, user_id, today, split_type, duration_minutes, notes, now]
    );

    // Insert exercises
    if (exercises && Array.isArray(exercises)) {
      for (const exercise of exercises) {
        const exerciseId = uuidv4();
        await db.run(
          `INSERT INTO exercise_logs (id, workout_id, exercise_name, muscle_group, sets, reps, weight_kg, notes, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [exerciseId, id, exercise.name, exercise.muscle_group, exercise.sets, exercise.reps, exercise.weight_kg, exercise.notes, now]
        );
      }
    }

    res.status(201).json({ id, user_id, date: today, split_type, duration_minutes, notes, exercises });
  } catch (error) {
    console.error('POST /workouts error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get workouts for user
router.get('/:user_id', async (req, res) => {
  try {
    const workouts = await db.all(
      `SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC LIMIT 50`,
      [req.params.user_id]
    );

    for (let workout of workouts) {
      const exercises = await db.all(
        `SELECT * FROM exercise_logs WHERE workout_id = ?`,
        [workout.id]
      );
      workout.exercises = exercises;
    }

    res.json(workouts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get workout by date
router.get('/:user_id/date/:date', async (req, res) => {
  try {
    const workout = await db.get(
      `SELECT * FROM workouts WHERE user_id = ? AND date = ?`,
      [req.params.user_id, req.params.date]
    );

    if (!workout) return res.status(404).json({ error: 'No workout found' });

    const exercises = await db.all(
      `SELECT * FROM exercise_logs WHERE workout_id = ?`,
      [workout.id]
    );
    workout.exercises = exercises;

    res.json(workout);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update exercise set
router.put('/exercise/:exerciseId', async (req, res) => {
  try {
    const { reps, weight_kg } = req.body;
    const now = new Date().toISOString();

    await db.run(
      `UPDATE exercise_logs SET reps = ?, weight_kg = ?, created_at = ? WHERE id = ?`,
      [reps, weight_kg, now, req.params.exerciseId]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete workout
router.delete('/:id', async (req, res) => {
  try {
    await db.run(`DELETE FROM exercise_logs WHERE workout_id = ?`, [req.params.id]);
    await db.run(`DELETE FROM workouts WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
