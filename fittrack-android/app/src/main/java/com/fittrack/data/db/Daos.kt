package com.fittrack.data.db

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {
    @Query("SELECT * FROM users WHERE id = :id")
    fun getUser(id: String = "default_user"): Flow<UserEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(user: UserEntity)

    @Query("UPDATE users SET current_weight_kg = :weight WHERE id = :id")
    suspend fun updateWeight(id: String = "default_user", weight: Float)

    @Query("UPDATE users SET goal = :goal, daily_calorie_target = :calories, daily_protein_g = :protein, daily_carbs_g = :carbs, daily_fat_g = :fat WHERE id = :id")
    suspend fun updateGoal(id: String = "default_user", goal: String, calories: Int, protein: Int, carbs: Int, fat: Int)
}

@Dao
interface WeightLogDao {
    @Insert
    suspend fun insert(log: WeightLogEntity)

    @Query("SELECT * FROM weight_log WHERE user_id = :userId ORDER BY date DESC")
    fun getAll(userId: String = "default_user"): Flow<List<WeightLogEntity>>
}

@Dao
interface FoodDao {
    @Query("SELECT * FROM foods ORDER BY category, name")
    fun getAll(): Flow<List<FoodEntity>>

    @Query("SELECT * FROM foods WHERE name LIKE '%' || :query || '%'")
    fun search(query: String): Flow<List<FoodEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(foods: List<FoodEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(food: FoodEntity)

    @Query("SELECT COUNT(*) FROM foods")
    suspend fun count(): Int
}

@Dao
interface MealDao {
    @Query("SELECT * FROM meals WHERE user_id = :userId AND date = :date ORDER BY created_at DESC")
    fun getMealsByDate(userId: String = "default_user", date: String): Flow<List<MealEntity>>

    @Insert
    suspend fun insert(meal: MealEntity)

    @Query("DELETE FROM meals WHERE id = :id")
    suspend fun delete(id: String)

    @Query("SELECT COALESCE(SUM(calories * portion_size), 0) as calories, COALESCE(SUM(protein_g * portion_size), 0) as protein_g, COALESCE(SUM(carbs_g * portion_size), 0) as carbs_g, COALESCE(SUM(fat_g * portion_size), 0) as fat_g FROM meals WHERE user_id = :userId AND date = :date")
    fun getMacrosByDate(userId: String = "default_user", date: String): Flow<MacroSummary>

    @Query("SELECT date, COALESCE(SUM(calories * portion_size), 0) as calories, COALESCE(SUM(protein_g * portion_size), 0) as protein_g, COALESCE(SUM(carbs_g * portion_size), 0) as carbs_g, COALESCE(SUM(fat_g * portion_size), 0) as fat_g FROM meals WHERE user_id = :userId AND date >= :startDate GROUP BY date")
    fun getWeeklyMacros(userId: String = "default_user", startDate: String): Flow<List<DailyMacro>>
}

data class MacroSummary(
    val calories: Float = 0f,
    val protein_g: Float = 0f,
    val carbs_g: Float = 0f,
    val fat_g: Float = 0f
)

data class DailyMacro(
    val date: String,
    val calories: Float,
    val protein_g: Float,
    val carbs_g: Float,
    val fat_g: Float
)

@Dao
interface WorkoutDao {
    @Transaction
    @Query("SELECT * FROM workouts WHERE user_id = :userId ORDER BY date DESC, created_at DESC")
    fun getAll(userId: String = "default_user"): Flow<List<WorkoutWithExercises>>

    @Insert
    suspend fun insertWorkout(workout: WorkoutEntity)

    @Insert
    suspend fun insertExercises(exercises: List<ExerciseEntity>)

    @Query("DELETE FROM workouts WHERE id = :id")
    suspend fun deleteWorkout(id: String)

    @Query("SELECT COUNT(DISTINCT date) FROM workouts WHERE user_id = :userId AND date >= :startDate")
    fun getWorkoutDaysCount(userId: String = "default_user", startDate: String): Flow<Int>

    @Query("SELECT name as exercise_name, MAX(weight_kg) as max_weight, COUNT(*) as total_sets FROM exercises WHERE workout_id IN (SELECT id FROM workouts WHERE user_id = :userId) GROUP BY name ORDER BY max_weight DESC LIMIT 5")
    fun getTopExercises(userId: String = "default_user"): Flow<List<ExerciseVolume>>

    @Query("SELECT COUNT(DISTINCT date) FROM workouts WHERE user_id = :userId")
    suspend fun getTotalWorkoutDays(userId: String = "default_user"): Int

    @Query("SELECT DISTINCT date FROM workouts WHERE user_id = :userId ORDER BY date DESC")
    suspend fun getAllWorkoutDates(userId: String = "default_user"): List<String>
}

data class ExerciseVolume(
    val exercise_name: String,
    val max_weight: Float,
    val total_sets: Int
)
