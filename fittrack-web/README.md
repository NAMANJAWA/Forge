# FitTrack Web Application

A full-stack fitness and nutrition tracker built with React, Node.js/Express, and SQLite. Track workouts, log meals, monitor macros, and get intelligent recommendations—all in your browser.

Based on the Fitness Tracker PRD, this web version offers:
- ✅ User profiles with TDEE calculations
- ✅ Workout logging with exercise tracking
- ✅ Nutrition logging with 50+ foods database
- ✅ Real-time macro tracking
- ✅ Analytics dashboard with progress charts
- ✅ Daily reminders & SOS re-engagement notifications
- ✅ Dark/Light mode support
- ✅ Completely offline-first, on-device

## Quick Start

### Prerequisites
- Node.js 14+ and npm

### Backend Setup

```bash
cd fittrack-web/backend
npm install
cp .env.example .env
npm start
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd fittrack-web/frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

## Features

### Dashboard
- Daily macro overview (progress rings)
- Weight tracking with trend
- Current streak counter
- Quick access to log workout/meal
- AI-powered recommendations

### Workouts
- Pre-built splits (PPL, UL, Full Body)
- Exercise logging (sets, reps, weight)
- Workout history
- Progressive overload tracking

### Nutrition
- 50+ foods database
- Quick food search and add
- Daily macro targets based on TDEE
- Meal history
- Remaining macros display

### Analytics
- Weight progress chart
- Macro adherence percentage
- Volume progression by exercise
- Weekly summary (workouts, calories, macros)
- Personalized insights

## Architecture

```
fittrack-web/
├── backend/
│   ├── server.js           # Express server
│   ├── database.js         # SQLite setup
│   ├── routes/             # API endpoints
│   │   ├── users.js
│   │   ├── workouts.js
│   │   ├── meals.js
│   │   ├── analytics.js
│   │   └── notifications.js
│   └── utils/
│       └── calculations.js # TDEE, macros, SOS logic
│
└── frontend/
    ├── src/
    │   ├── pages/          # Tab views
    │   │   ├── Dashboard.jsx
    │   │   ├── Workouts.jsx
    │   │   ├── Nutrition.jsx
    │   │   └── Analytics.jsx
    │   ├── utils/
    │   │   ├── api.js      # Axios client
    │   │   └── context.js  # React context
    │   ├── App.jsx         # Main app
    │   └── index.js        # Entry point
    └── public/
        └── index.html
```

## Database Schema

SQLite database with tables:
- `users` - Profile data (height, weight, age, activity, macro targets)
- `weight_history` - Weight logs over time
- `workouts` - Workout sessions
- `exercise_logs` - Individual exercise data
- `foods` - Food database (50+ items)
- `meals` - Meal logs
- `meal_items` - Foods in each meal
- `macro_history` - Daily macro totals
- `notifications` - Daily & SOS reminders
- `activity_log` - Tracks last activity for SOS trigger

## API Endpoints

### Users
- `POST /api/users` - Create user profile
- `GET /api/users/:id` - Get profile
- `PUT /api/users/:id` - Update profile
- `POST /api/users/:id/weight` - Log weight
- `GET /api/users/:id/weight` - Get weight history

### Workouts
- `POST /api/workouts` - Create workout
- `GET /api/workouts/:user_id` - Get workouts
- `GET /api/workouts/:user_id/date/:date` - Get workout by date
- `DELETE /api/workouts/:id` - Delete workout

### Meals
- `GET /api/meals/foods/list` - Get food database
- `POST /api/meals` - Create meal
- `GET /api/meals/:user_id/date/:date` - Get meals by date
- `GET /api/meals/:user_id/macros/:date` - Get daily macros
- `DELETE /api/meals/:id` - Delete meal

### Analytics
- `GET /api/analytics/:user_id/weight-progress` - Weight trend
- `GET /api/analytics/:user_id/streak` - Workout streak
- `GET /api/analytics/:user_id/volume` - Exercise volumes
- `GET /api/analytics/:user_id/macro-adherence` - Compliance %
- `GET /api/analytics/:user_id/weekly-summary` - Weekly stats

### Notifications
- `GET /api/notifications/:user_id` - Get all notifications
- `POST /api/notifications/:user_id/daily` - Schedule daily reminder
- `GET /api/notifications/:user_id/sos-check` - Check SOS eligibility
- `PUT /api/notifications/:notification_id` - Toggle notification

## Algorithms

### TDEE Calculation (Mifflin-St Jeor)
```
BMR = 10×weight_kg + 6.25×height_cm - 5×age ± 5
TDEE = BMR × Activity Factor (1.2 to 1.9)
```

### Macro Targets
```
Protein: 0.9g per kg body weight
Fat: 25% of total calories
Carbs: Remaining calories
```

### SOS Trigger
Re-engagement reminder sent if user has not logged workout or meal in 3+ days.

## UI Design

**Colors:**
- Primary: #FF6B6B (Red, CTAs)
- Secondary: #4ECDC4 (Teal, achievements)
- Accent: #FFE66D (Yellow, highlights)
- Text Dark: #2C3E50
- Text Light: #7F8C8D

**Responsive:** Mobile-first design, optimized for 320px–768px.

**Dark Mode:** Toggle in top-right corner; preferences saved to localStorage.

## Development

Run both backend and frontend:

```bash
# Terminal 1 - Backend
cd fittrack-web/backend
npm install
npm start

# Terminal 2 - Frontend
cd fittrack-web/frontend
npm install
npm start
```

Visit `http://localhost:3000` in browser.

## Production Build

```bash
# Frontend
cd fittrack-web/frontend
npm run build
# Output: frontend/build/ (deploy to web server)

# Backend
# Set NODE_ENV=production and deploy to server/cloud
```

## Troubleshooting

**Backend won't connect:**
- Ensure backend is running on `http://localhost:5000`
- Check `.env` file has correct DATABASE_PATH

**Frontend API errors:**
- Check Network tab in browser DevTools
- Confirm `REACT_APP_API_URL` env var is set (or defaults to localhost:5000)

**Database locked:**
- Close all instances of the app
- Delete `fittrack.db` and restart (fresh database)

## Future Enhancements

- [ ] Multiple users / accounts
- [ ] Cloud sync (optional)
- [ ] Google Fit / Apple HealthKit integration
- [ ] Wearable app support
- [ ] Social features (friends, leaderboards)
- [ ] Supplement tracking
- [ ] PDF export of progress
- [ ] AI meal image recognition

## License

MIT

---

**Built with ❤️ using React, Node.js, and SQLite**
