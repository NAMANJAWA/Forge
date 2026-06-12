import React, { useState, useEffect, useContext, useMemo } from 'react';
import './App.css';
import { AppContext } from './utils/context';
import Login from './pages/Login';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState({
    workouts: [],
    foods: [],
    meals: [],
    todayMacros: {},
    streak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      initApp();
    }, 100);
  }, []);

  const initApp = async () => {
    try {
      const userId = localStorage.getItem('fittrack_user_id');
      
      if (!userId) {
        setLoading(false);
        return;
      }

      const userProfile = await userAPI.getProfile(userId);
      setUser(userProfile.data);
      setIsAuthenticated(true);
      setLoading(false);
      loadData(userId);
    } catch (error) {
      console.error('Error:', error);
      localStorage.removeItem('fittrack_user_id');
      localStorage.removeItem('fittrack_user_email');
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    loadData(userData.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('fittrack_user_id');
    localStorage.removeItem('fittrack_user_email');
    setUser(null);
    setIsAuthenticated(false);
    setData({
      workouts: [],
      foods: [],
      meals: [],
      todayMacros: {},
      streak: 0
    });
    setActiveTab('Dashboard');
  };

  const loadData = async (userId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [workouts, foods, meals, macros, streak] = await Promise.all([
        workoutAPI.getWorkouts(userId).catch(() => ({ data: [] })),
        mealAPI.getFoods().catch(() => ({ data: [] })),
        mealAPI.getMealsByDate(userId, today).catch(() => ({ data: [] })),
        mealAPI.getMacrosByDate(userId, today).catch(() => ({ data: {} })),
        analyticsAPI.getStreak(userId).catch(() => ({ data: { currentStreak: 0 } }))
      ]);

      setData({
        workouts: workouts.data || [],
        foods: foods.data || [],
        meals: meals.data || [],
        todayMacros: macros.data || {},
        streak: streak.data?.currentStreak || 0
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  if (loading) {
    return <div className="app loading">Loading FitTrack...</div>;
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard user={user} data={data} onNavigate={setActiveTab} onUpdate={() => loadData(user?.id)} />;
      case 'Workouts':
        return <Workouts userId={user?.id} data={data} onWorkoutSaved={() => loadData(user?.id)} />;
      case 'Nutrition':
        return <Nutrition userId={user?.id} user={user} data={data} onMealSaved={() => loadData(user?.id)} />;
      case 'Macros':
        return <MacroSettings user={user} onUpdate={() => loadData(user?.id)} />;
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

        <button className="logout-btn" onClick={handleLogout} title="Logout">
          🚪
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
