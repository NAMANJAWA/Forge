const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { checkSOSEligibility } = require('../utils/calculations');

const router = express.Router();

// Get notifications for user
router.get('/:user_id', async (req, res) => {
  try {
    const notifications = await db.all(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`,
      [req.params.user_id]
    );
    res.json(notifications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Schedule daily notification
router.post('/:user_id/daily', async (req, res) => {
  try {
    const { scheduled_time } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO notifications (id, user_id, type, scheduled_time, enabled, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, req.params.user_id, 'daily_reminder', scheduled_time, 1, now]
    );

    res.status(201).json({ id, user_id: req.params.user_id, type: 'daily_reminder', scheduled_time, enabled: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Check SOS eligibility (3 days no activity)
router.get('/:user_id/sos-check', async (req, res) => {
  try {
    const lastWorkout = await db.get(
      `SELECT date FROM workouts WHERE user_id = ? ORDER BY date DESC LIMIT 1`,
      [req.params.user_id]
    );

    const lastMeal = await db.get(
      `SELECT date FROM meals WHERE user_id = ? ORDER BY date DESC LIMIT 1`,
      [req.params.user_id]
    );

    const lastDate = lastWorkout?.date || lastMeal?.date;
    const shouldSOS = lastDate && checkSOSEligibility(lastDate);

    if (shouldSOS) {
      const id = uuidv4();
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO notifications (id, user_id, type, sent_at, enabled, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, req.params.user_id, 'sos_reminder', now, 1, now]
      );

      res.json({ 
        eligibleForSOS: true, 
        message: "We miss you! Missing just 3 days can break your progress chain. Come back!",
        notificationId: id 
      });
    } else {
      res.json({ eligibleForSOS: false });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Toggle notification
router.put('/:notification_id', async (req, res) => {
  try {
    const { enabled } = req.body;

    await db.run(
      `UPDATE notifications SET enabled = ? WHERE id = ?`,
      [enabled ? 1 : 0, req.params.notification_id]
    );

    res.json({ id: req.params.notification_id, enabled });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
