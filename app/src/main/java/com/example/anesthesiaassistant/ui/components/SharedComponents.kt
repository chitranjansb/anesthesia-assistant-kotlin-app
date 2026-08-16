package com.example.anesthesiaassistant.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.anesthesiaassistant.data.model.SearchDoc
import com.example.anesthesiaassistant.ui.theme.*

@Composable
fun DisclaimerBanner(
    modifier: Modifier = Modifier,
    compact: Boolean = false
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(10.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.7f),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = if (compact) 8.dp else 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Info,
                contentDescription = "Disclaimer",
                tint = AmberWarning,
                modifier = Modifier.size(if (compact) 18.dp else 22.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Column {
                Text(
                    text = if (compact) "Clinical Reference Notice" else "Educational Reference & Clinical Notice",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.SemiBold,
                        fontSize = if (compact) 13.sp else 14.sp
                    ),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "For educational reference only. All doses, formulas, and algorithms must be cross-checked against hospital protocol and supervising clinician before clinical application.",
                    style = MaterialTheme.typography.bodyMedium.copy(fontSize = 11.sp, lineHeight = 15.sp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun VerificationBadge(
    status: String,
    modifier: Modifier = Modifier
) {
    val (text, color, bgColor, icon) = when (status.lowercase()) {
        "verified" -> Quadruple(
            "Verified",
            GreenSuccess,
            GreenContainer,
            Icons.Default.CheckCircle
        )
        "needs-review" -> Quadruple(
            "Needs Review",
            AmberWarning,
            AmberContainer,
            Icons.Default.Warning
        )
        else -> Quadruple(
            "Unverified Seed",
            MaterialTheme.colorScheme.onSurfaceVariant,
            MaterialTheme.colorScheme.surfaceVariant,
            Icons.Default.HelpOutline
        )
    }

    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(6.dp),
        color = bgColor
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(12.dp)
            )
            Text(
                text = text,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 10.sp,
                    fontWeight = FontWeight.SemiBold
                ),
                color = color
            )
        }
    }
}

private data class Quadruple<A, B, C, D>(val first: A, val second: B, val third: C, val fourth: D)

