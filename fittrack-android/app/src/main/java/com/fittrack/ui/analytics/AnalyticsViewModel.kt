package com.fittrack.ui.analytics

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fittrack.data.db.*
import com.fittrack.data.repository.FitTrackRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AnalyticsViewModel @Inject constructor(
    private val repo: FitTrackRepository
) : ViewModel() {

    val todayMacros: StateFlow<MacroSummary> = repo.getTodayMacros()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), MacroSummary())

    val weeklyMacros: StateFlow<List<DailyMacro>> = repo.getWeeklyMacros()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val workoutDaysThisWeek: StateFlow<Int> = repo.getWorkoutDaysThisWeek()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val topExercises: StateFlow<List<ExerciseVolume>> = repo.getTopExercises()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val todayMeals = repo.getTodayMeals()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val user = repo.getUser()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    private val _streak = MutableStateFlow(0)
    val streak: StateFlow<Int> = _streak

    init {
        viewModelScope.launch { _streak.value = repo.getStreak() }
    }
}
