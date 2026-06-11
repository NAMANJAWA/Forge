package com.fittrack.di

import android.content.Context
import androidx.room.Room
import com.fittrack.data.db.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext ctx: Context): FitTrackDatabase =
        Room.databaseBuilder(ctx, FitTrackDatabase::class.java, "fittrack.db").build()

    @Provides fun provideUserDao(db: FitTrackDatabase): UserDao = db.userDao()
    @Provides fun provideWeightLogDao(db: FitTrackDatabase): WeightLogDao = db.weightLogDao()
    @Provides fun provideFoodDao(db: FitTrackDatabase): FoodDao = db.foodDao()
    @Provides fun provideMealDao(db: FitTrackDatabase): MealDao = db.mealDao()
    @Provides fun provideWorkoutDao(db: FitTrackDatabase): WorkoutDao = db.workoutDao()
}
