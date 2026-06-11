package com.fittrack.ui.nutrition

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fittrack.data.db.*
import com.fittrack.data.repository.FitTrackRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class NutritionViewModel @Inject constructor(
    private val repo: FitTrackRepository
) : ViewModel() {

    val foods: StateFlow<List<FoodEntity>> = repo.getAllFoods()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val todayMeals: StateFlow<List<MealEntity>> = repo.getTodayMeals()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val todayMacros: StateFlow<MacroSummary> = repo.getTodayMacros()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), MacroSummary())

    val user: StateFlow<UserEntity?> = repo.getUser()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    private val _selectedFoods = MutableStateFlow<List<Pair<FoodEntity, Float>>>(emptyList())
    val selectedFoods: StateFlow<List<Pair<FoodEntity, Float>>> = _selectedFoods

    private val _message = MutableStateFlow("")
    val message: StateFlow<String> = _message

    fun addToSelected(food: FoodEntity) {
        _selectedFoods.value = _selectedFoods.value + (food to 1f)
    }

    fun removeFromSelected(index: Int) {
        _selectedFoods.value = _selectedFoods.value.toMutableList().also { it.removeAt(index) }
    }

    fun updatePortion(index: Int, portion: Float) {
        _selectedFoods.value = _selectedFoods.value.toMutableList().also { it[index] = it[index].copy(second = portion) }
    }

    fun saveMeal() {
        viewModelScope.launch {
            _selectedFoods.value.forEach { (food, portion) ->
                repo.logMeal(food, portion)
            }
            _selectedFoods.value = emptyList()
            _message.value = "✓ Meal saved!"
        }
    }

    fun deleteMeal(id: String) {
        viewModelScope.launch { repo.deleteMeal(id) }
    }

    fun addCustomFood(name: String, protein: Float, carbs: Float, fat: Float, calories: Int, servingSize: String) {
        viewModelScope.launch {
            repo.addCustomFood(name, protein, carbs, fat, calories, servingSize)
            _message.value = "✓ Custom food created!"
        }
    }
}
