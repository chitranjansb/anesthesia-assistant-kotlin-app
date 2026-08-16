package com.example.anesthesiaassistant.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.anesthesiaassistant.domain.Calculators
import com.example.anesthesiaassistant.ui.components.DisclaimerBanner
import com.example.anesthesiaassistant.ui.theme.*
import java.util.Locale

@Composable
fun CalculatorsScreen(
    initialTab: Int = 0
) {
    var selectedTabIndex by remember { mutableStateOf(initialTab) }
    val tabs = listOf(
        "Anthropometric",
        "Fluids & Burns",
        "Hemodynamics & Labs",
        "Airway & Peds",
        "Risk Scores",
        "ICU & Vent",
        "LA Max Dose"
    )

    Column(modifier = Modifier.fillMaxSize()) {
        Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
            Text(
                text = "Clinical Calculators",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )
            Text(
                text = "Instant bedside mathematical models with reference formulas.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        ScrollableTabRow(
            selectedTabIndex = selectedTabIndex,
            edgePadding = 16.dp,
            indicator = { tabPositions ->
                TabRowDefaults.SecondaryIndicator(
                    Modifier.tabIndicatorOffset(tabPositions[selectedTabIndex]),
                    color = MaterialTheme.colorScheme.primary
                )
            }
        ) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTabIndex == index,
                    onClick = { selectedTabIndex = index },
                    text = {
                        Text(
                            text = title,
                            fontSize = 13.sp,
                            fontWeight = if (selectedTabIndex == index) FontWeight.Bold else FontWeight.Normal,
                            color = if (selectedTabIndex == index) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                )
            }
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(top = 16.dp, bottom = 90.dp)
        ) {
            item {
                DisclaimerBanner(compact = true)
            }

            when (selectedTabIndex) {
                0 -> {
                    item { AnthropometricCalculatorsSection() }
                }
                1 -> {
                    item { FluidsCalculatorsSection() }
                }
                2 -> {
                    item { HemodynamicsCalculatorsSection() }
                }
                3 -> {
                    item { AirwayPediatricCalculatorsSection() }
                }
                4 -> {
                    item { RiskScoresSection() }
                }
                5 -> {
                    item { IcuVentilatorSection() }
                }
                6 -> {
                    item { LocalAnestheticMaxDoseSection() }
                }
            }
        }
    }
}

