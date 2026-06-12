import React, { useState } from 'react';
import './Login.css';
import { authAPI } from '../utils/api';

const Login = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    height_cm: 178,
    current_weight_kg: 79,
    target_weight_kg: 75,
    age: 28,
    gender: 'male',
    activity_level: 'moderate',
    goal: 'cut'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('_') || name === 'age' ? 
        (isNaN(value) ? value : parseFloat(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('fittrack_user_id', response.data.id);
        localStorage.setItem('fittrack_user_email', response.data.email);
        onLoginSuccess(response.data);
      } else {
        const response = await authAPI.register(formData);
        localStorage.setItem('fittrack_user_id', response.data.id);
        localStorage.setItem('fittrack_user_email', response.data.email);
        onLoginSuccess(response.data);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="stars-container">
        {Array.from({ length: 50 }).map((_, i) => (
          <span
            key={i}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              '--dur': `${Math.random() * 4 + 2}s`,
              '--delay': `${Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      <div className="login-card">
        <h1>FitTrack</h1>
        <p className="subtitle">Your Personal Fitness Companion</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    name="height_cm"
                    value={formData.height_cm}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Current Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="current_weight_kg"
                    value={formData.current_weight_kg}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Target Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="target_weight_kg"
                    value={formData.target_weight_kg}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Activity Level</label>
                  <select name="activity_level" value={formData.activity_level} onChange={handleChange}>
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="very_active">Very Active</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Goal</label>
                <select name="goal" value={formData.goal} onChange={handleChange}>
                  <option value="cut">Cut (Lose Fat)</option>
                  <option value="bulk">Bulk (Gain Muscle)</option>
                  <option value="maintain">Maintain</option>
                </select>
              </div>
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="toggle-auth">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className="link-btn"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className="link-btn"
              >
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
