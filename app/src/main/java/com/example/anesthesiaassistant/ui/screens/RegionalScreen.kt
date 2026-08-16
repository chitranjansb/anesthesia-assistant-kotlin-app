package com.example.anesthesiaassistant.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import com.example.anesthesiaassistant.data.model.RegionalBlock
import com.example.anesthesiaassistant.data.repository.ClinicalDataRepository
import com.example.anesthesiaassistant.ui.components.DisclaimerBanner
import com.example.anesthesiaassistant.ui.components.VerificationBadge
import com.example.anesthesiaassistant.ui.theme.*

@Composable
fun RegionalScreen(
    repository: ClinicalDataRepository,
    selectedBlockId: String? = null
) {
    val allBlocks = remember { repository.getRegionalBlocks() }
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf<String?>(null) }
    var expandedBlockId by remember { mutableStateOf(selectedBlockId) }

    val categories = remember(allBlocks) {
        allBlocks.map { it.category }.distinct().sorted()
    }

    val filteredBlocks = remember(allBlocks, searchQuery, selectedCategory) {
        val q = searchQuery.trim().lowercase()
        allBlocks.filter { b ->
            val matchesQuery = q.isEmpty() ||
                    b.name.lowercase().contains(q) ||
                    b.targetNervesOrPlane.lowercase().contains(q) ||
                    b.commonIndications.any { it.lowercase().contains(q) } ||
                    b.pearls.any { it.lowercase().contains(q) }
            val matchesCat = selectedCategory == null || b.category == selectedCategory
            matchesQuery && matchesCat
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 90.dp)
    ) {
        item {
            Column {
                Text(
                    text = "Regional Anesthesia & Blocks",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Target planes, ultrasound guidance, volumes, complications, and clinical pearls.",
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
                placeholder = { Text("Search blocks, indications, target planes...") },
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
                singleLine = true
            )
        }

        // Category Filter Chips
        item {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                item {
                    FilterChip(
                        selected = selectedCategory == null,
                        onClick = { selectedCategory = null },
                        label = { Text("All Blocks (${allBlocks.size})") }
                    )
                }
                items(categories) { cat ->
                    FilterChip(
                        selected = selectedCategory == cat,
                        onClick = { selectedCategory = if (selectedCategory == cat) null else cat },
                        label = { Text(cat) }
                    )
                }
            }
        }

        if (filteredBlocks.isEmpty()) {
            item {
                Box(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No regional blocks found.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            items(filteredBlocks, key = { it.id }) { block ->
                val isExpanded = expandedBlockId == block.id

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
                        // Header Row
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { expandedBlockId = if (isExpanded) null else block.id }
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Text(
                                        text = block.name,
                                        style = MaterialTheme.typography.titleLarge.copy(fontSize = 16.sp),
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    VerificationBadge(status = block.verificationStatus)
                                }
                                Text(
                                    text = "${block.category} • Target: ${block.targetNervesOrPlane}",
                                    style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp),
                                    color = MaterialTheme.colorScheme.primary
                                )
                                if (block.commonIndications.isNotEmpty()) {
                                    Text(
                                        text = "Indications: ${block.commonIndications.joinToString(", ")}",
                                        style = MaterialTheme.typography.bodyMedium.copy(fontSize = 11.sp),
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        maxLines = if (isExpanded) Int.MAX_VALUE else 1
                                    )
                                }
                            }

                            Icon(
                                imageVector = if (isExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                                contentDescription = "Expand",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        // Expanded Details
                        AnimatedVisibility(visible = isExpanded) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 14.dp, vertical = 8.dp),
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))

                                // Position & US Approach
                                DetailItem(title = "Patient Position", body = block.patientPosition)

                                block.ultrasoundApproach?.let {
                                    DetailItem(title = "Ultrasound Approach & Sonoanatomy", body = it)
                                }

                                block.landmarkTechnique?.let {
                                    DetailItem(title = "Landmark / Anatomical Technique", body = it)
                                }

                                // Volume & Onset
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = MaterialTheme.colorScheme.surfaceVariant,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(
                                        modifier = Modifier.padding(10.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(
                                            text = "LA Volume: ${block.localAnestheticVolume}",
                                            style = MaterialTheme.typography.bodyMedium.copy(
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Bold,
                                                fontFamily = FontFamily.Monospace
                                            ),
                                            color = TealPrimaryDark
                                        )
                                        block.onsetTime?.let {
                                            Text(
                                                text = "Onset: $it",
                                                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp)
                                            )
                                        }
                                    }
                                }

                                // Complications
                                if (block.keyComplications.isNotEmpty()) {
                                    DetailList(title = "Key Complications & Risks", items = block.keyComplications, isWarning = true)
                                }

                                // Pearls
                                if (block.pearls.isNotEmpty()) {
                                    DetailList(title = "Clinical Pearls & Tips", items = block.pearls)
                                }

                                // Source
                                if (block.source.title.isNotBlank()) {
                                    Text(
                                        text = "Source: ${block.source.title} (${block.source.organization}, ${block.source.year})",
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
        }
    }
}

@Composable
private fun DetailItem(title: String, body: String) {
    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Text(
            text = title.uppercase(),
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.primary
        )
        Text(
            text = body,
            style = MaterialTheme.typography.bodyMedium.copy(fontSize = 13.sp),
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}

@Composable
private fun DetailList(title: String, items: List<String>, isWarning: Boolean = false) {
    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Text(
            text = title.uppercase(),
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold),
            color = if (isWarning) CriticalRed else MaterialTheme.colorScheme.primary
        )
        items.forEach { item ->
            Text(
                text = "• $item",
                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp),
                color = if (isWarning) CriticalRed.copy(alpha = 0.9f) else MaterialTheme.colorScheme.onSurface
            )
        }
    }
}
