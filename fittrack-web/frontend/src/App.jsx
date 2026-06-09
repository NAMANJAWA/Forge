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
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  // Initialize or get existing user
  useEffect(() => {
    const initUser = async () => {
      try {
        const userId = localStorage.getItem('fittrack_user_id');

        if (!userId) {
          // Create default user
          const newUser = await userAPI.createProfile({
            height_cm: 178,
            current_weight_kg: 79,
            target_weight_kg: 75,
            age: 28,
            gender: 'male',
            activity_level: 'moderate',
            goal: 'cut'
          });
          localStorage.setItem('fittrack_user_id', newUser.data.id);
          setUser(newUser.data);
          fetchUserData(newUser.data.id);
        } else {
          const userProfile = await userAPI.getProfile(userId);
          setUser(userProfile.data);
          fetchUserData(userId);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        alert('Failed to connect to backend. Make sure backend is running on http://localhost:5000');
      } finally {
        setLoading(false);
      }
    };

    initUser();
  }, []);

  const fetchUserData = async (userId, refreshUser = false) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const promises = [
        workoutAPI.getWorkouts(userId),
        mealAPI.getFoods(),
        mealAPI.getMealsByDate(userId, today),
        mealAPI.getMacrosByDate(userId, today),
        analyticsAPI.getStreak(userId)
      ];
      
      if (refreshUser) {
        promises.push(userAPI.getProfile(userId));
      }

      const results = await Promise.all(promises);
      
      if (refreshUser && results.length > 5) {
        setUser(results[5].data);
      }

      setData({
        workouts: results[0].data || [],
        foods: results[1].data || [],
        meals: results[2].data || [],
        todayMacros: results[3].data || {},
        streak: results[4].data?.currentStreak || 0
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  if (loading) {
    return <div className="app loading">Loading FitTrack...</div>;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard user={user} data={data} onNavigate={setActiveTab} onUpdate={() => fetchUserData(user?.id, true)} />;
      case 'Workouts':
        return <Workouts userId={user?.id} data={data} onWorkoutSaved={() => fetchUserData(user?.id)} />;
      case 'Nutrition':
        return <Nutrition userId={user?.id} user={user} data={data} onMealSaved={() => fetchUserData(user?.id)} />;
      case 'Macros':
        return <MacroSettings user={user} onUpdate={() => fetchUserData(user?.id, true)} />;
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

        {/* Bottom Navigation */}
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

        {/* Theme Toggle */}
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? '🌌' : '✨'}
        </button>

        {/* Message Notification */}
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
