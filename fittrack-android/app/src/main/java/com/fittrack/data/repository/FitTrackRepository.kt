package com.fittrack.data.repository

import com.fittrack.data.db.*
import kotlinx.coroutines.flow.Flow
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FitTrackRepository @Inject constructor(
    private val userDao: UserDao,
    private val weightLogDao: WeightLogDao,
    private val foodDao: FoodDao,
    private val mealDao: MealDao,
    private val workoutDao: WorkoutDao
) {
    private val dateFormat = DateTimeFormatter.ISO_LOCAL_DATE

    fun getUser(): Flow<UserEntity?> = userDao.getUser()

    suspend fun createOrUpdateUser(user: UserEntity) = userDao.upsert(user)

    suspend fun updateWeight(weight: Float) {
        userDao.updateWeight(weight = weight)
        weightLogDao.insert(
            WeightLogEntity(user_id = "default_user", weight_kg = weight, date = today())
        )
    }

    suspend fun updateGoal(goal: String, calories: Int, protein: Int, carbs: Int, fat: Int) {
        userDao.updateGoal(goal = goal, calories = calories, protein = protein, carbs = carbs, fat = fat)
    }

    fun getWeightHistory(): Flow<List<WeightLogEntity>> = weightLogDao.getAll()

    fun getAllFoods(): Flow<List<FoodEntity>> = foodDao.getAll()

    fun searchFoods(query: String): Flow<List<FoodEntity>> = foodDao.search(query)

    suspend fun addCustomFood(name: String, protein: Float, carbs: Float, fat: Float, calories: Int, servingSize: String) {
        foodDao.insert(
            FoodEntity(
                id = UUID.randomUUID().toString(),
                name = name, protein_g = protein, carbs_g = carbs, fat_g = fat,
                calories = calories, category = "Custom", serving_size = servingSize, is_custom = true
            )
        )
    }

    suspend fun seedFoodsIfNeeded() {
        if (foodDao.count() == 0) foodDao.insertAll(SeedData.foods)
    }

    fun getTodayMeals(): Flow<List<MealEntity>> = mealDao.getMealsByDate(date = today())

    fun getTodayMacros(): Flow<MacroSummary> = mealDao.getMacrosByDate(date = today())

    fun getWeeklyMacros(): Flow<List<DailyMacro>> {
        val start = LocalDate.now().minusDays(6).format(dateFormat)
        return mealDao.getWeeklyMacros(startDate = start)
    }

    suspend fun logMeal(food: FoodEntity, portion: Float, mealType: String = "lunch") {
        mealDao.insert(
            MealEntity(
                id = UUID.randomUUID().toString(),
                user_id = "default_user",
                food_id = food.id,
                food_name = food.name,
                portion_size = portion,
                meal_type = mealType,
                calories = food.calories,
                protein_g = food.protein_g,
                carbs_g = food.carbs_g,
                fat_g = food.fat_g,
                date = today()
            )
        )
    }

    suspend fun deleteMeal(id: String) = mealDao.delete(id)

    fun getAllWorkouts(): Flow<List<WorkoutWithExercises>> = workoutDao.getAll()

    suspend fun logWorkout(splitType: String, exercises: List<Pair<String, List<Pair<Int, Float>>>>) {
        val workoutId = UUID.randomUUID().toString()
        workoutDao.insertWorkout(
            WorkoutEntity(id = workoutId, user_id = "default_user", split_type = splitType, date = today())
        )
        val entities = exercises.flatMap { (name, sets) ->
            sets.map { (reps, weight) ->
                ExerciseEntity(workout_id = workoutId, name = name, reps = reps, weight_kg = weight)
            }
        }
        workoutDao.insertExercises(entities)
    }

    suspend fun deleteWorkout(id: String) = workoutDao.deleteWorkout(id)

    fun getTopExercises(): Flow<List<ExerciseVolume>> = workoutDao.getTopExercises()

    fun getWorkoutDaysThisWeek(): Flow<Int> {
        val start = LocalDate.now().minusDays(6).format(dateFormat)
        return workoutDao.getWorkoutDaysCount(startDate = start)
    }

    suspend fun getStreak(): Int {
        val dates = workoutDao.getAllWorkoutDates()
        if (dates.isEmpty()) return 0
        var streak = 0
        var expected = LocalDate.now()
        for (dateStr in dates) {
            val date = LocalDate.parse(dateStr)
            if (date == expected) {
                streak++
                expected = expected.minusDays(1)
            } else if (date.isBefore(expected)) {
                break
            }
        }
        return streak
    }

    private fun today(): String = LocalDate.now().format(dateFormat)
}
