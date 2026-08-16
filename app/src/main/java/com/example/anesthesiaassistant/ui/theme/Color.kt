package com.example.anesthesiaassistant.ui.theme

import androidx.compose.ui.graphics.Color

// Brand palette - "Monitor" OR Vital Signs Aesthetic
val TealPrimaryDark = Color(0xFF2DD4BF)
val TealPrimaryLight = Color(0xFF0F766E)
val TealPrimaryContainerDark = Color(0xFF134E4A)
val TealPrimaryContainerLight = Color(0xFFCCFBF1)

val SlateBackgroundDark = Color(0xFF0B131C)
val SlateSurfaceDark = Color(0xFF121E2B)
val SlateSurfaceVariantDark = Color(0xFF1B2936)
val SlateBorderDark = Color(0xFF243447)

val SlateBackgroundLight = Color(0xFFF8FAFC)
val SlateSurfaceLight = Color(0xFFFFFFFF)
val SlateSurfaceVariantLight = Color(0xFFF1F5F9)
val SlateBorderLight = Color(0xFFE2E8F0)

val CriticalRed = Color(0xFFEF4444)
val CriticalRedDark = Color(0xFF991B1B)
val CriticalRedContainer = Color(0x33EF4444)

val AmberWarning = Color(0xFFF59E0B)
val AmberContainer = Color(0x33F59E0B)

val GreenSuccess = Color(0xFF10B981)
val GreenContainer = Color(0x3310B981)

val CyanAccent = Color(0xFF06B6D4)
val IndigoAccent = Color(0xFF6366F1)
val VioletAccent = Color(0xFF8B5CF6)
val RoseAccent = Color(0xFFF43F5E)

// Drug class badge colors
fun getDrugClassColor(colorName: String?, isDark: Boolean): Pair<Color, Color> {
    return when (colorName?.lowercase()) {
        "indigo" -> Color(0xFF6366F1) to if (isDark) Color(0x336366F1) else Color(0x1F6366F1)
        "rose" -> Color(0xFFF43F5E) to if (isDark) Color(0x33F43F5E) else Color(0x1FF43F5E)
        "amber" -> Color(0xFFF59E0B) to if (isDark) Color(0x33F59E0B) else Color(0x1FF59E0B)
        "emerald" -> Color(0xFF10B981) to if (isDark) Color(0x3310B981) else Color(0x1F10B981)
        "sky" -> Color(0xFF0EA5E9) to if (isDark) Color(0x330EA5E9) else Color(0x1F0EA5E9)
        "violet" -> Color(0xFF8B5CF6) to if (isDark) Color(0x338B5CF6) else Color(0x1F8B5CF6)
        "orange" -> Color(0xFFF97316) to if (isDark) Color(0x33F97316) else Color(0x1FF97316)
        "teal" -> Color(0xFF14B8A6) to if (isDark) Color(0x3314B8A6) else Color(0x1F14B8A6)
        "fuchsia" -> Color(0xFFD946EF) to if (isDark) Color(0x33D946EF) else Color(0x1FD946EF)
        "cyan" -> Color(0xFF06B6D4) to if (isDark) Color(0x3306B6D4) else Color(0x1F06B6D4)
        else -> Color(0xFF64748B) to if (isDark) Color(0x3364748B) else Color(0x1F64748B)
    }
}
