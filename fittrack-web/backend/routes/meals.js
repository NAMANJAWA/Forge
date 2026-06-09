const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const router = express.Router();

// Get or seed food database with sample foods
router.get('/foods/list', async (req, res) => {
  try {
    let foods = await db.all(`SELECT * FROM foods LIMIT 200`);
    
    // Seed with sample foods if empty
    if (foods.length === 0) {
      const sampleFoods = [
        // Indian Proteins
        { name: 'Chicken (Tandoori)', protein_g: 28, carbs_g: 0, fat_g: 5, calories: 165, category: 'Protein', serving_size: '100g' },
        { name: 'Paneer (Low Fat)', protein_g: 22, carbs_g: 1.2, fat_g: 6, calories: 136, category: 'Protein', serving_size: '100g' },
        { name: 'Dal (Red Lentil)', protein_g: 9, carbs_g: 20, fat_g: 0.5, calories: 116, category: 'Protein', serving_size: '100g' },
        { name: 'Moong Dal (Cooked)', protein_g: 8, carbs_g: 19, fat_g: 0.4, calories: 105, category: 'Protein', serving_size: '100g' },
        { name: 'Chickpea (Chana)', protein_g: 12, carbs_g: 27, fat_g: 2, calories: 164, category: 'Protein', serving_size: '100g' },
        { name: 'Black Chickpea (Kala Chana)', protein_g: 14, carbs_g: 28, fat_g: 2.5, calories: 180, category: 'Protein', serving_size: '100g' },
        { name: 'Kidney Beans (Rajma)', protein_g: 8, carbs_g: 23, fat_g: 0.3, calories: 127, category: 'Protein', serving_size: '100g' },
        { name: 'Soya Bean', protein_g: 11, carbs_g: 12, fat_g: 6, calories: 140, category: 'Protein', serving_size: '100g' },
        { name: 'Fish (Roasted)', protein_g: 26, carbs_g: 0, fat_g: 3, calories: 130, category: 'Protein', serving_size: '100g' },
        { name: 'Egg (Boiled)', protein_g: 6.3, carbs_g: 0.6, fat_g: 5.3, calories: 78, category: 'Protein', serving_size: '1 large' },
        { name: 'Greek Yogurt', protein_g: 10, carbs_g: 3.6, fat_g: 0.4, calories: 59, category: 'Protein', serving_size: '100g' },
        { name: 'Milk (Cow)', protein_g: 3.2, carbs_g: 4.8, fat_g: 3.3, calories: 61, category: 'Protein', serving_size: '100ml' },
        { name: 'Tofu', protein_g: 8.1, carbs_g: 1.9, fat_g: 4.8, calories: 76, category: 'Protein', serving_size: '100g' },
        { name: 'Sprouts (Mung)', protein_g: 3, carbs_g: 7, fat_g: 0.2, calories: 30, category: 'Protein', serving_size: '100g' },
        
        // Indian Carbs
        { name: 'Basmati Rice (Cooked)', protein_g: 2.7, carbs_g: 28, fat_g: 0.3, calories: 130, category: 'Carbs', serving_size: '1 cup' },
        { name: 'Brown Rice', protein_g: 2.6, carbs_g: 23, fat_g: 0.9, calories: 111, category: 'Carbs', serving_size: '1 cup' },
        { name: 'Roti (Whole Wheat)', protein_g: 4, carbs_g: 22, fat_g: 1.5, calories: 120, category: 'Carbs', serving_size: '1 medium' },
        { name: 'Paratha', protein_g: 5, carbs_g: 25, fat_g: 6, calories: 170, category: 'Carbs', serving_size: '1 medium' },
        { name: 'Naan (Regular)', protein_g: 5.5, carbs_g: 33, fat_g: 4, calories: 190, category: 'Carbs', serving_size: '1 medium' },
        { name: 'Chapati (Whole Wheat)', protein_g: 4.2, carbs_g: 22, fat_g: 1.2, calories: 115, category: 'Carbs', serving_size: '1 medium' },
        { name: 'Puri (Deep Fried)', protein_g: 3, carbs_g: 20, fat_g: 8, calories: 170, category: 'Carbs', serving_size: '1 medium' },
        { name: 'Idli (Steamed)', protein_g: 2, carbs_g: 13, fat_g: 0.5, calories: 60, category: 'Carbs', serving_size: '1 medium' },
        { name: 'Dosa (Rice Crepe)', protein_g: 3, carbs_g: 22, fat_g: 3, calories: 125, category: 'Carbs', serving_size: '1 medium' },
        { name: 'Upma (Semolina)', protein_g: 4, carbs_g: 18, fat_g: 2, calories: 110, category: 'Carbs', serving_size: '100g' },
        { name: 'Poha (Flattened Rice)', protein_g: 1.5, carbs_g: 20, fat_g: 0.5, calories: 85, category: 'Carbs', serving_size: '100g' },
        { name: 'Corn (Boiled)', protein_g: 3.3, carbs_g: 19, fat_g: 1.2, calories: 96, category: 'Carbs', serving_size: '100g' },
        { name: 'Sweet Potato', protein_g: 1.6, carbs_g: 20, fat_g: 0.1, calories: 86, category: 'Carbs', serving_size: '100g' },
        { name: 'Banana', protein_g: 1.3, carbs_g: 27, fat_g: 0.3, calories: 105, category: 'Carbs', serving_size: '1 medium' },
        { name: 'Mango', protein_g: 0.7, carbs_g: 25, fat_g: 0.3, calories: 100, category: 'Carbs', serving_size: '1 medium' },
        { name: 'Jaggery', protein_g: 0.3, carbs_g: 95, fat_g: 0.2, calories: 380, category: 'Carbs', serving_size: '100g' },
        
        // Indian Vegetables
        { name: 'Spinach (Palak)', protein_g: 2.7, carbs_g: 3.6, fat_g: 0.4, calories: 23, category: 'Vegetables', serving_size: '100g' },
        { name: 'Bottle Gourd (Lauki)', protein_g: 0.6, carbs_g: 3.4, fat_g: 0.1, calories: 15, category: 'Vegetables', serving_size: '100g' },
        { name: 'Bitter Gourd (Karela)', protein_g: 0.6, carbs_g: 3.7, fat_g: 0.2, calories: 17, category: 'Vegetables', serving_size: '100g' },
        { name: 'Okra (Bhindi)', protein_g: 1.9, carbs_g: 7, fat_g: 0.2, calories: 31, category: 'Vegetables', serving_size: '100g' },
        { name: 'Brinjal (Eggplant)', protein_g: 0.98, carbs_g: 5.2, fat_g: 0.18, calories: 25, category: 'Vegetables', serving_size: '100g' },
        { name: 'Cabbage', protein_g: 1.3, carbs_g: 5.2, fat_g: 0.1, calories: 25, category: 'Vegetables', serving_size: '100g' },
        { name: 'Cauliflower', protein_g: 1.9, carbs_g: 5, fat_g: 0.3, calories: 25, category: 'Vegetables', serving_size: '100g' },
        { name: 'Tomato', protein_g: 0.9, carbs_g: 3.9, fat_g: 0.2, calories: 18, category: 'Vegetables', serving_size: '100g' },
        { name: 'Onion', protein_g: 1.1, carbs_g: 9, fat_g: 0.1, calories: 40, category: 'Vegetables', serving_size: '100g' },
        { name: 'Capsicum (Bell Pepper)', protein_g: 0.9, carbs_g: 6, fat_g: 0.3, calories: 31, category: 'Vegetables', serving_size: '100g' },
        { name: 'Peas (Green)', protein_g: 5, carbs_g: 11, fat_g: 0.4, calories: 81, category: 'Vegetables', serving_size: '100g' },
        { name: 'Carrot', protein_g: 0.6, carbs_g: 10, fat_g: 0.2, calories: 41, category: 'Vegetables', serving_size: '100g' },
        { name: 'Cucumber', protein_g: 0.7, carbs_g: 3.6, fat_g: 0.1, calories: 16, category: 'Vegetables', serving_size: '100g' },
        { name: 'Beetroot', protein_g: 1.6, carbs_g: 10, fat_g: 0.2, calories: 43, category: 'Vegetables', serving_size: '100g' },
        { name: 'Radish (Mooli)', protein_g: 0.7, carbs_g: 3.4, fat_g: 0.1, calories: 16, category: 'Vegetables', serving_size: '100g' },
        
        // Indian Fats & Oils
        { name: 'Ghee (Clarified Butter)', protein_g: 0, carbs_g: 0, fat_g: 14, calories: 120, category: 'Fats', serving_size: '1 tbsp' },
        { name: 'Coconut Oil', protein_g: 0, carbs_g: 0, fat_g: 14, calories: 120, category: 'Fats', serving_size: '1 tbsp' },
        { name: 'Mustard Oil', protein_g: 0, carbs_g: 0, fat_g: 14, calories: 120, category: 'Fats', serving_size: '1 tbsp' },
        { name: 'Sesame Oil', protein_g: 0, carbs_g: 0, fat_g: 14, calories: 120, category: 'Fats', serving_size: '1 tbsp' },
        { name: 'Olive Oil', protein_g: 0, carbs_g: 0, fat_g: 14, calories: 120, category: 'Fats', serving_size: '1 tbsp' },
        { name: 'Peanuts', protein_g: 7, carbs_g: 5, fat_g: 14, calories: 161, category: 'Fats', serving_size: '1 ounce' },
        { name: 'Almonds', protein_g: 6, carbs_g: 6, fat_g: 14, calories: 164, category: 'Fats', serving_size: '1 ounce' },
        { name: 'Cashew', protein_g: 5, carbs_g: 9, fat_g: 13, calories: 157, category: 'Fats', serving_size: '1 ounce' },
        { name: 'Coconut (Fresh)', protein_g: 3, carbs_g: 9, fat_g: 9, calories: 120, category: 'Fats', serving_size: '100g' },
        { name: 'Peanut Butter', protein_g: 8, carbs_g: 7, fat_g: 8, calories: 128, category: 'Fats', serving_size: '2 tbsp' },
        { name: 'Sunflower Oil', protein_g: 0, carbs_g: 0, fat_g: 14, calories: 120, category: 'Fats', serving_size: '1 tbsp' },
        
        // Indian Dairy
        { name: 'Paneer (Regular)', protein_g: 18, carbs_g: 1.2, fat_g: 11, calories: 160, category: 'Protein', serving_size: '100g' },
        { name: 'Curd/Yogurt', protein_g: 3.5, carbs_g: 4.7, fat_g: 0.4, calories: 40, category: 'Protein', serving_size: '100g' },
        { name: 'Butter', protein_g: 0.7, carbs_g: 0.1, fat_g: 81, calories: 717, category: 'Fats', serving_size: '100g' },
        { name: 'Panipuri Water', protein_g: 0, carbs_g: 0, fat_g: 0, calories: 0, category: 'Beverages', serving_size: '100ml' },
        
        // Indian Sweets & Snacks (for reference)
        { name: 'Halwa (Semolina)', protein_g: 3, carbs_g: 30, fat_g: 6, calories: 165, category: 'Carbs', serving_size: '100g' },
        { name: 'Besan Laddu', protein_g: 4, carbs_g: 20, fat_g: 8, calories: 160, category: 'Carbs', serving_size: '50g' },
        { name: 'Samosa', protein_g: 3, carbs_g: 18, fat_g: 7, calories: 145, category: 'Carbs', serving_size: '1 medium' },
        
        // Western Options (for comparison)
        { name: 'Chicken Breast', protein_g: 31, carbs_g: 0, fat_g: 3.6, calories: 165, category: 'Protein', serving_size: '100g' },
        { name: 'Salmon', protein_g: 25, carbs_g: 0, fat_g: 13, calories: 208, category: 'Protein', serving_size: '100g' },
        { name: 'Ground Beef', protein_g: 26, carbs_g: 0, fat_g: 15, calories: 250, category: 'Protein', serving_size: '100g' },
        { name: 'Oatmeal', protein_g: 10, carbs_g: 54, fat_g: 8, calories: 300, category: 'Carbs', serving_size: '100g' },
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

// Create a custom food
router.post('/foods/custom', async (req, res) => {
  try {
    const { name, protein_g, carbs_g, fat_g, calories, serving_size } = req.body;
    
    if (!name || protein_g === undefined || carbs_g === undefined || fat_g === undefined || calories === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = uuidv4();
    await db.run(
      `INSERT INTO foods (id, name, protein_g, carbs_g, fat_g, calories, category, serving_size)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, protein_g, carbs_g, fat_g, calories, 'Custom', serving_size || '1 serving']
    );

    res.status(201).json({ id, name, protein_g, carbs_g, fat_g, calories, serving_size, category: 'Custom' });
  } catch (error) {
    console.error('POST /meals/foods/custom error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create meal
router.post('/', async (req, res) => {
  try {
    const { user_id, meal_type, food_id, portion_size } = req.body;
    const mealId = uuidv4();
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];

    await db.run(
      `INSERT INTO meals (id, user_id, date, meal_type, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [mealId, user_id, today, meal_type || 'lunch', now]
    );

    // Insert meal item
    const itemId = uuidv4();
    const multiplier = portion_size || 1;
    const food = await db.get(`SELECT * FROM foods WHERE id = ?`, [food_id]);
    
    if (food) {
      await db.run(
        `INSERT INTO meal_items (id, meal_id, food_id, portion_size, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [itemId, mealId, food_id, multiplier, now]
      );
    }

    res.status(201).json({ id: mealId, user_id, date: today, meal_type: meal_type || 'lunch', success: true });
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
