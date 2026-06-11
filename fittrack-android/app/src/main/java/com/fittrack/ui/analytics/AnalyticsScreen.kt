package com.fittrack.ui.analytics

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.fittrack.ui.theme.*
import java.time.LocalDate

@Composable
fun AnalyticsScreen(viewModel: AnalyticsViewModel = hiltViewModel()) {
    val macros by viewModel.todayMacros.collectAsState()
    val weeklyMacros by viewModel.weeklyMacros.collectAsState()
    val workoutDays by viewModel.workoutDaysThisWeek.collectAsState()
    val topExercises by viewModel.topExercises.collectAsState()
    val todayMeals by viewModel.todayMeals.collectAsState()
    val user by viewModel.user.collectAsState()
    val streak by viewModel.streak.collectAsState()

    val today = LocalDate.now().toString()
    val avgCalories = if (weeklyMacros.isNotEmpty()) weeklyMacros.sumOf { it.calories.toDouble() }.toInt() / 7 else 0
    val avgProtein = if (weeklyMacros.isNotEmpty()) weeklyMacros.sumOf { it.protein_g.toDouble() }.toInt() / 7 else 0

    // Macro adherence: days within 10% of target
    val targetCal = user?.daily_calorie_target ?: 2000
    val adherentDays = weeklyMacros.count { it.calories >= targetCal * 0.9f && it.calories <= targetCal * 1.1f }
    val adherencePercent = if (weeklyMacros.isNotEmpty()) (adherentDays * 100) / weeklyMacros.size else 0

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text("📈 Analytics", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = TextDark)
            Text("Track your progress and insights", color = TextLight, fontSize = 14.sp)
            Spacer(Modifier.height(8.dp))
        }

        // This Week Summary
        item {
            Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DarkCard)) {
                Column(Modifier.padding(16.dp)) {
                    Text("This Week", fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(12.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                        StatItem("$workoutDays", "Workouts")
                        StatItem("$avgCalories", "Avg Cal")
                        StatItem("${avgProtein}g", "Avg Protein")
                        StatItem("$adherencePercent%", "Adherence")
                    }
                }
            }
        }

        // Today's Activity
        item {
            Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DarkCard)) {
                Column(Modifier.padding(16.dp)) {
                    Text("Today's Activity", fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(12.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                        StatItem("🏋️ $workoutDays", "Workouts")
                        StatItem("🍽️ ${todayMeals.size}", "Meals")
                        StatItem("🔥 ${macros.calories.toInt()}", "Calories")
                    }
                }
            }
        }

        // Macro adherence bar
        item {
            Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DarkCard)) {
                Column(Modifier.padding(16.dp)) {
                    Text("Macro Adherence", fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(4.dp))
                    Text("$adherentDays of ${weeklyMacros.size} days within 10% of target", color = TextLight, fontSize = 12.sp)
                    Spacer(Modifier.height(8.dp))
                    LinearProgressIndicator(
                        progress = { adherencePercent / 100f },
                        modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                        color = when {
                            adherencePercent > 75 -> Green80
                            adherencePercent > 50 -> Orange80
                            else -> Red80
                        }
                    )
                }
            }
        }

        // Top exercises
        if (topExercises.isNotEmpty()) {
            item {
                Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DarkCard)) {
                    Column(Modifier.padding(16.dp)) {
                        Text("Top Exercises (by Max Weight)", fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(8.dp))
                    }
                }
            }
            itemsIndexed(topExercises) { idx, ex ->
                Row(
                    Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        Modifier.size(28.dp).clip(RoundedCornerShape(6.dp)).background(Purple80.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) { Text("${idx + 1}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Purple80) }
                    Spacer(Modifier.width(10.dp))
                    Column(Modifier.weight(1f)) {
                        Text(ex.exercise_name, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        Text("${ex.total_sets} sets", color = TextLight, fontSize = 12.sp)
                    }
                    Text("${ex.max_weight.toInt()}kg", fontWeight = FontWeight.Bold, color = Cyan80)
                }
            }
        }

        // Weekly macros total
        item {
            val totalCal = weeklyMacros.sumOf { it.calories.toDouble() }.toInt()
            val totalP = weeklyMacros.sumOf { it.protein_g.toDouble() }.toInt()
            val totalC = weeklyMacros.sumOf { it.carbs_g.toDouble() }.toInt()
            val totalF = weeklyMacros.sumOf { it.fat_g.toDouble() }.toInt()

            Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DarkCard)) {
                Column(Modifier.padding(16.dp)) {
                    Text("Weekly Totals", fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(8.dp))
                    MacroRow("Calories", "$totalCal")
                    MacroRow("Protein", "${totalP}g")
                    MacroRow("Carbs", "${totalC}g")
                    MacroRow("Fat", "${totalF}g")
                }
            }
        }

        // Insights
        item {
            Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DarkCard)) {
                Column(Modifier.padding(16.dp)) {
                    Text("💡 Insights", fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(8.dp))
                    val insights = buildList {
                        if (workoutDays >= 4) add("💪 Solid week! You've crushed 4+ workouts.")
                        else if (workoutDays > 0) add("🏋️ ${7 - workoutDays} more workouts to hit 7 this week.")
                        else add("🎯 Time to get moving! Log your first workout.")
                        if (avgCalories > 0) add("📊 Average daily intake: $avgCalories cal")
                        if (avgProtein > 0) add("🥩 Average daily protein: ${avgProtein}g")
                        if (topExercises.isNotEmpty()) add("🏆 Strongest: ${topExercises[0].exercise_name} at ${topExercises[0].max_weight.toInt()}kg")
                        if (adherencePercent > 75) add("🎉 Excellent macro adherence!")
                        if (streak >= 3) add("🔥 $streak day streak! Keep it up!")
                    }
                    insights.forEach { Text(it, fontSize = 13.sp, modifier = Modifier.padding(vertical = 2.dp)) }
                }
            }
        }

        item { Spacer(Modifier.height(80.dp)) }
    }
}

@Composable
private fun StatItem(value: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, fontWeight = FontWeight.Bold, fontSize = 18.sp)
        Text(label, color = TextLight, fontSize = 11.sp)
    }
}

@Composable
private fun MacroRow(label: String, value: String) {
    Row(Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, color = TextLight, fontSize = 13.sp)
        Text(value, fontWeight = FontWeight.Bold, fontSize = 13.sp)
    }
}
