package com.fittrack.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fittrack.data.db.MacroSummary
import com.fittrack.data.db.UserEntity
import com.fittrack.data.repository.FitTrackRepository
import com.fittrack.util.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val repo: FitTrackRepository
) : ViewModel() {

    val user: StateFlow<UserEntity?> = repo.getUser().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)
    val todayMacros: StateFlow<MacroSummary> = repo.getTodayMacros().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), MacroSummary())
    val todayMeals = repo.getTodayMeals().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val workouts = repo.getAllWorkouts().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _streak = MutableStateFlow(0)
    val streak: StateFlow<Int> = _streak

    private val _gamification = MutableStateFlow(GamificationState())
    val gamification: StateFlow<GamificationState> = _gamification

    private val _message = MutableStateFlow("")
    val message: StateFlow<String> = _message

    init {
        viewModelScope.launch {
            repo.seedFoodsIfNeeded()
            if (repo.getUser().first() == null) {
                repo.createOrUpdateUser(UserEntity())
            }
            _streak.value = repo.getStreak()
            updateGamification()
        }
    }

    private suspend fun updateGamification() {
        val today = java.time.LocalDate.now().toString()
        val todayWorkoutCount = workouts.value.count { it.workout.date == today }
        val totalDays = repo.getStreak() // approximation
        val macros = todayMacros.value
        val u = user.value

        _gamification.value = calculateGamification(
            streak = _streak.value,
            todayWorkouts = todayWorkoutCount,
            todayMeals = todayMeals.value.size,
            todayCalories = macros.calories,
            targetCalories = u?.daily_calorie_target ?: 2000,
            totalWorkoutDays = totalDays
        )
    }

    fun updateWeight(current: Float, target: Float) {
        viewModelScope.launch {
            repo.updateWeight(current)
            val u = user.value ?: return@launch
            repo.createOrUpdateUser(u.copy(current_weight_kg = current, target_weight_kg = target))
            _message.value = "✓ Weight updated!"
        }
    }

    fun selectGoal(goal: String) {
        viewModelScope.launch {
            val u = user.value ?: return@launch
            val macros = calculateMacros(u.current_weight_kg, u.height_cm, u.age, u.gender, u.activity_level, goal)
            repo.updateGoal(goal, macros.calories, macros.protein, macros.carbs, macros.fat)
            _message.value = "✓ Goal set to ${goal.uppercase()}!"
        }
    }

    fun clearMessage() { _message.value = "" }
}
