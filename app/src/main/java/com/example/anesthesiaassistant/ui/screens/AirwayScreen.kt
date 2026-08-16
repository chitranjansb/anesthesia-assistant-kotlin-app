package com.example.anesthesiaassistant.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.anesthesiaassistant.domain.Calculators
import com.example.anesthesiaassistant.ui.components.DisclaimerBanner
import com.example.anesthesiaassistant.ui.theme.*
import java.util.Locale

@Composable
fun AirwayScreen() {
    var ageYearsText by remember { mutableStateOf("5") }
    var weightKgText by remember { mutableStateOf("18") }

    val age = ageYearsText.toDoubleOrNull() ?: 5.0
    val weight = weightKgText.toDoubleOrNull() ?: 18.0

    val cuffed = Calculators.pediatricEttSizeMm(age, cuffed = true)
    val uncuffed = Calculators.pediatricEttSizeMm(age, cuffed = false)
    val depthCm = Calculators.pediatricEttDepthCm(age)

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 90.dp)
    ) {
        item {
            Column {
                Text(
                    text = "Airway Reference & Sizing",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Predictors of difficult airway, anatomical classifications, and tube calculators.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        item {
            DisclaimerBanner(compact = true)
        }

        // Pediatric & Adult Airway Sizing Tool
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "ENDOTRACHEAL TUBE & LMA SIZING CALCULATOR",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.primary
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            value = ageYearsText,
                            onValueChange = { ageYearsText = it },
                            label = { Text("Patient Age (Years)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = weightKgText,
                            onValueChange = { weightKgText = it },
                            label = { Text("Weight (kg)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Cuffed ETT Size (Cole Formula)", style = MaterialTheme.typography.bodyMedium)
                                Text(String.format(Locale.US, "%.1f mm ID", cuffed), style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold, color = TealPrimaryDark))
                            }
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Uncuffed ETT Size", style = MaterialTheme.typography.bodyMedium)
                                Text(String.format(Locale.US, "%.1f mm ID", uncuffed), style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold))
                            }
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("ETT Depth at Lips", style = MaterialTheme.typography.bodyMedium)
                                Text(String.format(Locale.US, "%.1f cm", depthCm), style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold))
                            }
                            val lma = when {
                                weight < 5 -> "Size 1 (<5 kg, max cuff 4 mL)"
                                weight < 10 -> "Size 1.5 (5–10 kg, max cuff 7 mL)"
                                weight < 20 -> "Size 2 (10–20 kg, max cuff 10 mL)"
                                weight < 30 -> "Size 2.5 (20–30 kg, max cuff 14 mL)"
                                weight < 50 -> "Size 3 (30–50 kg, max cuff 20 mL)"
                                weight < 70 -> "Size 4 (50–70 kg, max cuff 30 mL)"
                                else -> "Size 5 (>70 kg, max cuff 40 mL)"
                            }
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Laryngeal Mask (LMA)", style = MaterialTheme.typography.bodyMedium)
                                Text(lma, style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold, fontSize = 12.sp))
                            }
                        }
                    }
                }
            }
        }

        // Mallampati Classification
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "MALLAMPATI CLASSIFICATION (MODIFIED SAMSOON & YOUNG)",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.primary
                    )
                    val classes = listOf(
                        "Class I: Soft palate, fauces, uvula, pillars visible (Full visualization)",
                        "Class II: Soft palate, fauces, uvula visible",
                        "Class III: Soft palate, base of uvula visible (Predictor of difficult laryngoscopy)",
                        "Class IV: Hard palate only visible (High risk of difficult intubation)"
                    )
                    classes.forEach { cText ->
                        Text(
                            text = "• $cText",
                            style = MaterialTheme.typography.bodyMedium.copy(fontSize = 13.sp),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }

        // Difficult Intubation Mnemonics: LEMON
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "LEMON CRITERIA — DIFFICULT LARYNGOSCOPY",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = CyanAccent
                    )
                    val lemon = listOf(
                        "L — Look externally: Facial trauma, beard, micrognathia, large incisors, morbid obesity",
                        "E — Evaluate 3-3-2 rule: Interincisor distance (3 fingers), Hyoid-mental distance (3 fingers), Thyroid-to-hyoid (2 fingers)",
                        "M — Mallampati: Class III or IV",
                        "O — Obstruction: Epiglottitis, peritonsillar abscess, hematoma, Ludwig angina",
                        "N — Neck mobility: Cervical spine pathology, collar, ankylosing spondylitis"
                    )
                    lemon.forEach { lText ->
                        Text(
                            text = lText,
                            style = MaterialTheme.typography.bodyMedium.copy(fontSize = 13.sp),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }

        // Difficult Mask Ventilation: MOANS
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "MOANS CRITERIA — DIFFICULT BAG-MASK VENTILATION",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = AmberWarning
                    )
                    val moans = listOf(
                        "M — Mask seal: Beard, facial asymmetry, NG tube, blood/vomitus",
                        "O — Obesity / Obstruction: BMI > 30, OSA history, redundant pharyngeal tissue",
                        "A — Age: > 55 years (loss of muscular tone in upper airway)",
                        "N — No teeth: Edentulous (causes cheeks to sink in — keep dentures in during bag-mask if helpful)",
                        "S — Stiff lungs / Stridor: High airway resistance, COPD, asthma, severe pulmonary edema"
                    )
                    moans.forEach { mText ->
                        Text(
                            text = mText,
                            style = MaterialTheme.typography.bodyMedium.copy(fontSize = 13.sp),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }

        // CICO Emergency
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = CriticalRedContainer),
                border = BorderStroke(1.5.dp, CriticalRed)
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        text = "CAN'T INTUBATE, CAN'T OXYGENATE (CICO) EMERGENCY",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = CriticalRed
                    )
                    Text(
                        text = "1. Declare CICO emergency and call for senior help / ENT.\n" +
                                "2. Attempt rescue with Supraglottic Airway (2nd gen LMA).\n" +
                                "3. 100% O2, optimize muscle relaxation with neuromuscular blockade.\n" +
                                "4. Scalpel-Bougie-Tube emergency front-of-neck access (FONA / Cricothyrotomy).",
                        style = MaterialTheme.typography.bodyMedium.copy(fontSize = 13.sp, lineHeight = 18.sp),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }
    }
}
