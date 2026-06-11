package com.fittrack

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.fittrack.ui.analytics.AnalyticsScreen
import com.fittrack.ui.dashboard.DashboardScreen
import com.fittrack.ui.nutrition.NutritionScreen
import com.fittrack.ui.theme.FitTrackTheme
import com.fittrack.ui.workouts.WorkoutsScreen
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            FitTrackTheme {
                FitTrackApp()
            }
        }
    }
}

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    data object Dashboard : Screen("dashboard", "Dashboard", Icons.Default.Home)
    data object Workouts : Screen("workouts", "Workouts", Icons.Default.FitnessCenter)
    data object Nutrition : Screen("nutrition", "Nutrition", Icons.Default.Restaurant)
    data object Analytics : Screen("analytics", "Analytics", Icons.Default.Analytics)
}

@Composable
fun FitTrackApp() {
    val navController = rememberNavController()
    val screens = listOf(Screen.Dashboard, Screen.Workouts, Screen.Nutrition, Screen.Analytics)
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    Scaffold(
        bottomBar = {
            NavigationBar {
                screens.forEach { screen ->
                    NavigationBarItem(
                        icon = { Icon(screen.icon, contentDescription = screen.title) },
                        label = { Text(screen.title) },
                        selected = currentRoute == screen.route,
                        onClick = {
                            if (currentRoute != screen.route) {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.startDestinationId) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        }
                    )
                }
            }
        }
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Dashboard.route,
            modifier = Modifier.padding(padding)
        ) {
            composable(Screen.Dashboard.route) {
                DashboardScreen(
                    onNavigateToWorkouts = { navController.navigate(Screen.Workouts.route) },
                    onNavigateToNutrition = { navController.navigate(Screen.Nutrition.route) }
                )
            }
            composable(Screen.Workouts.route) { WorkoutsScreen() }
            composable(Screen.Nutrition.route) { NutritionScreen() }
            composable(Screen.Analytics.route) { AnalyticsScreen() }
        }
    }
}
