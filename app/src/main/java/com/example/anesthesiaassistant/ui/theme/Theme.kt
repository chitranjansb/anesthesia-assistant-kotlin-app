package com.example.anesthesiaassistant.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = TealPrimaryDark,
    onPrimary = SlateBackgroundDark,
    primaryContainer = TealPrimaryContainerDark,
    onPrimaryContainer = TealPrimaryDark,
    secondary = CyanAccent,
    onSecondary = SlateBackgroundDark,
    secondaryContainer = SlateSurfaceVariantDark,
    onSecondaryContainer = TealPrimaryDark,
    tertiary = IndigoAccent,
    background = SlateBackgroundDark,
    onBackground = SlateBackgroundLight,
    surface = SlateSurfaceDark,
    onSurface = SlateBackgroundLight,
    surfaceVariant = SlateSurfaceVariantDark,
    onSurfaceVariant = Color(0xFFCBD5E1),
    error = CriticalRed,
    onError = SlateBackgroundLight,
    errorContainer = CriticalRedContainer,
    onErrorContainer = CriticalRed,
    outline = SlateBorderDark
)

private val LightColorScheme = lightColorScheme(
    primary = TealPrimaryLight,
    onPrimary = SlateSurfaceLight,
    primaryContainer = TealPrimaryContainerLight,
    onPrimaryContainer = TealPrimaryLight,
    secondary = Color(0xFF0284C7),
    onSecondary = SlateSurfaceLight,
    secondaryContainer = SlateSurfaceVariantLight,
    onSecondaryContainer = Color(0xFF0369A1),
    tertiary = IndigoAccent,
    background = SlateBackgroundLight,
    onBackground = Color(0xFF0F172A),
    surface = SlateSurfaceLight,
    onSurface = Color(0xFF0F172A),
    surfaceVariant = SlateSurfaceVariantLight,
    onSurfaceVariant = Color(0xFF475569),
    error = CriticalRed,
    onError = SlateSurfaceLight,
    errorContainer = CriticalRedContainer,
    onErrorContainer = CriticalRedDark,
    outline = SlateBorderLight
)

@Composable
fun AnesthesiaAssistantTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            window.navigationBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
