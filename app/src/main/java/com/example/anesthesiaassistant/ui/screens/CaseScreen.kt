package com.example.anesthesiaassistant.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.anesthesiaassistant.data.local.CaseEntity
import com.example.anesthesiaassistant.data.model.CaseInput
import com.example.anesthesiaassistant.data.model.CasePlanRow
import com.example.anesthesiaassistant.data.repository.ClinicalDataRepository
import com.example.anesthesiaassistant.domain.Calculators
import com.example.anesthesiaassistant.domain.CaseEngine
import com.example.anesthesiaassistant.ui.components.DisclaimerBanner
import com.example.anesthesiaassistant.ui.theme.*
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.Locale
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CaseScreen(
    repository: ClinicalDataRepository,
    onNavigateToDrug: (String) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val savedCases by repository.savedCases.collectAsState(initial = emptyList())

    var ageText by remember { mutableStateOf("45") }
    var weightText by remember { mutableStateOf("70") }
    var heightText by remember { mutableStateOf("170") }
    var selectedSex by remember { mutableStateOf("male") }
    var selectedAsa by remember { mutableStateOf("II") }
    var surgeryText by remember { mutableStateOf("Laparoscopic Cholecystectomy") }
    var selectedComorbidities by remember { mutableStateOf<Set<String>>(emptySet()) }
    var generatedPlan by remember { mutableStateOf<List<CasePlanRow>?>(null) }
    var caseLabelText by remember { mutableStateOf("") }
    var showSaveDialog by remember { mutableStateOf(false) }

    val commonComorbidities = listOf(
        "hypertension", "diabetes", "copd", "asthma", "obesity",
        "renal-failure", "liver-disease", "cad-ihd", "geriatric", "pregnancy"
    )

    val age = ageText.toDoubleOrNull() ?: 45.0
    val weight = weightText.toDoubleOrNull() ?: 70.0
    val height = heightText.toDoubleOrNull() ?: 170.0
    val isMale = selectedSex == "male"

    val bmi = Calculators.bmi(weight, height)
    val ibw = Calculators.idealBodyWeight(height, isMale)
    val maintFluid = Calculators.maintenanceFluidRateMlPerHr(weight)

    fun runPlanGeneration() {
        val input = CaseInput(
            ageYears = age,
            weightKg = weight,
            sex = selectedSex,
            asa = selectedAsa,
            surgery = surgeryText,
            comorbidities = selectedComorbidities.toList()
        )
        generatedPlan = CaseEngine.generateCasePlan(input)
    }

    LaunchedEffect(Unit) {
        runPlanGeneration()
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 90.dp)
    ) {
        item {
            Column {
                Text(
                    text = "Case Planning Mode",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Rule-based perioperative plan builder tailored to patient physiology and surgery.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        item {
            DisclaimerBanner(compact = true)
        }

        // Patient Demographics Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "1. PATIENT DEMOGRAPHICS & PHYSIOLOGY",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.primary
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            value = ageText,
                            onValueChange = { ageText = it; runPlanGeneration() },
                            label = { Text("Age (yrs)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = weightText,
                            onValueChange = { weightText = it; runPlanGeneration() },
                            label = { Text("Weight (kg)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = heightText,
                            onValueChange = { heightText = it; runPlanGeneration() },
                            label = { Text("Height (cm)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("Sex: ", style = MaterialTheme.typography.bodyMedium)
                        FilterChip(
                            selected = selectedSex == "male",
                            onClick = { selectedSex = "male"; runPlanGeneration() },
                            label = { Text("Male") },
                            modifier = Modifier.padding(end = 8.dp)
                        )
                        FilterChip(
                            selected = selectedSex == "female",
                            onClick = { selectedSex = "female"; runPlanGeneration() },
                            label = { Text("Female") }
                        )
                    }

                    // Derived quick numbers badge
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("BMI: ${String.format(Locale.US, "%.1f", bmi)}", style = MaterialTheme.typography.labelSmall)
                            Text("IBW: ${String.format(Locale.US, "%.1f kg", ibw)}", style = MaterialTheme.typography.labelSmall)
                            Text("Maint: ${String.format(Locale.US, "%.0f mL/h", maintFluid)}", style = MaterialTheme.typography.labelSmall)
                        }
                    }

                    // ASA Physical Status
                    Text("ASA Physical Status:", style = MaterialTheme.typography.bodyMedium)
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        listOf("I", "II", "III", "IV", "V", "E").forEach { asaClass ->
                            FilterChip(
                                selected = selectedAsa == asaClass,
                                onClick = { selectedAsa = asaClass; runPlanGeneration() },
                                label = { Text(asaClass, fontSize = 11.sp) }
                            )
                        }
                    }

                    // Surgery
                    OutlinedTextField(
                        value = surgeryText,
                        onValueChange = { surgeryText = it; runPlanGeneration() },
                        label = { Text("Planned Surgery / Procedure") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    // Comorbidities
                    Text("Comorbidities & Risk Factors:", style = MaterialTheme.typography.bodyMedium)
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        commonComorbidities.chunked(3).forEach { rowComorbs ->
                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                rowComorbs.forEach { comorb ->
                                    val isSelected = selectedComorbidities.contains(comorb)
                                    FilterChip(
                                        selected = isSelected,
                                        onClick = {
                                            selectedComorbidities = if (isSelected) {
                                                selectedComorbidities - comorb
                                            } else {
                                                selectedComorbidities + comorb
                                            }
                                            runPlanGeneration()
                                        },
                                        label = { Text(comorb, fontSize = 10.sp) }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Generated Anesthetic Plan Section
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "2. STRUCTURED ANESTHETIC PLAN",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary
                )
                Button(
                    onClick = {
                        caseLabelText = "$surgeryText (${selectedSex.replaceFirstChar { it.uppercase() }}, ${age.toInt()}y)"
                        showSaveDialog = true
                    },
                    shape = RoundedCornerShape(6.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Save Case", fontSize = 12.sp)
                }
            }
        }

        generatedPlan?.let { planList ->
            items(planList) { row ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
                ) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = row.section,
                                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                        Text(
                            text = row.text,
                            style = MaterialTheme.typography.bodyMedium.copy(fontSize = 13.sp),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        if (!row.rationale.isNullOrBlank()) {
                            Text(
                                text = "Rationale: ${row.rationale}",
                                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 11.sp),
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        if (row.drugIds.isNotEmpty()) {
                            Row(
                                modifier = Modifier.padding(top = 4.dp),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                row.drugIds.forEach { drugId ->
                                    Surface(
                                        shape = RoundedCornerShape(4.dp),
                                        color = TealPrimaryContainerDark,
                                        modifier = Modifier.clickable { onNavigateToDrug(drugId) }
                                    ) {
                                        Text(
                                            text = drugId,
                                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                                            color = TealPrimaryDark,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Saved Cases List
        if (savedCases.isNotEmpty()) {
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "SAVED PATIENT CASES (${savedCases.size})",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            items(savedCases) { sc ->
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = sc.label,
                                style = MaterialTheme.typography.titleMedium.copy(fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            )
                            Text(
                                text = "${sc.ageYears.toInt()}y • ${sc.weightKg}kg • ASA ${sc.asa}",
                                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 11.sp),
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        IconButton(
                            onClick = {
                                coroutineScope.launch {
                                    repository.deleteCase(sc.id)
                                }
                            }
                        ) {
                            Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", tint = CriticalRed, modifier = Modifier.size(18.dp))
                        }
                    }
                }
            }
        }
    }

    // Save Case Dialog
    if (showSaveDialog) {
        AlertDialog(
            onDismissRequest = { showSaveDialog = false },
            title = { Text("Save Patient Case") },
            text = {
                OutlinedTextField(
                    value = caseLabelText,
                    onValueChange = { caseLabelText = it },
                    label = { Text("Case Label") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        coroutineScope.launch {
                            val newCase = CaseEntity(
                                id = UUID.randomUUID().toString(),
                                label = caseLabelText.ifBlank { "Patient Case" },
                                ageYears = age,
                                weightKg = weight,
                                sex = selectedSex,
                                asa = selectedAsa,
                                surgery = surgeryText,
                                comorbiditiesJson = Json.encodeToString(selectedComorbidities.toList()),
                                planJson = Json.encodeToString(generatedPlan ?: emptyList())
                            )
                            repository.saveCase(newCase)
                            showSaveDialog = false
                        }
                    }
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { showSaveDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
