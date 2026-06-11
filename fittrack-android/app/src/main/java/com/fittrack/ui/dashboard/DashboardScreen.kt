package com.fittrack.ui.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.fittrack.ui.theme.*
import java.time.LocalDate

@Composable
fun DashboardScreen(
    onNavigateToWorkouts: () -> Unit = {},
    onNavigateToNutrition: () -> Unit = {},
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val user by viewModel.user.collectAsState()
    val macros by viewModel.todayMacros.collectAsState()
    val streak by viewModel.streak.collectAsState()
    val gamification by viewModel.gamification.collectAsState()
    val meals by viewModel.todayMeals.collectAsState()
    val workouts by viewModel.workouts.collectAsState()
    val message by viewModel.message.collectAsState()

    var showWeightDialog by remember { mutableStateOf(false) }
    var showGoalDialog by remember { mutableStateOf(false) }

    val today = LocalDate.now().toString()
    val todayWorkoutCount = workouts.count { it.workout.date == today }
    val u = user ?: return

    val remainingCal = (u.daily_calorie_target - macros.calories).toInt()
    val remainingProtein = (u.daily_protein_g - macros.protein_g).toInt()
    val remainingCarbs = (u.daily_carbs_g - macros.carbs_g).toInt()
    val remainingFat = (u.daily_fat_g - macros.fat_g).toInt()

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text("Today", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = TextDark)
            Text(LocalDate.now().toString(), color = TextLight, fontSize = 14.sp)
            Spacer(Modifier.height(8.dp))
        }

        // Level card
        item {
            Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DarkCard)) {
                Column(Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            Modifier.size(48.dp).clip(RoundedCornerShape(12.dp))
                                .background(Brush.linearGradient(listOf(Purple80, Cyan80))),
                            contentAlignment = Alignment.Center
                        ) { Text("${gamification.level}", fontWeight = FontWeight.Bold, fontSize = 20.sp) }
                        Spacer(Modifier.width(12.dp))
                        Column {
                            Text("Level ${gamification.level}", fontWeight = FontWeight.Bold)
                            Text("${gamification.xpInLevel} / ${gamification.xpToNextLevel} XP", color = TextLight, fontSize = 12.sp)
                        }
                    }
                    Spacer(Modifier.height(8.dp))
                    LinearProgressIndicator(
                        progress = { gamification.levelProgress },
                        modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                        color = Purple80
                    )
                }
            }
        }

        // Streak
        item {
            Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DarkCard)) {
                Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text("🏆", fontSize = 32.sp)
                    Spacer(Modifier.width(12.dp))
                    Column {
                        Text("$streak days", fontSize = 24.sp, fontWeight = FontWeight.Bold)
                        Text("Current Streak", color = TextLight, fontSize = 13.sp)
                    }
                }
            }
        }

        // Daily Challenges
        item {
            Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DarkCard)) {
                Column(Modifier.padding(16.dp)) {
                    Text("Daily Challenges (${gamification.completedChallenges}/${gamification.dailyChallenges.size})", fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(8.dp))
                    gamification.dailyChallenges.forEach { ch ->
                        Row(
                            Modifier.fillMaxWidth().padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(ch.icon, fontSize = 20.sp)
                            Spacer(Modifier.width(8.dp))
                            Text(ch.name, modifier = Modifier.weight(1f), fontSize = 14.sp)
                            Text("+${ch.xp} XP", color = TextLight, fontSize = 12.sp)
                            if (ch.completed) Text(" ✓", color = Green80)
                        }
                    }
                }
            }
        }

        // Today's Progress
        item {
            Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DarkCard)) {
                Column(Modifier.padding(16.dp)) {
                    Text("Today's Progress", fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(12.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                        ProgressItem("🏋️", "$todayWorkoutCount", "Workouts")
                        ProgressItem("🍽️", "${meals.size}", "Meals")
                        ProgressItem("🔥", "${macros.calories.toInt()}", "Calories")
                        ProgressItem("💪", "${macros.protein_g.toInt()}g", "Protein")
                    }
                }
            }
        }

        // Remaining Macros
        item {
            Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DarkCard)) {
                Column(Modifier.padding(16.dp)) {
                    Text("Remaining Macros", fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(12.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                        MacroChip("Cal", remainingCal.toString(), Purple80)
                        MacroChip("P", "${remainingProtein}g", Cyan80)
                        MacroChip("C", "${remainingCarbs}g", Orange80)
                        MacroChip("F", "${remainingFat}g", Green80)
                    }
                }
            }
        }

        // Weight & Goal row
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Card(
                    modifier = Modifier.weight(1f).clickable { showGoalDialog = true },
                    colors = CardDefaults.cardColors(containerColor = DarkCard)
                ) {
                    Column(Modifier.padding(14.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("🎯", fontSize = 24.sp)
                        Spacer(Modifier.height(4.dp))
                        Text("Goal", fontSize = 12.sp, color = TextLight)
                        Text(u.goal.replaceFirstChar { it.uppercase() }, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }
                }
                Card(
                    modifier = Modifier.weight(1f).clickable { showWeightDialog = true },
                    colors = CardDefaults.cardColors(containerColor = DarkCard)
                ) {
                    Column(Modifier.padding(14.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("⚖️", fontSize = 24.sp)
                        Spacer(Modifier.height(4.dp))
                        Text("Weight", fontSize = 12.sp, color = TextLight)
                        Text("${u.current_weight_kg}kg → ${u.target_weight_kg}kg", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }
        }

        // Action Buttons
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Button(onClick = onNavigateToWorkouts, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = Purple80)) {
                    Text("Log Workout")
                }
                OutlinedButton(onClick = onNavigateToNutrition, modifier = Modifier.weight(1f)) {
                    Text("Log Food")
                }
            }
        }

        // Badges
        if (gamification.badges.isNotEmpty()) {
            item {
                Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DarkCard)) {
                    Column(Modifier.padding(16.dp)) {
                        Text("Achievements (${gamification.badges.size})", fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(8.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                            gamification.badges.forEach { badge ->
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(badge.icon, fontSize = 28.sp)
                                    Text(badge.name, fontSize = 11.sp, color = TextLight)
                                }
                            }
                        }
                    }
                }
            }
        }

        item { Spacer(Modifier.height(80.dp)) }
    }

    // Weight Dialog
    if (showWeightDialog) {
        WeightDialog(
            currentWeight = u.current_weight_kg,
            targetWeight = u.target_weight_kg,
            onDismiss = { showWeightDialog = false },
            onSave = { current, target ->
                viewModel.updateWeight(current, target)
                showWeightDialog = false
            }
        )
    }

    // Goal Dialog
    if (showGoalDialog) {
        GoalDialog(
            currentGoal = u.goal,
            user = u,
            onDismiss = { showGoalDialog = false },
            onSelect = { goal ->
                viewModel.selectGoal(goal)
                showGoalDialog = false
            }
        )
    }

    // Snackbar message
    if (message.isNotEmpty()) {
        LaunchedEffect(message) {
            kotlinx.coroutines.delay(2000)
            viewModel.clearMessage()
        }
    }
}

