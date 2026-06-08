// Calculate TDEE using Mifflin-St Jeor equation
const calculateTDEE = (weight_kg, height_cm, age, gender, activity_level) => {
  let bmr;
  
  if (gender.toLowerCase() === 'male') {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  } else {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  }

  const activityFactors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    'very-active': 1.9
  };

  const factor = activityFactors[activity_level] || 1.55;
  return Math.round(bmr * factor);
};

// Calculate daily macro targets
const calculateMacros = (weight_kg, tdee, goal) => {
  let calorie_target = tdee;

  if (goal === 'cut') {
    calorie_target = Math.round(tdee - 500); // 0.5kg/week loss
  } else if (goal === 'bulk') {
    calorie_target = Math.round(tdee + 300); // 0.3kg/week gain
  }

  // Protein ratios: higher for cuts (preserve muscle), moderate for bulk
  let protein_ratio = 1.0; // default 1.0g per kg
  if (goal === 'bulk') {
    protein_ratio = 0.9; // 0.9g per kg for bulking
  }

  const protein_g = Math.round(weight_kg * protein_ratio);
  const fat_g = Math.round((calorie_target * 0.25) / 9); // 25% of calories
  const carbs_g = Math.round(((calorie_target - (protein_g * 4) - (fat_g * 9)) / 4));

  return {
    daily_calorie_target: calorie_target,
    daily_protein_g: protein_g,
    daily_carbs_g: carbs_g,
    daily_fat_g: fat_g
  };
};

// Get macro totals for a given date
const getMacroTotals = (meals) => {
  let totals = {
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0
  };

  meals.forEach(meal => {
    totals.calories += meal.calories || 0;
    totals.protein_g += meal.protein_g || 0;
    totals.carbs_g += meal.carbs_g || 0;
    totals.fat_g += meal.fat_g || 0;
  });

  return totals;
};

// Check if user qualifies for SOS re-engagement
const checkSOSEligibility = (last_activity_date) => {
  const now = new Date();
  const lastActivity = new Date(last_activity_date);
  const daysSinceActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
  return daysSinceActivity >= 3;
};

module.exports = {
  calculateTDEE,
  calculateMacros,
  getMacroTotals,
  checkSOSEligibility
};
