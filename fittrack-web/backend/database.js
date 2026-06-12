const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './fittrack.db';
let db;

const getDB = () => {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error('Database connection error:', err);
      else console.log('✓ Connected to SQLite database');
    });
  }
  return db;
};

const initialize = () => {
  const database = getDB();
  database.serialize(() => {
    // Users table
    database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT,
        height_cm INTEGER NOT NULL,
        current_weight_kg REAL NOT NULL,
        target_weight_kg REAL NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        activity_level TEXT NOT NULL,
        goal TEXT NOT NULL,
        daily_calorie_target INTEGER,
        daily_protein_g REAL,
        daily_carbs_g REAL,
        daily_fat_g REAL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Weight history table
    database.run(`
      CREATE TABLE IF NOT EXISTS weight_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        weight_kg REAL NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Workouts table
    database.run(`
      CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        split_type TEXT NOT NULL,
        duration_minutes INTEGER,
        notes TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Exercise logs table
    database.run(`
      CREATE TABLE IF NOT EXISTS exercise_logs (
        id TEXT PRIMARY KEY,
        workout_id TEXT NOT NULL,
        exercise_name TEXT NOT NULL,
        muscle_group TEXT,
        sets INTEGER NOT NULL,
        reps INTEGER NOT NULL,
        weight_kg REAL,
        notes TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (workout_id) REFERENCES workouts(id)
      )
    `);

    // Foods table
    database.run(`
      CREATE TABLE IF NOT EXISTS foods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        protein_g REAL NOT NULL,
        carbs_g REAL NOT NULL,
        fat_g REAL NOT NULL,
        calories INTEGER NOT NULL,
        category TEXT,
        serving_size TEXT
      )
    `);

    // Meals table
    database.run(`
      CREATE TABLE IF NOT EXISTS meals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        meal_type TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Meal items table
    database.run(`
      CREATE TABLE IF NOT EXISTS meal_items (
        id TEXT PRIMARY KEY,
        meal_id TEXT NOT NULL,
        food_id TEXT NOT NULL,
        portion_size REAL NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (meal_id) REFERENCES meals(id),
        FOREIGN KEY (food_id) REFERENCES foods(id)
      )
    `);

    // Macro history table
    database.run(`
      CREATE TABLE IF NOT EXISTS macro_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        total_calories INTEGER,
        protein_g REAL,
        carbs_g REAL,
        fat_g REAL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Notifications table
    database.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        scheduled_time TEXT,
        sent_at TEXT,
        enabled BOOLEAN DEFAULT 1,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Activity log for re-engagement tracking
    database.run(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        accessed_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `, () => {
      console.log('✓ Database initialized');
    });
  });
};

const run = (query, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDB();
    database.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const get = (query, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDB();
    database.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (query, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDB();
    database.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = {
  db: getDB,
  initialize,
  run,
  get,
  all
};
