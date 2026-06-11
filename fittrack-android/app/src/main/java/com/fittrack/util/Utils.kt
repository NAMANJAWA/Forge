package com.fittrack.util

object ExerciseData {
    val bySplit = mapOf(
        "push" to listOf(
            "Barbell Bench Press", "Incline Dumbbell Press", "Decline Bench Press",
            "Cable Flyes", "Machine Chest Press", "Overhead Press",
            "Dumbbell Shoulder Press", "Lateral Raises", "Tricep Pushdowns",
            "Rope Pushdowns", "Skull Crushers", "Dips Machine"
        ),
        "pull" to listOf(
            "Barbell Rows", "Dumbbell Rows", "Lat Pulldown", "Pull-ups",
            "Chin-ups", "T-Bar Rows", "Chest Supported Rows", "Machine Rows",
            "Face Pulls", "Bicep Curls", "Hammer Curls", "Preacher Curls", "EZ Bar Curls"
        ),
        "legs" to listOf(
            "Barbell Squat", "Leg Press", "Hack Squat", "Leg Extension",
            "Leg Curl", "Romanian Deadlift", "Barbell Deadlift",
            "Walking Lunges", "Bulgarian Split Squats", "Calf Raises", "Seated Calf Raises"
        ),
        "upper" to listOf(
            "Barbell Bench Press", "Incline Dumbbell Press", "Barbell Rows",
            "Lat Pulldown", "Overhead Press", "Lateral Raises", "Bicep Curls",
            "Skull Crushers", "Cable Flyes", "Machine Rows"
        ),
        "lower" to listOf(
            "Barbell Squat", "Romanian Deadlift", "Leg Press", "Leg Extension",
            "Leg Curl", "Hack Squat", "Walking Lunges", "Calf Raises", "Bulgarian Split Squats"
        ),
        "full body" to listOf(
            "Barbell Squat", "Barbell Bench Press", "Barbell Rows",
            "Barbell Deadlift", "Overhead Press", "Pull-ups", "Dumbbell Curls",
            "Leg Press", "Lat Pulldown"
        )
    )

    val splits = listOf("Push", "Pull", "Legs", "Upper", "Lower", "Full Body")
}

data class GamificationState(
    val level: Int = 1,
    val xpInLevel: Int = 0,
    val xpToNextLevel: Int = 100,
    val levelProgress: Float = 0f,
    val streak: Int = 0,
    val totalWorkouts: Int = 0,
    val dailyChallenges: List<Challenge> = emptyList(),
    val completedChallenges: Int = 0,
    val badges: List<Badge> = emptyList()
)

data class Challenge(val id: String, val name: String, val icon: String, val xp: Int, val completed: Boolean)
data class Badge(val id: String, val name: String, val icon: String)

fun calculateGamification(
    streak: Int,
    todayWorkouts: Int,
    todayMeals: Int,
    todayCalories: Float,
    targetCalories: Int,
    totalWorkoutDays: Int
): GamificationState {
    val xp = (totalWorkoutDays * 50) + (streak * 20)
    val level = (xp / 100) + 1
    val xpInLevel = xp % 100

    val challenges = listOf(
        Challenge("workout", "Complete a workout", "🏋️", 25, todayWorkouts > 0),
        Challenge("meal", "Log a meal", "🍽️", 15, todayMeals > 0),
        Challenge("calories", "Hit calorie target", "🔥", 30, todayCalories >= targetCalories * 0.9f)
    )

    val badges = buildList {
        if (streak >= 3) add(Badge("streak3", "3-Day Streak", "🔥"))
        if (streak >= 7) add(Badge("streak7", "Week Warrior", "⚡"))
        if (streak >= 30) add(Badge("streak30", "Monthly Master", "🏆"))
        if (totalWorkoutDays >= 10) add(Badge("10workouts", "10 Workouts", "💪"))
        if (totalWorkoutDays >= 50) add(Badge("50workouts", "50 Workouts", "🦾"))
    }

    return GamificationState(
        level = level, xpInLevel = xpInLevel, xpToNextLevel = 100,
        levelProgress = xpInLevel / 100f,
        streak = streak, totalWorkouts = totalWorkoutDays,
        dailyChallenges = challenges, completedChallenges = challenges.count { it.completed },
        badges = badges
    )
}

fun calculateMacros(weight: Float, height: Float, age: Int, gender: String, activityLevel: String, goal: String): MacroTargets {
    val bmr = if (gender == "male") {
        10 * weight + 6.25f * height - 5 * age + 5
    } else {
        10 * weight + 6.25f * height - 5 * age - 161
    }

    val multiplier = when (activityLevel) {
        "sedentary" -> 1.2f; "light" -> 1.375f; "moderate" -> 1.55f
        "active" -> 1.725f; "veryActive" -> 1.9f; else -> 1.55f
    }
    val tdee = bmr * multiplier

    return when (goal) {
        "cutting" -> {
            val cal = (tdee - 500).toInt()
            val protein = (weight * 2.2f).toInt()
            val fat = (cal * 0.25f / 9).toInt()
            val carbs = ((cal - protein * 4 - fat * 9) / 4).toInt()
            MacroTargets(cal, protein, carbs, fat)
        }
        "bulking" -> {
            val cal = (tdee + 500).toInt()
            val protein = (weight * 1.8f).toInt()
            val fat = (cal * 0.25f / 9).toInt()
            val carbs = ((cal - protein * 4 - fat * 9) / 4).toInt()
            MacroTargets(cal, protein, carbs, fat)
        }
        else -> {
            val cal = tdee.toInt()
            val protein = (weight * 1.6f).toInt()
            val fat = (cal * 0.25f / 9).toInt()
            val carbs = ((cal - protein * 4 - fat * 9) / 4).toInt()
            MacroTargets(cal, protein, carbs, fat)
        }
    }
}

data class MacroTargets(val calories: Int, val protein: Int, val carbs: Int, val fat: Int)
