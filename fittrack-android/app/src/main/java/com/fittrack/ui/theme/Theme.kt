package com.fittrack.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Purple80 = Color(0xFF8B5CF6)
val Cyan80 = Color(0xFF06B6D4)
val Green80 = Color(0xFF10B981)
val Orange80 = Color(0xFFF59E0B)
val Red80 = Color(0xFFEF4444)

val DarkBg = Color(0xFF1a1a2e)
val DarkSurface = Color(0xFF16213e)
val DarkCard = Color(0xFF1e2a4a)
val TextLight = Color(0xFFa0a0b0)
val TextDark = Color(0xFFe0e0f0)

private val DarkColorScheme = darkColorScheme(
    primary = Purple80,
    secondary = Cyan80,
    tertiary = Green80,
    background = DarkBg,
    surface = DarkSurface,
    surfaceVariant = DarkCard,
    onBackground = TextDark,
    onSurface = TextDark,
    onSurfaceVariant = TextLight
)

@Composable
fun FitTrackTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography(),
        content = content
    )
}
