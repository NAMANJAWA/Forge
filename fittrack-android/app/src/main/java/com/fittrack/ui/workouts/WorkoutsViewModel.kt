package com.fittrack.ui.workouts

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fittrack.data.db.WorkoutWithExercises
import com.fittrack.data.repository.FitTrackRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class WorkoutsViewModel @Inject constructor(
    private val repo: FitTrackRepository
) : ViewModel() {

    val workouts: StateFlow<List<WorkoutWithExercises>> = repo.getAllWorkouts()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _message = MutableStateFlow("")
    val message: StateFlow<String> = _message

    fun saveWorkout(splitType: String, exercises: List<Pair<String, List<Pair<Int, Float>>>>) {
        viewModelScope.launch {
            repo.logWorkout(splitType, exercises)
            _message.value = "✓ Workout saved!"
        }
    }

    fun deleteWorkout(id: String) {
        viewModelScope.launch {
            repo.deleteWorkout(id)
            _message.value = "✓ Workout deleted"
        }
    }
}
