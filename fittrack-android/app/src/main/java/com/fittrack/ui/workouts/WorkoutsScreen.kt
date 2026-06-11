package com.fittrack.ui.workouts

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.fittrack.ui.theme.*
import com.fittrack.util.ExerciseData

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WorkoutsScreen(viewModel: WorkoutsViewModel = hiltViewModel()) {
    val workouts by viewModel.workouts.collectAsState()
    val message by viewModel.message.collectAsState()

    var activeTab by remember { mutableIntStateOf(0) }
    var selectedSplit by remember { mutableStateOf("push") }
    var exercises by remember { mutableStateOf(listOf(ExerciseInput())) }
    var saving by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("💪 Workouts", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = TextDark)
            Text("Track your strength training", color = TextLight, fontSize = 14.sp)
            Spacer(Modifier.height(12.dp))
        }

        // Tabs
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(selected = activeTab == 0, onClick = { activeTab = 0 }, label = { Text("📝 Log New") })
                FilterChip(selected = activeTab == 1, onClick = { activeTab = 1 }, label = { Text("📊 History") })
            }
        }

        if (activeTab == 0) {
            // Split selector
            item {
                Text("Workout Split", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Spacer(Modifier.height(8.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    ExerciseData.splits.forEach { split ->
                        FilterChip(
                            selected = selectedSplit == split.lowercase(),
                            onClick = { selectedSplit = split.lowercase() },
                            label = { Text(split, fontSize = 12.sp) }
                        )
                    }
                }
            }

            // Exercise inputs
            items(exercises.size) { idx ->
                ExerciseCard(
                    exercise = exercises[idx],
                    split = selectedSplit,
                    onUpdate = { updated -> exercises = exercises.toMutableList().also { it[idx] = updated } },
                    onRemove = { if (exercises.size > 1) exercises = exercises.toMutableList().also { it.removeAt(idx) } }
                )
            }

            item {
                OutlinedButton(onClick = { exercises = exercises + ExerciseInput() }, modifier = Modifier.fillMaxWidth()) {
                    Icon(Icons.Default.Add, null); Spacer(Modifier.width(4.dp)); Text("Add Exercise")
                }
                Spacer(Modifier.height(8.dp))
                Button(
                    onClick = {
                        saving = true
                        val valid = exercises.filter { it.name.isNotBlank() && it.sets.any { s -> s.reps > 0 } }
                        if (valid.isNotEmpty()) {
                            viewModel.saveWorkout(selectedSplit, valid.map { ex ->
                                ex.name to ex.sets.filter { it.reps > 0 }.map { it.reps to it.weight }
                            })
                            exercises = listOf(ExerciseInput())
                            activeTab = 1
                        }
                        saving = false
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !saving,
                    colors = ButtonDefaults.buttonColors(containerColor = Purple80)
                ) { Text(if (saving) "Saving..." else "Save Workout") }
            }
        }

        if (activeTab == 1) {
            if (workouts.isEmpty()) {
                item { Text("No workouts yet. Log one!", color = TextLight) }
            }
            items(workouts) { workout ->
                var expanded by remember { mutableStateOf(false) }
                Card(
                    modifier = Modifier.fillMaxWidth().clickable { expanded = !expanded },
                    colors = CardDefaults.cardColors(containerColor = DarkCard)
                ) {
                    Column(Modifier.padding(14.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Column {
                                Text(workout.workout.split_type.uppercase(), fontWeight = FontWeight.Bold, color = Purple80, fontSize = 13.sp)
                                Text(workout.workout.date, color = TextLight, fontSize = 12.sp)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("${workout.exercises.map { it.name }.toSet().size} exercises", color = TextLight, fontSize = 12.sp)
                                Text(if (expanded) " ▼" else " ▶", color = TextLight)
                            }
                        }
                        if (expanded) {
                            Spacer(Modifier.height(8.dp))
                            val grouped = workout.exercises.groupBy { it.name }
                            grouped.forEach { (name, sets) ->
                                Text(name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                sets.forEachIndexed { i, set ->
                                    Text("  Set ${i + 1}: ${set.reps}R @ ${set.weight_kg}kg", color = TextLight, fontSize = 13.sp)
                                }
                                Spacer(Modifier.height(4.dp))
                            }
                            Spacer(Modifier.height(8.dp))
                            TextButton(
                                onClick = { viewModel.deleteWorkout(workout.workout.id) },
                                colors = ButtonDefaults.textButtonColors(contentColor = Red80)
                            ) { Icon(Icons.Default.Delete, null, Modifier.size(16.dp)); Spacer(Modifier.width(4.dp)); Text("Delete") }
                        }
                    }
                }
            }
        }

        item { Spacer(Modifier.height(80.dp)) }
    }
}

data class ExerciseInput(
    val name: String = "",
    val sets: List<SetInput> = listOf(SetInput())
)

data class SetInput(val reps: Int = 0, val weight: Float = 0f)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ExerciseCard(exercise: ExerciseInput, split: String, onUpdate: (ExerciseInput) -> Unit, onRemove: () -> Unit) {
    val suggestions = ExerciseData.bySplit[split] ?: emptyList()
    val filtered = if (exercise.name.isBlank()) suggestions else suggestions.filter { it.contains(exercise.name, ignoreCase = true) }
    var showDropdown by remember { mutableStateOf(false) }

    Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = DarkCard)) {
        Column(Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                ExposedDropdownMenuBox(expanded = showDropdown, onExpandedChange = { showDropdown = it }, modifier = Modifier.weight(1f)) {
                    OutlinedTextField(
                        value = exercise.name,
                        onValueChange = { onUpdate(exercise.copy(name = it)); showDropdown = true },
                        label = { Text("Exercise") },
                        modifier = Modifier.menuAnchor().fillMaxWidth(),
                        singleLine = true
                    )
                    if (showDropdown && filtered.isNotEmpty()) {
                        ExposedDropdownMenu(expanded = true, onDismissRequest = { showDropdown = false }) {
                            filtered.take(5).forEach { name ->
                                DropdownMenuItem(
                                    text = { Text(name) },
                                    onClick = { onUpdate(exercise.copy(name = name)); showDropdown = false }
                                )
                            }
                        }
                    }
                }
                IconButton(onClick = onRemove) { Icon(Icons.Default.Close, "Remove", tint = Red80) }
            }

            Spacer(Modifier.height(8.dp))
            exercise.sets.forEachIndexed { idx, set ->
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Set ${idx + 1}", color = TextLight, fontSize = 12.sp, modifier = Modifier.width(40.dp))
                    OutlinedTextField(
                        value = if (set.reps == 0) "" else set.reps.toString(),
                        onValueChange = { v ->
                            val newSets = exercise.sets.toMutableList()
                            newSets[idx] = set.copy(reps = v.toIntOrNull() ?: 0)
                            onUpdate(exercise.copy(sets = newSets))
                        },
                        label = { Text("Reps") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    Text("@", color = TextLight)
                    OutlinedTextField(
                        value = if (set.weight == 0f) "" else set.weight.toString(),
                        onValueChange = { v ->
                            val newSets = exercise.sets.toMutableList()
                            newSets[idx] = set.copy(weight = v.toFloatOrNull() ?: 0f)
                            onUpdate(exercise.copy(sets = newSets))
                        },
                        label = { Text("kg") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }
            }
            Spacer(Modifier.height(4.dp))
            TextButton(onClick = { onUpdate(exercise.copy(sets = exercise.sets + SetInput())) }) {
                Text("+ Add Set", fontSize = 12.sp)
            }
        }
    }
}
