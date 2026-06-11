package com.fittrack.data.db

import androidx.room.*

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String = "default_user",
    val height_cm: Float = 178f,
    val current_weight_kg: Float = 79f,
    val target_weight_kg: Float = 75f,
    val age: Int = 28,
    val gender: String = "male",
    val activity_level: String = "moderate",
    val goal: String = "cut",
    val daily_calorie_target: Int = 2000,
    val daily_protein_g: Int = 180,
    val daily_carbs_g: Int = 250,
    val daily_fat_g: Int = 65
)

@Entity(tableName = "weight_log")
data class WeightLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val user_id: String,
    val weight_kg: Float,
    val date: String
)

@Entity(tableName = "foods")
data class FoodEntity(
    @PrimaryKey val id: String,
    val name: String,
    val protein_g: Float,
    val carbs_g: Float,
    val fat_g: Float,
    val calories: Int,
    val category: String,
    val serving_size: String,
    val is_custom: Boolean = false
)

@Entity(tableName = "meals")
data class MealEntity(
    @PrimaryKey val id: String,
    val user_id: String,
    val food_id: String,
    val food_name: String,
    val portion_size: Float = 1f,
    val meal_type: String = "lunch",
    val calories: Int,
    val protein_g: Float,
    val carbs_g: Float,
    val fat_g: Float,
    val date: String,
    val created_at: Long = System.currentTimeMillis()
)

@Entity(tableName = "workouts")
data class WorkoutEntity(
    @PrimaryKey val id: String,
    val user_id: String,
    val split_type: String,
    val date: String,
    val duration_minutes: Int = 60,
    val created_at: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "exercises",
    foreignKeys = [ForeignKey(
        entity = WorkoutEntity::class,
        parentColumns = ["id"],
        childColumns = ["workout_id"],
        onDelete = ForeignKey.CASCADE
    )]
)
data class ExerciseEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val workout_id: String,
    val name: String,
    val sets: Int = 1,
    val reps: Int,
    val weight_kg: Float
)

data class WorkoutWithExercises(
    @Embedded val workout: WorkoutEntity,
    @Relation(parentColumn = "id", entityColumn = "workout_id")
    val exercises: List<ExerciseEntity>
)
