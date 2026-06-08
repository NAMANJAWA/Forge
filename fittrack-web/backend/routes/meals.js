const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const router = express.Router();

// Get or seed food database with sample foods
router.get('/foods/list', async (req, res) => {
  try {
    let foods = await db.all(`SELECT * FROM foods LIMIT 100`);
    
    // Seed with sample foods if empty
    if (foods.length === 0) {
      const sampleFoods = [
        { name: 'Chicken Breast', protein_g: 31, carbs_g: 0, fat_g: 3.6, calories: 165, category: 'Protein', serving_size: '100g' },
        { name: 'Brown Rice', protein_g: 2.6, carbs_g: 23, fat_g: 0.9, calories: 111, category: 'Carbs', serving_size: '1 cup cooked' },
        { name: 'Broccoli', protein_g: 2.8, carbs_g: 7, fat_g: 0.4, calories: 34, category: 'Vegetables', serving_size: '100g' },
        { name: 'Egg White', protein_g: 10.9, carbs_g: 1.3, fat_g: 0.2, calories: 52, category: 'Protein', serving_size: '1 large' },
        { name: 'Almond Butter', protein_g: 7, carbs_g: 3, fat_g: 9, calories: 98, category: 'Fats', serving_size: '1 tbsp' },
        { name: 'Sweet Potato', protein_g: 1.6, carbs_g: 20, fat_g: 0.1, calories: 86, category: 'Carbs', serving_size: '100g' },
        { name: 'Salmon', protein_g: 25, carbs_g: 0, fat_g: 13, calories: 208, category: 'Protein', serving_size: '100g' },
        { name: 'Banana', protein_g: 1.3, carbs_g: 27, fat_g: 0.3, calories: 105, category: 'Carbs', serving_size: '1 medium' },
        { name: 'Greek Yogurt', protein_g: 10, carbs_g: 3.6, fat_g: 0.4, calories: 59, category: 'Protein', serving_size: '100g' },
        { name: 'Olive Oil', protein_g: 0, carbs_g: 0, fat_g: 14, calories: 120, category: 'Fats', serving_size: '1 tbsp' }
      ];

      for (const food of sampleFoods) {
        const id = uuidv4();
        await db.run(
          `INSERT INTO foods (id, name, protein_g, carbs_g, fat_g, calories, category, serving_size)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, food.name, food.protein_g, food.carbs_g, food.fat_g, food.calories, food.category, food.serving_size]
        );
      }
      foods = await db.all(`SELECT * FROM foods`);
    }
    
    res.json(foods);
  } catch (error) {
    console.error('GET /meals/foods/list error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create meal
router.post('/', async (req, res) => {
  try {
    const { user_id, meal_type, items } = req.body;
    const mealId = uuidv4();
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];

    await db.run(
      `INSERT INTO meals (id, user_id, date, meal_type, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [mealId, user_id, today, meal_type, now]
    );

    // Insert meal items
    let totals = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const itemId = uuidv4();
        const food = await db.get(`SELECT * FROM foods WHERE id = ?`, [item.food_id]);
        
        if (food) {
          const multiplier = (item.portion_size || 1);
          totals.calories += food.calories * multiplier;
          totals.protein_g += food.protein_g * multiplier;
          totals.carbs_g += food.carbs_g * multiplier;
          totals.fat_g += food.fat_g * multiplier;

          await db.run(
            `INSERT INTO meal_items (id, meal_id, food_id, portion_size, created_at)
             VALUES (?, ?, ?, ?, ?)`,
            [itemId, mealId, item.food_id, multiplier, now]
          );
        }
      }
    }

    res.status(201).json({ id: mealId, user_id, date: today, meal_type, items, totals });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get meals for user on date
router.get('/:user_id/date/:date', async (req, res) => {
  try {
    const meals = await db.all(
      `SELECT * FROM meals WHERE user_id = ? AND date = ? ORDER BY created_at DESC`,
      [req.params.user_id, req.params.date]
    );

    for (let meal of meals) {
      const items = await db.all(
        `SELECT mi.*, f.name, f.protein_g, f.carbs_g, f.fat_g, f.calories 
         FROM meal_items mi
         JOIN foods f ON mi.food_id = f.id
         WHERE mi.meal_id = ?`,
        [meal.id]
      );
      meal.items = items;
    }

    res.json(meals);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get daily macro totals
router.get('/:user_id/macros/:date', async (req, res) => {
  try {
    const items = await db.all(
      `SELECT mi.portion_size, f.protein_g, f.carbs_g, f.fat_g, f.calories 
       FROM meal_items mi
       JOIN meals m ON mi.meal_id = m.id
       JOIN foods f ON mi.food_id = f.id
       WHERE m.user_id = ? AND m.date = ?`,
      [req.params.user_id, req.params.date]
    );

    let totals = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
    items.forEach(item => {
      const multiplier = item.portion_size || 1;
      totals.calories += item.calories * multiplier;
      totals.protein_g += item.protein_g * multiplier;
      totals.carbs_g += item.carbs_g * multiplier;
      totals.fat_g += item.fat_g * multiplier;
    });

    res.json(totals);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete meal
router.delete('/:id', async (req, res) => {
  try {
    await db.run(`DELETE FROM meal_items WHERE meal_id = ?`, [req.params.id]);
    await db.run(`DELETE FROM meals WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
