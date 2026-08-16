package com.example.anesthesiaassistant.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.anesthesiaassistant.data.model.Drug
import com.example.anesthesiaassistant.data.repository.ClinicalDataRepository
import com.example.anesthesiaassistant.ui.components.DisclaimerBanner
import com.example.anesthesiaassistant.ui.components.DrugClassBadge
import com.example.anesthesiaassistant.ui.theme.*

@Composable
fun CompareScreen(
    repository: ClinicalDataRepository,
    drugIds: List<String>,
    onBack: () -> Unit
) {
    val drugs = remember(drugIds) {
        drugIds.mapNotNull { repository.getDrugById(it) }
    }

    val scrollState = rememberScrollState()

    Column(modifier = Modifier.fillMaxSize()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
            }
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(
                    text = "Drug Comparison",
                    style = MaterialTheme.typography.headlineMedium.copy(fontSize = 20.sp),
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Side-by-side pharmacological comparison",
                    style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        if (drugs.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Select drugs from the handbook to compare them side-by-side.")
            }
            return
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(bottom = 90.dp)
        ) {
            item {
                DisclaimerBanner(compact = true)
            }

            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
                ) {
                    Column(
                        modifier = Modifier
                            .padding(12.dp)
                            .horizontalScroll(scrollState)
                    ) {
                        // Headers
                        Row(modifier = Modifier.padding(bottom = 8.dp)) {
                            Box(modifier = Modifier.width(110.dp)) {
                                Text("Feature", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold), color = MaterialTheme.colorScheme.primary)
                            }
                            drugs.forEach { d ->
                                Column(modifier = Modifier.width(220.dp).padding(horizontal = 6.dp)) {
                                    Text(d.genericName, style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, fontSize = 14.sp))
                                    DrugClassBadge(drugClass = d.drugClass, classColor = d.classColor)
                                }
                            }
                        }

                        HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))

                        CompareMatrixRow("India Brands", drugs) { it.brandExamplesIndia.joinToString(", ").ifEmpty { "—" } }
                        CompareMatrixRow("Adult Dose", drugs) { it.doses.adult?.value ?: "—" }
                        CompareMatrixRow("RSI Bolus", drugs) { it.rsi?.value ?: "—" }
                        CompareMatrixRow("Infusion", drugs) { it.doses.infusion?.value ?: "—" }
                        CompareMatrixRow("Onset", drugs) { it.pharmacokinetics.onset ?: "—" }
                        CompareMatrixRow("Peak", drugs) { it.pharmacokinetics.peak ?: "—" }
                        CompareMatrixRow("Duration", drugs) { it.pharmacokinetics.duration ?: "—" }
                        CompareMatrixRow("Half-Life", drugs) { it.pharmacokinetics.halfLife ?: "—" }
                        CompareMatrixRow("Metabolism", drugs) { it.pharmacokinetics.metabolism ?: "—" }
                        CompareMatrixRow("Contraindications", drugs) { it.contraindications.joinToString("; ").ifEmpty { "None listed" } }
                        CompareMatrixRow("Antidote/Overdose", drugs) { it.overdoseManagement ?: "Supportive care" }
                    }
                }
            }
        }
    }
}

@Composable
private fun CompareMatrixRow(
    label: String,
    drugs: List<Drug>,
    extract: (Drug) -> String
) {
    Row(modifier = Modifier.padding(vertical = 6.dp), verticalAlignment = Alignment.Top) {
        Box(modifier = Modifier.width(110.dp)) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp, fontWeight = FontWeight.SemiBold),
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        drugs.forEach { d ->
            Box(modifier = Modifier.width(220.dp).padding(horizontal = 6.dp)) {
                Text(
                    text = extract(d),
                    style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp),
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }
    }
    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.15f))
}