// ---------------- 1. ANTHROPOMETRIC ----------------
@Composable
fun AnthropometricCalculatorsSection() {
    var weightText by remember { mutableStateOf("70") }
    var heightText by remember { mutableStateOf("170") }
    var isMale by remember { mutableStateOf(true) }

    val weightKg = weightText.toDoubleOrNull() ?: 70.0
    val heightCm = heightText.toDoubleOrNull() ?: 170.0

    val bmi = Calculators.bmi(weightKg, heightCm)
    val ibw = Calculators.idealBodyWeight(heightCm, isMale)
    val lbw = Calculators.leanBodyWeight(weightKg, heightCm, isMale)
    val abw = Calculators.adjustedBodyWeight(weightKg, ibw)

    val bmiCategory = when {
        bmi < 18.5 -> "Underweight"
        bmi < 25.0 -> "Normal weight"
        bmi < 30.0 -> "Overweight"
        bmi < 35.0 -> "Class I Obesity"
        bmi < 40.0 -> "Class II Obesity"
        else -> "Class III (Morbid) Obesity"
    }

    CalcCard(title = "BMI, Ideal & Lean Body Weight", formulaDesc = "Devine formula (IBW), Boer formula (LBW)") {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
            OutlinedTextField(
                value = weightText,
                onValueChange = { weightText = it },
                label = { Text("Weight (kg)") },
                modifier = Modifier.weight(1f),
                singleLine = true
            )
            OutlinedTextField(
                value = heightText,
                onValueChange = { heightText = it },
                label = { Text("Height (cm)") },
                modifier = Modifier.weight(1f),
                singleLine = true
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Sex: ", style = MaterialTheme.typography.bodyMedium)
            FilterChip(
                selected = isMale,
                onClick = { isMale = true },
                label = { Text("Male") },
                modifier = Modifier.padding(end = 8.dp)
            )
            FilterChip(
                selected = !isMale,
                onClick = { isMale = false },
                label = { Text("Female") }
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        ResultBox {
            ResultRow("Body Mass Index (BMI)", String.format(Locale.US, "%.1f kg/m² (%s)", bmi, bmiCategory), isHighlighted = true)
            ResultRow("Ideal Body Weight (IBW)", String.format(Locale.US, "%.1f kg", ibw))
            ResultRow("Lean Body Weight (LBW)", String.format(Locale.US, "%.1f kg", lbw))
            ResultRow("Adjusted Body Weight (ABW)", String.format(Locale.US, "%.1f kg", abw))
        }
    }
}

// ---------------- 2. FLUIDS & BURNS ----------------
@Composable
fun FluidsCalculatorsSection() {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        // 4-2-1 Rule
        var weightText by remember { mutableStateOf("70") }
        var npoHoursText by remember { mutableStateOf("8") }

        val weightKg = weightText.toDoubleOrNull() ?: 70.0
        val npoHours = npoHoursText.toDoubleOrNull() ?: 8.0

        val rate = Calculators.maintenanceFluidRateMlPerHr(weightKg)
        val deficit = Calculators.npoFluidDeficitMl(weightKg, npoHours)

        CalcCard(title = "Maintenance Fluids (4-2-1 Rule) & NPO Deficit", formulaDesc = "Holliday-Segar: 4 mL/kg (1st 10kg) + 2 mL/kg (2nd 10kg) + 1 mL/kg (remainder)") {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = weightText,
                    onValueChange = { weightText = it },
                    label = { Text("Weight (kg)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = npoHoursText,
                    onValueChange = { npoHoursText = it },
                    label = { Text("NPO Fasting (hours)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            ResultBox {
                ResultRow("Hourly Maintenance Rate", String.format(Locale.US, "%.0f mL/hr", rate), isHighlighted = true)
                ResultRow("Total NPO Deficit", String.format(Locale.US, "%.0f mL", deficit))
                ResultRow("1st Hour Replacement (50% + maint)", String.format(Locale.US, "%.0f mL/hr", deficit * 0.5 + rate))
                ResultRow("2nd & 3rd Hour (25% + maint each)", String.format(Locale.US, "%.0f mL/hr", deficit * 0.25 + rate))
            }
        }

        // Parkland Formula
        var burnWeightText by remember { mutableStateOf("70") }
        var tbsaText by remember { mutableStateOf("30") }

        val burnWeight = burnWeightText.toDoubleOrNull() ?: 70.0
        val tbsa = tbsaText.toDoubleOrNull() ?: 30.0
        val parkland = Calculators.parklandFormula(burnWeight, tbsa)

        CalcCard(title = "Parkland Burn Resuscitation Formula", formulaDesc = "4 mL × Weight(kg) × %TBSA (50% over first 8h, 50% over next 16h)") {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = burnWeightText,
                    onValueChange = { burnWeightText = it },
                    label = { Text("Weight (kg)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = tbsaText,
                    onValueChange = { tbsaText = it },
                    label = { Text("% TBSA Burned") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            ResultBox {
                ResultRow("Total 24-Hour Ringer's Lactate", String.format(Locale.US, "%.0f mL", parkland.total24hMl), isHighlighted = true)
                ResultRow("First 8 Hours Volume", String.format(Locale.US, "%.0f mL (%.0f mL/hr)", parkland.first8hMl, parkland.first8hRateMlPerHr))
                ResultRow("Next 16 Hours Volume", String.format(Locale.US, "%.0f mL (%.0f mL/hr)", parkland.next16hMl, parkland.next16hRateMlPerHr))
            }
        }

        // Blood Volume & Allowable Loss
        var ebvWeightText by remember { mutableStateOf("70") }
        var initialHctText by remember { mutableStateOf("38") }
        var targetHctText by remember { mutableStateOf("28") }
        var selectedPopMultiplier by remember { mutableStateOf(70.0) }

        val ebvWeight = ebvWeightText.toDoubleOrNull() ?: 70.0
        val initialHct = initialHctText.toDoubleOrNull() ?: 38.0
        val targetHct = targetHctText.toDoubleOrNull() ?: 28.0

        val ebv = Calculators.estimatedBloodVolumeMl(ebvWeight, selectedPopMultiplier)
        val mabl = Calculators.allowableBloodLossMl(ebv, initialHct, targetHct)

        CalcCard(title = "Estimated Blood Volume & Maximum Allowable Blood Loss (MABL)", formulaDesc = "MABL = EBV × (Hct_initial - Hct_target) / Hct_initial") {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = ebvWeightText,
                    onValueChange = { ebvWeightText = it },
                    label = { Text("Weight (kg)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = initialHctText,
                    onValueChange = { initialHctText = it },
                    label = { Text("Initial Hct (%)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = targetHctText,
                    onValueChange = { targetHctText = it },
                    label = { Text("Target Hct (%)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text("Population EBV Factor:", style = MaterialTheme.typography.bodyMedium)
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                listOf("Adult Male (75)" to 75.0, "Adult Female (65)" to 65.0, "Child (75)" to 75.0, "Neonate (85)" to 85.0).forEach { (label, mult) ->
                    FilterChip(
                        selected = selectedPopMultiplier == mult,
                        onClick = { selectedPopMultiplier = mult },
                        label = { Text(label, fontSize = 11.sp) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            ResultBox {
                ResultRow("Estimated Blood Volume (EBV)", String.format(Locale.US, "%.0f mL", ebv), isHighlighted = true)
                ResultRow("Maximum Allowable Blood Loss (MABL)", String.format(Locale.US, "%.0f mL", mabl))
            }
        }
    }
}

// ---------------- 3. HEMODYNAMICS & LABS ----------------
@Composable
fun HemodynamicsCalculatorsSection() {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        // MAP
        var sbpText by remember { mutableStateOf("120") }
        var dbpText by remember { mutableStateOf("80") }

        val sbp = sbpText.toDoubleOrNull() ?: 120.0
        val dbp = dbpText.toDoubleOrNull() ?: 80.0
        val map = Calculators.meanArterialPressure(sbp, dbp)

        CalcCard(title = "Mean Arterial Pressure (MAP)", formulaDesc = "MAP = DBP + 1/3 (SBP - DBP)") {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = sbpText,
                    onValueChange = { sbpText = it },
                    label = { Text("SBP (mmHg)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = dbpText,
                    onValueChange = { dbpText = it },
                    label = { Text("DBP (mmHg)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            ResultBox {
                ResultRow("Mean Arterial Pressure (MAP)", String.format(Locale.US, "%.1f mmHg", map), isHighlighted = true)
                ResultRow("Adequacy Target", if (map >= 65) "Adequate organ perfusion (≥65 mmHg)" else "Sub-target (<65 mmHg)", isCritical = map < 65)
            }
        }

        // Anion Gap
        var naText by remember { mutableStateOf("140") }
        var clText by remember { mutableStateOf("104") }
        var hco3Text by remember { mutableStateOf("24") }
        var kText by remember { mutableStateOf("4.0") }

        val na = naText.toDoubleOrNull() ?: 140.0
        val cl = clText.toDoubleOrNull() ?: 104.0
        val hco3 = hco3Text.toDoubleOrNull() ?: 24.0
        val k = kText.toDoubleOrNull()

        val agWithoutK = Calculators.anionGap(na, cl, hco3)
        val agWithK = Calculators.anionGap(na, cl, hco3, k)

        CalcCard(title = "Serum Anion Gap", formulaDesc = "AG = Na - (Cl + HCO3) [Normal 8–12 mEq/L]") {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(value = naText, onValueChange = { naText = it }, label = { Text("Na+") }, modifier = Modifier.weight(1f), singleLine = true)
                OutlinedTextField(value = clText, onValueChange = { clText = it }, label = { Text("Cl-") }, modifier = Modifier.weight(1f), singleLine = true)
                OutlinedTextField(value = hco3Text, onValueChange = { hco3Text = it }, label = { Text("HCO3-") }, modifier = Modifier.weight(1f), singleLine = true)
                OutlinedTextField(value = kText, onValueChange = { kText = it }, label = { Text("K+") }, modifier = Modifier.weight(1f), singleLine = true)
            }
            Spacer(modifier = Modifier.height(12.dp))
            ResultBox {
                ResultRow("Anion Gap (without K+)", String.format(Locale.US, "%.1f mEq/L (Normal 8–12)", agWithoutK), isHighlighted = true)
                ResultRow("Anion Gap (with K+)", String.format(Locale.US, "%.1f mEq/L (Normal 12–16)", agWithK))
                ResultRow("Interpretation", if (agWithoutK > 12) "High Anion Gap Metabolic Acidosis (MUDPILES/GOLDMARK)" else "Normal Anion Gap Acidosis / Normal")
            }
        }

        // Corrected Sodium
        var measuredNaText by remember { mutableStateOf("132") }
        var glucoseText by remember { mutableStateOf("350") }

        val measuredNa = measuredNaText.toDoubleOrNull() ?: 132.0
        val glucose = glucoseText.toDoubleOrNull() ?: 350.0
        val corrNaKatz = Calculators.correctedSodium(measuredNa, glucose, 1.6)
        val corrNaHillier = Calculators.correctedSodium(measuredNa, glucose, 2.4)

        CalcCard(title = "Corrected Sodium for Hyperglycemia", formulaDesc = "Katz: Na + 1.6 × ((Glucose - 100)/100)") {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(value = measuredNaText, onValueChange = { measuredNaText = it }, label = { Text("Measured Na+ (mEq/L)") }, modifier = Modifier.weight(1f), singleLine = true)
                OutlinedTextField(value = glucoseText, onValueChange = { glucoseText = it }, label = { Text("Glucose (mg/dL)") }, modifier = Modifier.weight(1f), singleLine = true)
            }
            Spacer(modifier = Modifier.height(12.dp))
            ResultBox {
                ResultRow("Corrected Na (Katz 1.6)", String.format(Locale.US, "%.1f mEq/L", corrNaKatz), isHighlighted = true)
                ResultRow("Corrected Na (Hillier 2.4)", String.format(Locale.US, "%.1f mEq/L", corrNaHillier))
            }
        }
    }
}

// ---------------- 4. AIRWAY & PEDIATRICS ----------------
@Composable
fun AirwayPediatricCalculatorsSection() {
    var ageYearsText by remember { mutableStateOf("4") }
    var weightText by remember { mutableStateOf("16") }

    val ageYears = ageYearsText.toDoubleOrNull() ?: 4.0
    val weightKg = weightText.toDoubleOrNull() ?: 16.0

    val uncuffed = Calculators.pediatricEttSizeMm(ageYears, cuffed = false)
    val cuffed = Calculators.pediatricEttSizeMm(ageYears, cuffed = true)
    val depthCm = Calculators.pediatricEttDepthCm(ageYears)

    CalcCard(title = "Pediatric ETT & Airway Sizing", formulaDesc = "Cole's Formula: Uncuffed = Age/4 + 4; Cuffed = Age/4 + 3.5; Depth = Age/2 + 12") {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
            OutlinedTextField(
                value = ageYearsText,
                onValueChange = { ageYearsText = it },
                label = { Text("Age (Years)") },
                modifier = Modifier.weight(1f),
                singleLine = true
            )
            OutlinedTextField(
                value = weightText,
                onValueChange = { weightText = it },
                label = { Text("Weight (kg)") },
                modifier = Modifier.weight(1f),
                singleLine = true
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        ResultBox {
            ResultRow("Cuffed ETT Internal Diameter", String.format(Locale.US, "%.1f mm ID", cuffed), isHighlighted = true)
            ResultRow("Uncuffed ETT Internal Diameter", String.format(Locale.US, "%.1f mm ID", uncuffed))
            ResultRow("ETT Depth (at lips)", String.format(Locale.US, "%.1f cm", depthCm))
            val lmaSize = when {
                weightKg < 5 -> "Size 1 (<5 kg)"
                weightKg < 10 -> "Size 1.5 (5–10 kg)"
                weightKg < 20 -> "Size 2 (10–20 kg)"
                weightKg < 30 -> "Size 2.5 (20–30 kg)"
                weightKg < 50 -> "Size 3 (30–50 kg)"
                weightKg < 70 -> "Size 4 (50–70 kg)"
                else -> "Size 5 (>70 kg)"
            }
            ResultRow("Supraglottic Airway (LMA)", lmaSize)
        }
    }
}

// ---------------- 5. RISK SCORES ----------------
@Composable
fun RiskScoresSection() {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        // Apfel PONV
        var female by remember { mutableStateOf(true) }
        var nonSmoker by remember { mutableStateOf(true) }
        var historyPonv by remember { mutableStateOf(false) }
        var postopOpioids by remember { mutableStateOf(true) }

        val apfel = Calculators.apfelScore(female, nonSmoker, historyPonv, postopOpioids)

        CalcCard(title = "Apfel PONV Risk Score", formulaDesc = "Predicts Post-Operative Nausea & Vomiting Risk (0 to 4 factors)") {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Female gender", style = MaterialTheme.typography.bodyMedium)
                Switch(checked = female, onCheckedChange = { female = it })
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Non-smoker", style = MaterialTheme.typography.bodyMedium)
                Switch(checked = nonSmoker, onCheckedChange = { nonSmoker = it })
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("History of PONV / Motion Sickness", style = MaterialTheme.typography.bodyMedium)
                Switch(checked = historyPonv, onCheckedChange = { historyPonv = it })
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Postoperative opioids planned", style = MaterialTheme.typography.bodyMedium)
                Switch(checked = postopOpioids, onCheckedChange = { postopOpioids = it })
            }

            Spacer(modifier = Modifier.height(8.dp))

            ResultBox {
                ResultRow("Apfel Score", "${apfel.score} / 4 factors", isHighlighted = true)
                ResultRow("Predicted PONV Risk", "${apfel.riskPercent}%", isCritical = apfel.score >= 3)
                ResultRow("Guideline Recommendation", when (apfel.score) {
                    0, 1 -> "Low risk: 1 antiemetic prophylactic or wait-and-see"
                    2 -> "Moderate risk: 2 antiemetic classes (e.g. Ondansetron + Dexamethasone)"
                    else -> "High risk: Multimodal 2–3 antiemetics + TIVA (Propofol) preferred"
                })
            }
        }

        // RCRI
        var highRiskSurg by remember { mutableStateOf(false) }
        var ihd by remember { mutableStateOf(false) }
        var chf by remember { mutableStateOf(false) }
        var cvd by remember { mutableStateOf(false) }
        var insulinDm by remember { mutableStateOf(false) }
        var creatOver2 by remember { mutableStateOf(false) }

        val rcri = Calculators.rcriScore(listOf(highRiskSurg, ihd, chf, cvd, insulinDm, creatOver2))

        CalcCard(title = "Revised Cardiac Risk Index (RCRI / Lee)", formulaDesc = "Predicts perioperative major cardiac event (MACE) risk") {
            val items = listOf(
                "High-risk surgery (Intraperitoneal, intrathoracic, vascular)" to highRiskSurg,
                "Ischemic heart disease (History of MI, angina, Q waves)" to ihd,
                "Congestive heart failure" to chf,
                "Cerebrovascular disease (Stroke, TIA)" to cvd,
                "Diabetes requiring preop insulin" to insulinDm,
                "Preoperative serum creatinine >2.0 mg/dL" to creatOver2
            )

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("High-risk surgery", style = MaterialTheme.typography.bodyMedium)
                Switch(checked = highRiskSurg, onCheckedChange = { highRiskSurg = it })
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Ischemic heart disease", style = MaterialTheme.typography.bodyMedium)
                Switch(checked = ihd, onCheckedChange = { ihd = it })
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Congestive heart failure", style = MaterialTheme.typography.bodyMedium)
                Switch(checked = chf, onCheckedChange = { chf = it })
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Cerebrovascular disease", style = MaterialTheme.typography.bodyMedium)
                Switch(checked = cvd, onCheckedChange = { cvd = it })
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Insulin-dependent diabetes", style = MaterialTheme.typography.bodyMedium)
                Switch(checked = insulinDm, onCheckedChange = { insulinDm = it })
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Preop Creatinine > 2.0 mg/dL", style = MaterialTheme.typography.bodyMedium)
                Switch(checked = creatOver2, onCheckedChange = { creatOver2 = it })
            }

            Spacer(modifier = Modifier.height(8.dp))

            ResultBox {
                ResultRow("RCRI Score", "${rcri.score} Points", isHighlighted = true)
                ResultRow("Estimated MACE Risk", String.format(Locale.US, "%.1f%%", rcri.riskPercent), isCritical = rcri.score >= 2)
            }
        }
    }
}

// ---------------- 6. ICU & VENTILATION ----------------
@Composable
fun IcuVentilatorSection() {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        var paO2Text by remember { mutableStateOf("85") }
        var fiO2PercentText by remember { mutableStateOf("50") }
        var peepText by remember { mutableStateOf("8") }

        val paO2 = paO2Text.toDoubleOrNull() ?: 85.0
        val fiO2 = (fiO2PercentText.toDoubleOrNull() ?: 50.0) / 100.0
        val peep = peepText.toDoubleOrNull() ?: 8.0

        val pf = Calculators.pfRatio(paO2, fiO2)
        val ardsSeverity = Calculators.ardsSeverityBerlin(pf, peep)

        CalcCard(title = "PaO2 / FiO2 (P/F) Ratio & Berlin ARDS Criteria", formulaDesc = "P/F = PaO2 / FiO2 (Mild: 201–300, Moderate: 101–200, Severe: ≤100 with PEEP ≥5)") {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(value = paO2Text, onValueChange = { paO2Text = it }, label = { Text("PaO2 (mmHg)") }, modifier = Modifier.weight(1f), singleLine = true)
                OutlinedTextField(value = fiO2PercentText, onValueChange = { fiO2PercentText = it }, label = { Text("FiO2 (%)") }, modifier = Modifier.weight(1f), singleLine = true)
                OutlinedTextField(value = peepText, onValueChange = { peepText = it }, label = { Text("PEEP (cmH2O)") }, modifier = Modifier.weight(1f), singleLine = true)
            }
            Spacer(modifier = Modifier.height(12.dp))
            ResultBox {
                ResultRow("P/F Ratio", String.format(Locale.US, "%.0f mmHg", pf), isHighlighted = true)
                ResultRow("Berlin ARDS Severity", ardsSeverity, isCritical = pf <= 200)
            }
        }

        // Lung Protective Tidal Volume
        var heightCmText by remember { mutableStateOf("175") }
        var isMaleVent by remember { mutableStateOf(true) }

        val heightCm = heightCmText.toDoubleOrNull() ?: 175.0
        val pbw = Calculators.idealBodyWeight(heightCm, isMaleVent)
        val tv4 = Calculators.lungProtectiveTidalVolumeMl(pbw, 4.0)
        val tv6 = Calculators.lungProtectiveTidalVolumeMl(pbw, 6.0)
        val tv8 = Calculators.lungProtectiveTidalVolumeMl(pbw, 8.0)

        CalcCard(title = "Lung-Protective Tidal Volume (ARDSNet)", formulaDesc = "Calculated based on Predicted Body Weight (PBW / Devine IBW)") {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(value = heightCmText, onValueChange = { heightCmText = it }, label = { Text("Height (cm)") }, modifier = Modifier.weight(1f), singleLine = true)
                FilterChip(selected = isMaleVent, onClick = { isMaleVent = true }, label = { Text("Male") })
                FilterChip(selected = !isMaleVent, onClick = { isMaleVent = false }, label = { Text("Female") })
            }
            Spacer(modifier = Modifier.height(12.dp))
            ResultBox {
                ResultRow("Predicted Body Weight (PBW)", String.format(Locale.US, "%.1f kg", pbw))
                ResultRow("Target 6 mL/kg (Standard)", String.format(Locale.US, "%.0f mL", tv6), isHighlighted = true)
                ResultRow("Range (4 to 8 mL/kg)", String.format(Locale.US, "%.0f – %.0f mL", tv4, tv8))
            }
        }
    }
}

// ---------------- 7. LOCAL ANESTHETIC MAX DOSE ----------------
@Composable
fun LocalAnestheticMaxDoseSection() {
    var weightText by remember { mutableStateOf("70") }
    var selectedDrug by remember { mutableStateOf(Calculators.LocalAnesthetic.LIDOCAINE) }
    var withEpi by remember { mutableStateOf(false) }

    val weightKg = weightText.toDoubleOrNull() ?: 70.0
    val maxDoseMg = Calculators.localAnestheticMaxDoseMg(selectedDrug, weightKg, withEpi)

    CalcCard(title = "Local Anesthetic Maximum Safe Dose & LAST Safety", formulaDesc = "Prevents systemic toxicity (LAST). Dosages based on lean/ideal body weight.") {
        OutlinedTextField(
            value = weightText,
            onValueChange = { weightText = it },
            label = { Text("Patient Weight (kg)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text("Select Local Anesthetic:", style = MaterialTheme.typography.bodyMedium)
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Calculators.LocalAnesthetic.values().forEach { drug ->
                FilterChip(
                    selected = selectedDrug == drug,
                    onClick = { selectedDrug = drug },
                    label = { Text(drug.displayName, fontSize = 11.sp) }
                )
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("With Epinephrine (Adrenaline)?", style = MaterialTheme.typography.bodyMedium)
            Switch(checked = withEpi, onCheckedChange = { withEpi = it })
        }

        Spacer(modifier = Modifier.height(12.dp))

        ResultBox {
            ResultRow("Maximum Safe Total Dose", String.format(Locale.US, "%.0f mg", maxDoseMg), isHighlighted = true)
            val maxVol2Pct = maxDoseMg / 20.0
            val maxVol1Pct = maxDoseMg / 10.0
            val maxVol05Pct = maxDoseMg / 5.0
            ResultRow("Max Volume @ 2.0% (20 mg/mL)", String.format(Locale.US, "%.1f mL", maxVol2Pct))
            ResultRow("Max Volume @ 1.0% (10 mg/mL)", String.format(Locale.US, "%.1f mL", maxVol1Pct))
            ResultRow("Max Volume @ 0.5% (5 mg/mL)", String.format(Locale.US, "%.1f mL", maxVol05Pct))
            ResultRow("Lipid Emulsion (Intralipid 20%) Rescue", "1.5 mL/kg IV bolus over 1 min → 0.25 mL/kg/min infusion", isCritical = true)
        }
    }
}

// ---------------- REUSABLE UI HELPERS ----------------

@Composable
private fun CalcCard(
    title: String,
    formulaDesc: String,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium.copy(fontSize = 15.sp),
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = formulaDesc,
                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 11.sp),
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(12.dp))
            content()
        }
    }
}

@Composable
private fun ResultBox(content: @Composable ColumnScope.() -> Unit) {
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
            content = content
        )
    }
}

@Composable
private fun ResultRow(label: String, value: String, isHighlighted: Boolean = false, isCritical: Boolean = false) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium.copy(
                fontSize = if (isHighlighted) 13.sp else 12.sp,
                fontWeight = if (isHighlighted) FontWeight.SemiBold else FontWeight.Normal
            ),
            color = if (isCritical) CriticalRed else MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium.copy(
                fontSize = if (isHighlighted) 14.sp else 12.sp,
                fontWeight = if (isHighlighted) FontWeight.Bold else FontWeight.Medium,
                fontFamily = FontFamily.Monospace
            ),
            color = if (isCritical) CriticalRed else if (isHighlighted) TealPrimaryDark else MaterialTheme.colorScheme.onSurface
        )
    }
}
