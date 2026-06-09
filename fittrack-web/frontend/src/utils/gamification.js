const calculateGamification = (data, user) => {
  let xp = 0;
  const today = new Date().toISOString().split('T')[0];

  const todayWorkouts = (data.workouts || []).filter(w => {
    const workoutDate = new Date(w.date).toISOString().split('T')[0];
    return workoutDate === today;
  });
  if (todayWorkouts.length > 0) {
    xp += 100;
    todayWorkouts.forEach(w => { xp += (w.exercises?.length || 0) * 50; });
  }

  if (data.meals && data.meals.length > 0) {
    xp += data.meals.length * 25;
    const remainingCalories = (user?.daily_calorie_target || 2000) - (data.todayMacros?.calories || 0);
    if (Math.abs(remainingCalories) < 100) xp += 50;
  }

  if (data.streak >= 3) xp += 30;
  if (data.streak >= 7) xp += 100;
  if (data.streak >= 30) xp += 200;

  const level = Math.floor(xp / 1000) + 1;
  const xpInLevel = xp % 1000;
  const levelProgress = Math.round((xpInLevel / 1000) * 100);

  const badges = [];
  if (data.streak >= 3) badges.push({ id: 'streak_3', icon: '🔥', name: '3-Day Streak' });
  if (data.streak >= 7) badges.push({ id: 'streak_7', icon: '🌟', name: 'Week Warrior' });
  if (data.streak >= 30) badges.push({ id: 'streak_30', icon: '👑', name: 'Legend' });
  if ((data.workouts || []).length >= 5) badges.push({ id: 'workouts_5', icon: '💪', name: 'Iron Lifter' });
  if ((data.workouts || []).length >= 20) badges.push({ id: 'workouts_20', icon: '🏋️', name: 'Gym Rat' });
  if ((data.meals || []).length >= 10) badges.push({ id: 'meals_10', icon: '🥗', name: 'Nutrition Master' });
  const todayCalories = data.todayMacros?.calories || 0;
  const targetCalories = user?.daily_calorie_target || 2000;
  if (todayCalories > targetCalories * 0.9 && todayCalories < targetCalories * 1.1)
    badges.push({ id: 'macro_master', icon: '🎯', name: 'Macro Master' });
  if ((data.todayMacros?.protein_g || 0) >= (user?.daily_protein_g || 180))
    badges.push({ id: 'protein_power', icon: '🥩', name: 'Protein Power' });

  const dailyChallenges = [
    { id: 'workout', name: 'Complete a Workout', icon: '🏋️', completed: todayWorkouts.length > 0, xp: 100 },
    { id: 'meals', name: 'Log 3 Meals', icon: '🍽️', completed: (data.meals || []).length >= 3, xp: 75 },
    { id: 'macros', name: 'Hit Macro Targets', icon: '🎯', completed: Math.abs((user?.daily_calorie_target || 2000) - (data.todayMacros?.calories || 0)) < 100, xp: 150 },
    { id: 'protein', name: 'Meet Protein Goal', icon: '🥩', completed: (data.todayMacros?.protein_g || 0) >= (user?.daily_protein_g || 180), xp: 80 }
  ];

  return {
    level, xp, xpInLevel, xpToNextLevel: 1000, levelProgress,
    badges, dailyChallenges,
    completedChallenges: dailyChallenges.filter(c => c.completed).length
  };
};

export default calculateGamification;
