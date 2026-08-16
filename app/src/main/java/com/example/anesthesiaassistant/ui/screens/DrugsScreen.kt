package com.example.anesthesiaassistant.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.anesthesiaassistant.data.model.Drug
import com.example.anesthesiaassistant.data.model.DrugDose
import com.example.anesthesiaassistant.data.repository.ClinicalDataRepository
import com.example.anesthesiaassistant.ui.components.DisclaimerBanner
import com.example.anesthesiaassistant.ui.components.DrugClassBadge
import com.example.anesthesiaassistant.ui.components.VerificationBadge
import com.example.anesthesiaassistant.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun DrugsScreen(
    repository: ClinicalDataRepository,
    selectedDrugId: String? = null,
    onNavigateToCompare: (List<String>) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val allDrugs = remember { repository.getDrugs() }
    var searchQuery by remember { mutableStateOf("") }
    var selectedTag by remember { mutableStateOf<String?>(null) }
    var expandedDrugId by remember { mutableStateOf(selectedDrugId) }
    var calcDrug by remember { mutableStateOf<Drug?>(null) }

    // Compare list state
    var compareIds by remember { mutableStateOf<Set<String>>(emptySet()) }

    val allTags = remember(allDrugs) {
        allDrugs.flatMap { it.tags }.distinct().sorted()
    }

    val filteredDrugs = remember(allDrugs, searchQuery, selectedTag) {
        val q = searchQuery.trim().lowercase()
        allDrugs.filter { d ->
            val matchesQuery = q.isEmpty() ||
                    d.genericName.lowercase().contains(q) ||
                    d.brandExamplesIndia.any { it.lowercase().contains(q) } ||
                    d.drugClass.lowercase().contains(q) ||
                    d.tags.any { it.lowercase().contains(q) }
            val matchesTag = selectedTag == null || d.tags.contains(selectedTag)
            matchesQuery && matchesTag
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(top = 12.dp, bottom = 100.dp)
        ) {
            item {
                Column {
                    Text(
                        text = "Drug Handbook",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    Text(
                        text = "${allDrugs.size} anesthetic monographs with verified dosing, PK, toxicology, and Indian brand equivalents.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            item {
                DisclaimerBanner(compact = true)
            }

            // Search Bar
            item {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search by generic name, brand (India), class, tag...") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = MaterialTheme.colorScheme.primary) },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { searchQuery = "" }) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear")
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline
                    )
                )
            }

            // Filter Chips
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    item {
                        FilterChip(
                            selected = selectedTag == null,
                            onClick = { selectedTag = null },
                            label = { Text("All (${allDrugs.size})", fontSize = 12.sp) }
                        )
                    }
                    items(allTags) { tag ->
                        FilterChip(
                            selected = selectedTag == tag,
                            onClick = { selectedTag = if (selectedTag == tag) null else tag },
                            label = { Text(tag, fontSize = 12.sp) }
                        )
                    }
                }
            }

            if (filteredDrugs.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 40.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No drugs found matching criteria.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                items(filteredDrugs, key = { it.id }) { drug ->
                    val isExpanded = expandedDrugId == drug.id
                    val isInCompare = compareIds.contains(drug.id)
                    val isFavFlow = remember(drug.id) { repository.isFavorite("drug:${drug.id}") }
                    val isFavorite by isFavFlow.collectAsState(initial = false)

                    DrugItemCard(
                        drug = drug,
                        isExpanded = isExpanded,
                        isInCompare = isInCompare,
                        isFavorite = isFavorite,
                        onToggleExpand = {
                            expandedDrugId = if (isExpanded) null else drug.id
                            if (!isExpanded) {
                                coroutineScope.launch {
                                    repository.logRecent("drug", drug.id, drug.genericName)
                                }
                            }
                        },
                        onToggleFavorite = {
                            coroutineScope.launch {
                                repository.toggleFavorite(
                                    kind = "drug",
                                    refId = drug.id,
                                    title = drug.genericName,
                                    subtitle = drug.drugClass,
                                    isFav = isFavorite
                                )
                            }
                        },
                        onToggleCompare = {
                            compareIds = if (isInCompare) {
                                compareIds - drug.id
                            } else {
                                if (compareIds.size < 3) compareIds + drug.id else compareIds
                            }
                        },
                        onOpenQuickCalc = { calcDrug = drug }
                    )
                }
            }
        }

        // Bottom Compare Action Banner
        if (compareIds.isNotEmpty()) {
            Surface(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp,
                shadowElevation = 8.dp,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.5f))
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "${compareIds.size}/3 drugs selected",
                            style = MaterialTheme.typography.titleMedium.copy(fontSize = 13.sp, fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Compare side-by-side monographs",
                            style = MaterialTheme.typography.bodyMedium.copy(fontSize = 11.sp),
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        TextButton(onClick = { compareIds = emptySet() }) {
                            Text("Clear", fontSize = 12.sp)
                        }
                        Button(
                            onClick = { onNavigateToCompare(compareIds.toList()) },
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Icon(Icons.Default.CompareArrows, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Compare", fontSize = 12.sp)
                        }
                    }
                }
            }
        }

        // Quick Dose Calculation Modal
        calcDrug?.let { drug ->
            QuickDrugCalcDialog(drug = drug, onDismiss = { calcDrug = null })
        }
    }
}