@Composable
private fun ProgressItem(icon: String, value: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(icon, fontSize = 20.sp)
        Text(value, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        Text(label, color = TextLight, fontSize = 11.sp)
    }
}

@Composable
private fun MacroChip(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            Modifier.clip(RoundedCornerShape(8.dp)).background(color.copy(alpha = 0.2f)).padding(horizontal = 12.dp, vertical = 6.dp),
            contentAlignment = Alignment.Center
        ) { Text(value, color = color, fontWeight = FontWeight.Bold, fontSize = 14.sp) }
        Spacer(Modifier.height(4.dp))
        Text(label, color = TextLight, fontSize = 11.sp)
    }
}

@Composable
private fun WeightDialog(currentWeight: Float, targetWeight: Float, onDismiss: () -> Unit, onSave: (Float, Float) -> Unit) {
    var current by remember { mutableStateOf(currentWeight.toString()) }
    var target by remember { mutableStateOf(targetWeight.toString()) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Edit Weight") },
        text = {
            Column {
                OutlinedTextField(value = current, onValueChange = { current = it }, label = { Text("Current (kg)") })
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = target, onValueChange = { target = it }, label = { Text("Target (kg)") })
            }
        },
        confirmButton = {
            Button(onClick = { onSave(current.toFloatOrNull() ?: currentWeight, target.toFloatOrNull() ?: targetWeight) }) { Text("Save") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

@Composable
private fun GoalDialog(currentGoal: String, user: com.fittrack.data.db.UserEntity, onDismiss: () -> Unit, onSelect: (String) -> Unit) {
    val goals = listOf("cutting" to "📉", "maintenance" to "⚖️", "bulking" to "📈")
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Choose Your Goal") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                goals.forEach { (goal, icon) ->
                    val macros = com.fittrack.util.calculateMacros(user.current_weight_kg, user.height_cm, user.age, user.gender, user.activity_level, goal)
                    val isSelected = currentGoal == goal
                    Card(
                        modifier = Modifier.fillMaxWidth().clickable { onSelect(goal) },
                        colors = CardDefaults.cardColors(
                            containerColor = if (isSelected) Purple80.copy(alpha = 0.2f) else DarkCard
                        )
                    ) {
                        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text(icon, fontSize = 24.sp)
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.weight(1f)) {
                                Text(goal.replaceFirstChar { it.uppercase() }, fontWeight = FontWeight.Bold)
                                Text("${macros.calories} cal | ${macros.protein}g P", color = TextLight, fontSize = 12.sp)
                            }
                            if (isSelected) Text("✓", color = Green80, fontSize = 18.sp)
                        }
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Close") } }
    )
}