@Composable
fun DrugClassBadge(
    drugClass: String,
    classColor: String?,
    modifier: Modifier = Modifier
) {
    val isDark = isSystemInDarkTheme()
    val (textColor, bgColor) = getDrugClassColor(classColor, isDark)

    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(6.dp),
        color = bgColor
    ) {
        Text(
            text = drugClass,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium
            ),
            color = textColor,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

@Composable
fun VitalsTrace(
    modifier: Modifier = Modifier,
    color: Color = MaterialTheme.colorScheme.primary
) {
    Canvas(modifier = modifier.fillMaxWidth().height(24.dp)) {
        val width = size.width
        val height = size.height
        val midY = height / 2f
        val path = Path()

        path.moveTo(0f, midY)
        val step = width / 12f

        // ECG beat trace simulation
        path.lineTo(step * 2, midY)
        path.lineTo(step * 2.5f, midY - 3f) // P
        path.lineTo(step * 3f, midY)
        path.lineTo(step * 3.5f, midY + 4f) // Q
        path.lineTo(step * 4f, midY - height * 0.45f) // R
        path.lineTo(step * 4.5f, midY + height * 0.35f) // S
        path.lineTo(step * 5f, midY)
        path.lineTo(step * 6f, midY - 6f) // T
        path.lineTo(step * 7f, midY)
        path.lineTo(width, midY)

        drawPath(
            path = path,
            color = color.copy(alpha = 0.4f),
            style = Stroke(width = 1.5.dp.toPx())
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GlobalSearchDialog(
    query: String,
    onQueryChange: (String) -> Unit,
    results: List<SearchDoc>,
    onSelectDoc: (SearchDoc) -> Unit,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.85f),
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp
        ) {
            Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search",
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Clinical Search",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.weight(1f))
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = query,
                    onValueChange = onQueryChange,
                    placeholder = { Text("Search drugs, doses, crisis, calculators, blocks...") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline
                    )
                )

                Spacer(modifier = Modifier.height(12.dp))

                if (results.isEmpty() && query.isNotBlank()) {
                    Box(
                        modifier = Modifier.fillMaxSize().weight(1f),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No clinical results matching \"$query\"",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(results) { doc ->
                            SearchDocItem(doc = doc, onClick = { onSelectDoc(doc) })
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SearchDocItem(
    doc: SearchDoc,
    onClick: () -> Unit
) {
    val (icon, color) = when (doc.kind) {
        "drug" -> Icons.Default.Medication to TealPrimaryDark
        "crisis" -> Icons.Default.Warning to CriticalRed
        "calculator" -> Icons.Default.Calculate to CyanAccent
        "protocol" -> Icons.Default.Description to IndigoAccent
        "checklist" -> Icons.Default.Checklist to AmberWarning
        "regional-block" -> Icons.Default.LocationSearching to VioletAccent
        else -> Icons.Default.Article to MaterialTheme.colorScheme.primary
    }

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(8.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(color.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier.size(20.dp)
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = doc.title,
                    style = MaterialTheme.typography.titleMedium.copy(fontSize = 14.sp),
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                if (!doc.subtitle.isNullOrBlank()) {
                    Text(
                        text = doc.subtitle,
                        style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
            Text(
                text = doc.kind.uppercase(),
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, fontWeight = FontWeight.Bold),
                color = color
            )
        }
    }
}

@Composable
fun EmergencyQuickModal(
    onSelectCrisis: (String) -> Unit,
    onDismiss: () -> Unit
) {
    val emergencies = listOf(
        Triple("last", "Local Anesthetic Toxicity (LAST)", "Intralipid 20% rescue & seizure/arrest protocol"),
        Triple("malignant-hyperthermia", "Malignant Hyperthermia (MH)", "Dantrolene dosing & active cooling"),
        Triple("anaphylaxis", "Intraoperative Anaphylaxis", "Epinephrine dosing & hemodynamic resuscitation"),
        Triple("adult-cardiac-arrest", "Adult Cardiac Arrest (ACLS)", "VF/pVT & PEA/Asystole perioperative cycles"),
        Triple("laryngospasm", "Laryngospasm", "100% O2, Larson notch pressure & Succinylcholine"),
        Triple("ventilator-high-pressure", "Ventilator Peak Pressure (DOPES)", "Displacement, Obstruction, Pneumothorax"),
        Triple("septic-shock-resuscitation", "Septic Shock 1-Hour Bundle", "Cultures, Lactate, 30mL/kg crystalloid, Norepi")
    )

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.8f),
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 8.dp,
            border = androidx.compose.foundation.BorderStroke(2.dp, CriticalRed.copy(alpha = 0.6f))
        ) {
            Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = "Emergency",
                        tint = CriticalRed,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "EMERGENCY PROTOCOLS",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = CriticalRed
                    )
                    Spacer(modifier = Modifier.weight(1f))
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Text(
                    text = "Tap to open step-by-step algorithms with interactive timers and dose checklists.",
                    style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(12.dp))

                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(emergencies) { (id, title, desc) ->
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onSelectCrisis(id) },
                            shape = RoundedCornerShape(10.dp),
                            color = CriticalRedContainer,
                            border = androidx.compose.foundation.BorderStroke(1.dp, CriticalRed.copy(alpha = 0.4f))
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Siren,
                                    contentDescription = null,
                                    tint = CriticalRed,
                                    modifier = Modifier.size(24.dp)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = title,
                                        style = MaterialTheme.typography.titleMedium.copy(fontSize = 14.sp),
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = desc,
                                        style = MaterialTheme.typography.bodyMedium.copy(fontSize = 11.sp),
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                                Icon(
                                    imageVector = Icons.Default.ChevronRight,
                                    contentDescription = "Open",
                                    tint = CriticalRed
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