@Composable
fun DrugItemCard(
    drug: Drug,
    isExpanded: Boolean,
    isInCompare: Boolean,
    isFavorite: Boolean,
    onToggleExpand: () -> Unit,
    onToggleFavorite: () -> Unit,
    onToggleCompare: () -> Unit,
    onOpenQuickCalc: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(
            1.dp,
            if (isExpanded) MaterialTheme.colorScheme.primary.copy(alpha = 0.6f)
            else MaterialTheme.colorScheme.outline.copy(alpha = 0.4f)
        )
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // Header Row (Always visible)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable(onClick = onToggleExpand)
                    .padding(14.dp),
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = drug.genericName,
                            style = MaterialTheme.typography.titleLarge.copy(fontSize = 16.sp),
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        VerificationBadge(status = drug.verificationStatus)
                    }

                    if (drug.brandExamplesIndia.isNotEmpty()) {
                        Text(
                            text = "India: ${drug.brandExamplesIndia.joinToString(", ")}",
                            style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp),
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        DrugClassBadge(drugClass = drug.drugClass, classColor = drug.classColor)
                        if (drug.rsi != null) {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = CriticalRedContainer
                            ) {
                                Text(
                                    text = "RSI",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold
                                    ),
                                    color = CriticalRed,
                                    modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = onOpenQuickCalc) {
                        Icon(
                            imageVector = Icons.Default.Calculate,
                            contentDescription = "Quick Dose Calculator",
                            tint = CyanAccent,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    IconButton(onClick = onToggleCompare) {
                        Icon(
                            imageVector = Icons.Default.CompareArrows,
                            contentDescription = "Compare",
                            tint = if (isInCompare) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    IconButton(onClick = onToggleFavorite) {
                        Icon(
                            imageVector = if (isFavorite) Icons.Default.Star else Icons.Outlined.StarBorder,
                            contentDescription = "Favorite",
                            tint = if (isFavorite) AmberWarning else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Icon(
                        imageVector = if (isExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                        contentDescription = "Expand",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // Expanded Monograph Details
            AnimatedVisibility(visible = isExpanded) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))

                    // Mechanism
                    if (drug.mechanism.isNotBlank()) {
                        DetailSection(title = "Mechanism of Action") {
                            Text(
                                text = drug.mechanism,
                                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 13.sp),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }

                    // Concentrations, Prep & Dilution
                    DetailSection(title = "Formulations & Preparation") {
                        if (drug.concentrations.isNotEmpty()) {
                            Text(
                                text = "Concentrations: ${drug.concentrations.joinToString(" • ")}",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    fontSize = 12.sp,
                                    fontFamily = FontFamily.Monospace
                                ),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                        if (!drug.preparation.isNullOrBlank()) {
                            Text(
                                text = "Prep: ${drug.preparation}",
                                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp),
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        if (!drug.dilution.isNullOrBlank()) {
                            Text(
                                text = "Dilution: ${drug.dilution}",
                                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp),
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        if (!drug.infusionPrep.isNullOrBlank()) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier.fillMaxWidth().padding(top = 4.dp)
                            ) {
                                Text(
                                    text = "Infusion Mix: ${drug.infusionPrep}",
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium,
                                        fontFamily = FontFamily.Monospace
                                    ),
                                    color = TealPrimaryDark,
                                    modifier = Modifier.padding(8.dp)
                                )
                            }
                        }
                    }

                    // Dosing Grid
                    DetailSection(title = "Clinical Dosing") {
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            drug.doses.adult?.let { DoseRow("Adult", it) }
                            drug.rsi?.let { DoseRow("RSI Bolus", it, isCritical = true) }
                            drug.pediatricRsi?.let { DoseRow("Pediatric RSI", it, isCritical = true) }
                            drug.doses.pediatric?.let { DoseRow("Pediatric", it) }
                            drug.doses.geriatric?.let { DoseRow("Geriatric", it) }
                            drug.doses.infusion?.let { DoseRow("Infusion", it) }
                            drug.doses.obese?.let { DoseRow("Obesity", it) }
                            drug.doses.renalAdjustment?.let { DoseRow("Renal Adj", it) }
                            drug.doses.hepaticAdjustment?.let { DoseRow("Hepatic Adj", it) }
                            drug.doses.emergency?.let { DoseRow("Emergency", it, isCritical = true) }
                            drug.doses.maximum?.let { DoseRow("Max Dose", it, isCritical = true) }
                        }
                    }

                    // Pharmacokinetics
                    DetailSection(title = "Pharmacokinetics") {
                        val pk = drug.pharmacokinetics
                        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            if (!pk.onset.isNullOrBlank()) PkRow("Onset", pk.onset)
                            if (!pk.peak.isNullOrBlank()) PkRow("Peak", pk.peak)
                            if (!pk.duration.isNullOrBlank()) PkRow("Duration", pk.duration)
                            if (!pk.proteinBinding.isNullOrBlank()) PkRow("Protein Binding", pk.proteinBinding)
                            if (!pk.halfLife.isNullOrBlank()) PkRow("Half-Life", pk.halfLife)
                            if (!pk.metabolism.isNullOrBlank()) PkRow("Metabolism", pk.metabolism)
                            if (!pk.excretion.isNullOrBlank()) PkRow("Excretion", pk.excretion)
                        }
                    }

                    // Safety, Contraindications & Toxicology
                    DetailSection(title = "Safety & Toxicology") {
                        if (drug.contraindications.isNotEmpty()) {
                            Text(
                                text = "Contraindications: ${drug.contraindications.joinToString("; ")}",
                                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp),
                                color = CriticalRed
                            )
                        }
                        if (drug.sideEffects.isNotEmpty()) {
                            Text(
                                text = "Adverse Effects: ${drug.sideEffects.joinToString("; ")}",
                                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp),
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        if (!drug.overdoseManagement.isNullOrBlank()) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = CriticalRedContainer,
                                modifier = Modifier.fillMaxWidth().padding(top = 4.dp)
                            ) {
                                Text(
                                    text = "Antidote / Overdose: ${drug.overdoseManagement}",
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold
                                    ),
                                    color = CriticalRed,
                                    modifier = Modifier.padding(8.dp)
                                )
                            }
                        }
                    }

                    // Pearls & Tips
                    if (drug.quickTips.isNotEmpty()) {
                        DetailSection(title = "Clinical Pearls & Tips") {
                            drug.quickTips.forEach { tip ->
                                Text(
                                    text = "• $tip",
                                    style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }

                    // Source
                    if (drug.source.title.isNotBlank()) {
                        Text(
                            text = "Source: ${drug.source.title} (${drug.source.organization}, ${drug.source.year})",
                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f)
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                }
            }
        }
    }
}

@Composable
private fun DetailSection(title: String, content: @Composable () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(
            text = title.uppercase(),
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold
            ),
            color = MaterialTheme.colorScheme.primary
        )
        content()
    }
}

