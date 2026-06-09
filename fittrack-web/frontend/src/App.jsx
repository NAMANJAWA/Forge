import React, { useState, useEffect, useContext, useMemo } from 'react';
import './App.css';
import { AppContext } from './utils/context';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import Nutrition from './pages/Nutrition';
import Analytics from './pages/Analytics';
import MacroSettings from './pages/MacroSettings';
import { userAPI, workoutAPI, mealAPI, analyticsAPI } from './utils/api';

const tabs = ['Dashboard', 'Workouts', 'Nutrition', 'Macros', 'Analytics'];

function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 6,
      duration: Math.random() * 4 + 2,
      opacity: Math.random() * 0.6 + 0.2,
    }));
  }, []);

  return (
    <div className="stars-container">
      {stars.map(star => (
        <span
          key={star.id}
          className="star"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            '--dur': `${star.duration}s`,
            '--delay': `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function App() {
  const appContext = useContext(AppContext);
  const { theme, toggleTheme, message } = appContext || { theme: 'universe', toggleTheme: () => {}, message: { type: '', text: '' } };
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [user, setUser] = useState(null);
  const [data, setData] = useState({
    workouts: [],
    foods: [],
    meals: [],
    todayMacros: {},
    streak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        let userId = localStorage.getItem('fittrack_user_id');

        if (!userId) {
          console.log('Creating new user');
          const newUser = await userAPI.createProfile({
            height_cm: 178,
            current_weight_kg: 79,
            target_weight_kg: 75,
            age: 28,
            gender: 'male',
            activity_level: 'moderate',
            goal: 'cut'
          });
          userId = newUser.data.id;
          localStorage.setItem('fittrack_user_id', userId);
          setUser(newUser.data);
        } else {
          console.log('Getting existing user');
          const userProfile = await userAPI.getProfile(userId);
          setUser(userProfile.data);
        }

        const today = new Date().toISOString().split('T')[0];
        
        try {
          console.log('Fetching workouts');
          const workouts = await workoutAPI.getWorkouts(userId);
          console.log('Workouts fetched');
          setData(prev => ({ ...prev, workouts: workouts.data || [] }));
        } catch (e) {
          console.error('Workouts error:', e);
        }

        try {
          console.log('Fetching foods');
          const foods = await mealAPI.getFoods();
          console.log('Foods fetched');
          setData(prev => ({ ...prev, foods: foods.data || [] }));
        } catch (e) {
          console.error('Foods error:', e);
        }

        try {
          console.log('Fetching meals');
          const meals = await mealAPI.getMealsByDate(userId, today);
          console.log('Meals fetched');
          setData(prev => ({ ...prev, meals: meals.data || [] }));
        } catch (e) {
          console.error('Meals error:', e);
        }

        try {
          console.log('Fetching macros');
          const macros = await mealAPI.getMacrosByDate(userId, today);
          console.log('Macros fetched');
          setData(prev => ({ ...prev, todayMacros: macros.data || {} }));
        } catch (e) {
          console.error('Macros error:', e);
        }

        try {
          console.log('Fetching streak');
          const streak = await analyticsAPI.getStreak(userId);
          console.log('Streak fetched');
          setData(prev => ({ ...prev, streak: streak.data?.currentStreak || 0 }));
        } catch (e) {
          console.error('Streak error:', e);
        }

        setLoading(false);
      } catch (error) {
        console.error('Init error:', error);
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return <div className="app loading">Loading FitTrack...</div>;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard user={user} data={data} onNavigate={setActiveTab} onUpdate={() => {}} />;
      case 'Workouts':
        return <Workouts userId={user?.id} data={data} onWorkoutSaved={() => {}} />;
      case 'Nutrition':
        return <Nutrition userId={user?.id} user={user} data={data} onMealSaved={() => {}} />;
      case 'Macros':
        return <MacroSettings user={user} onUpdate={() => {}} />;
      case 'Analytics':
        return <Analytics userId={user?.id} data={data} />;
      default:
        return <Dashboard user={user} data={data} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="app">
      <StarField />
      <div className="nebula-orb nebula-1" />
      <div className="nebula-orb nebula-2" />
      <div className="app-container">
        {renderTab()}

        <nav className="bottom-nav">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Dashboard' && '📊'}
              {tab === 'Workouts' && '🏋️'}
              {tab === 'Nutrition' && '🍽️'}
              {tab === 'Macros' && '🎉'}
              {tab === 'Analytics' && '📈'}
              <span>{tab}</span>
            </button>
          ))}
        </nav>

        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? '🌌' : '✨'}
        </button>

        {message.text && (
          <div className={`notification notification-${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
