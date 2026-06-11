package com.fittrack.ui.nutrition

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.fittrack.data.db.FoodEntity
import com.fittrack.ui.theme.*

@Composable
fun NutritionScreen(viewModel: NutritionViewModel = hiltViewModel()) {
    val foods by viewModel.foods.collectAsState()
    val meals by viewModel.todayMeals.collectAsState()
    val macros by viewModel.todayMacros.collectAsState()
    val user by viewModel.user.collectAsState()
    val selectedFoods by viewModel.selectedFoods.collectAsState()
    val message by viewModel.message.collectAsState()

    var activeTab by remember { mutableIntStateOf(0) }
    var searchQuery by remember { mutableStateOf("") }
    var showCustomForm by remember { mutableStateOf(false) }

    val u = user
    val remainingCal = ((u?.daily_calorie_target ?: 2000) - macros.calories).toInt()
    val remainingP = ((u?.daily_protein_g ?: 180) - macros.protein_g).toInt()
    val remainingC = ((u?.daily_carbs_g ?: 250) - macros.carbs_g).toInt()
    val remainingF = ((u?.daily_fat_g ?: 65) - macros.fat_g).toInt()

    val filteredFoods = if (searchQuery.isBlank()) foods else foods.filter { it.name.contains(searchQuery, ignoreCase = true) }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("🍽️ Nutrition", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = TextDark)
            Text("Track your daily meals and macros", color = TextLight, fontSize = 14.sp)
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(selected = activeTab == 0, onClick = { activeTab = 0 }, label = { Text("➕ Log New") })
                FilterChip(selected = activeTab == 1, onClick = { activeTab = 1 }, label = { Text("📋 Logged (${meals.size})") })
            }
        }

        if (activeTab == 0) {
            // Remaining macros
            item {
                Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DarkCard)) {
                    Column(Modifier.padding(14.dp)) {
                        Text("Remaining Today", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Spacer(Modifier.height(10.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                            MacroChip("Cal", "$remainingCal", Purple80)
                            MacroChip("P", "${remainingP}g", Cyan80)
                            MacroChip("C", "${remainingC}g", Orange80)
                            MacroChip("F", "${remainingF}g", Green80)
                        }
                    }
                }
            }

            // Search
            item {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    label = { Text("Search foods...") },
                    leadingIcon = { Icon(Icons.Default.Search, null) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
            }

            // Custom food button
            item {
                OutlinedButton(onClick = { showCustomForm = !showCustomForm }, modifier = Modifier.fillMaxWidth()) {
                    Text(if (showCustomForm) "✕ Cancel" else "+ Create Custom Food")
                }
            }

            if (showCustomForm) {
                item { CustomFoodForm(onSave = { name, p, c, f, cal, serving ->
                    viewModel.addCustomFood(name, p, c, f, cal, serving)
                    showCustomForm = false
                }) }
            }

            // Food list
            items(filteredFoods.take(20)) { food ->
                FoodItem(food = food, onAdd = { viewModel.addToSelected(food) })
            }

            // Selected foods
            if (selectedFoods.isNotEmpty()) {
                item {
                    Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DarkCard)) {
                        Column(Modifier.padding(14.dp)) {
                            Text("Selected (${selectedFoods.size})", fontWeight = FontWeight.Bold)
                            Spacer(Modifier.height(8.dp))
                            selectedFoods.forEachIndexed { idx, (food, portion) ->
                                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                                    Text(food.name, modifier = Modifier.weight(1f), fontSize = 13.sp)
                                    OutlinedTextField(
                                        value = portion.toString(),
                                        onValueChange = { viewModel.updatePortion(idx, it.toFloatOrNull() ?: 1f) },
                                        modifier = Modifier.width(60.dp),
                                        singleLine = true
                                    )
                                    IconButton(onClick = { viewModel.removeFromSelected(idx) }) {
                                        Icon(Icons.Default.Close, "Remove", tint = Red80, modifier = Modifier.size(18.dp))
                                    }
                                }
                            }
                            Spacer(Modifier.height(8.dp))
                            Button(
                                onClick = { viewModel.saveMeal(); activeTab = 1 },
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.buttonColors(containerColor = Purple80)
                            ) { Text("Save Meal") }
                        }
                    }
                }
            }
        }

        if (activeTab == 1) {
            if (meals.isEmpty()) {
                item { Text("No meals logged today", color = TextLight) }
            }
            items(meals) { meal ->
                Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DarkCard)) {
                    Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(meal.food_name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text("${meal.portion_size}x • ${(meal.calories * meal.portion_size).toInt()} cal • ${(meal.protein_g * meal.portion_size).toInt()}g P", color = TextLight, fontSize = 12.sp)
                        }
                        IconButton(onClick = { viewModel.deleteMeal(meal.id) }) {
                            Icon(Icons.Default.Delete, "Delete", tint = Red80, modifier = Modifier.size(18.dp))
                        }
                    }
                }
            }
        }

        item { Spacer(Modifier.height(80.dp)) }
    }
}

@Composable
private fun MacroChip(label: String, value: String, color: androidx.compose.ui.graphics.Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            Modifier.clip(RoundedCornerShape(8.dp)).background(color.copy(alpha = 0.2f)).padding(horizontal = 10.dp, vertical = 4.dp),
            contentAlignment = Alignment.Center
        ) { Text(value, color = color, fontWeight = FontWeight.Bold, fontSize = 13.sp) }
        Text(label, color = TextLight, fontSize = 11.sp)
    }
}

@Composable
private fun FoodItem(food: FoodEntity, onAdd: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DarkCard)) {
        Row(Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(food.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text("${food.protein_g}P | ${food.carbs_g}C | ${food.fat_g}F | ${food.calories}cal", color = TextLight, fontSize = 12.sp)
            }
            IconButton(onClick = onAdd) { Icon(Icons.Default.Add, "Add", tint = Green80) }
        }
    }
}

@Composable
private fun CustomFoodForm(onSave: (String, Float, Float, Float, Int, String) -> Unit) {
    var name by remember { mutableStateOf("") }
    var protein by remember { mutableStateOf("") }
    var carbs by remember { mutableStateOf("") }
    var fat by remember { mutableStateOf("") }
    var calories by remember { mutableStateOf("") }
    var serving by remember { mutableStateOf("1 serving") }

    Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DarkCard)) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Food Name") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = protein, onValueChange = { protein = it }, label = { Text("Protein") }, modifier = Modifier.weight(1f), singleLine = true)
                OutlinedTextField(value = carbs, onValueChange = { carbs = it }, label = { Text("Carbs") }, modifier = Modifier.weight(1f), singleLine = true)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = fat, onValueChange = { fat = it }, label = { Text("Fat") }, modifier = Modifier.weight(1f), singleLine = true)
                OutlinedTextField(value = calories, onValueChange = { calories = it }, label = { Text("Calories") }, modifier = Modifier.weight(1f), singleLine = true)
            }
            OutlinedTextField(value = serving, onValueChange = { serving = it }, label = { Text("Serving Size") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            Button(
                onClick = { onSave(name, protein.toFloatOrNull() ?: 0f, carbs.toFloatOrNull() ?: 0f, fat.toFloatOrNull() ?: 0f, calories.toIntOrNull() ?: 0, serving) },
                modifier = Modifier.fillMaxWidth()
            ) { Text("Create Food") }
        }
    }
}