@Composable
private fun DoseRow(label: String, dose: DrugDose, isCritical: Boolean = false) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Top
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium.copy(
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold
            ),
            color = if (isCritical) CriticalRed else MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.width(100.dp)
        )
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = dose.value,
                style = MaterialTheme.typography.bodyMedium.copy(
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Medium
                ),
                color = MaterialTheme.colorScheme.onSurface
            )
            if (!dose.notes.isNullOrBlank()) {
                Text(
                    text = dose.notes,
                    style = MaterialTheme.typography.bodyMedium.copy(fontSize = 11.sp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
private fun PkRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 1.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant),
            modifier = Modifier.width(110.dp)
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp),
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.weight(1f)
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickDrugCalcDialog(
    drug: Drug,
    onDismiss: () -> Unit
) {
    var weightText by remember { mutableStateOf("70") }
    val weightKg = weightText.toDoubleOrNull() ?: 70.0

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Dosing: ${drug.genericName}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                OutlinedTextField(
                    value = weightText,
                    onValueChange = { weightText = it },
                    label = { Text("Patient Weight (kg)") },
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        drug.doses.adult?.let {
                            Text(
                                text = "Adult: ${it.value}",
                                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            )
                        }
                        drug.rsi?.let {
                            Text(
                                text = "RSI Bolus: ${it.value}",
                                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = CriticalRed)
                            )
                        }
                        drug.doses.infusion?.let {
                            Text(
                                text = "Infusion: ${it.value}",
                                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 13.sp, color = TealPrimaryDark)
                            )
                        }
                        if (weightKg > 0) {
                            Text(
                                text = "Calculated for ${weightKg} kg patient",
                                style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp),
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                Button(
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Done")
                }
            }
        }
    }
}
