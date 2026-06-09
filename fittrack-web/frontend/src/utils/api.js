import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const userAPI = {
  createProfile: (data) => api.post('/users', data),
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userId, data) => api.put(`/users/${userId}`, data),
  logWeight: (userId, weight_kg) => api.post(`/users/${userId}/weight`, { weight_kg }),
  getWeightHistory: (userId) => api.get(`/users/${userId}/weight`),
};

export const workoutAPI = {
  createWorkout: (data) => api.post('/workouts', data),
  getWorkouts: (userId) => api.get(`/workouts/${userId}`),
  getWorkoutByDate: (userId, date) => api.get(`/workouts/${userId}/date/${date}`),
  deleteWorkout: (workoutId) => api.delete(`/workouts/${workoutId}`),
};

export const mealAPI = {
  getFoods: () => api.get('/meals/foods/list'),
  createCustomFood: (data) => api.post('/meals/foods/custom', data),
  createMeal: (data) => api.post('/meals', data),
  getMealsByDate: (userId, date) => api.get(`/meals/${userId}/date/${date}`),
  getMacrosByDate: (userId, date) => api.get(`/meals/${userId}/macros/${date}`),
  deleteMeal: (mealId) => api.delete(`/meals/${mealId}`),
};

export const analyticsAPI = {
  getWeightProgress: (userId) => api.get(`/analytics/${userId}/weight-progress`),
  getStreak: (userId) => api.get(`/analytics/${userId}/streak`),
  getVolume: (userId) => api.get(`/analytics/${userId}/volume`),
  getMacroAdherence: (userId) => api.get(`/analytics/${userId}/macro-adherence`),
  getWeeklySummary: (userId) => api.get(`/analytics/${userId}/weekly-summary`),
};

export const notificationAPI = {
  getNotifications: (userId) => api.get(`/notifications/${userId}`),
  scheduleDailyNotification: (userId, scheduled_time) => api.post(`/notifications/${userId}/daily`, { scheduled_time }),
  checkSOS: (userId) => api.get(`/notifications/${userId}/sos-check`),
  toggleNotification: (notificationId, enabled) => api.put(`/notifications/${notificationId}`, { enabled }),
};

export default api;
