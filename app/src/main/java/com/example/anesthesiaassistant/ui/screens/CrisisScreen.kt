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
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.anesthesiaassistant.data.model.CrisisAlgorithm
import com.example.anesthesiaassistant.data.model.CrisisStep
import com.example.anesthesiaassistant.data.repository.ClinicalDataRepository
import com.example.anesthesiaassistant.ui.components.DisclaimerBanner
import com.example.anesthesiaassistant.ui.components.VerificationBadge
import com.example.anesthesiaassistant.ui.theme.*
import kotlinx.coroutines.delay
import java.util.Locale

@Composable
fun CrisisScreen(
    repository: ClinicalDataRepository,
    initialCrisisId: String? = null,
    onNavigateToDrug: (String) -> Unit
) {
    val crisisList = remember { repository.getCrisisAlgorithms() }
    var selectedCrisisId by remember {
        mutableStateOf(initialCrisisId ?: crisisList.firstOrNull()?.id ?: "last")
    }

    val currentCrisis = crisisList.find { it.id == selectedCrisisId } ?: crisisList.firstOrNull()

    var activeStepIndex by remember(selectedCrisisId) { mutableStateOf(0) }
    val checkedItems = remember(selectedCrisisId) { mutableStateMapOf<String, Boolean>() }

    // Timer State
    var timerRunning by remember { mutableStateOf(false) }
    var timeRemainingSeconds by remember { mutableStateOf(120) }

    val currentStep = currentCrisis?.steps?.getOrNull(activeStepIndex)

    LaunchedEffect(currentStep) {
        currentStep?.timerSeconds?.let {
            timeRemainingSeconds = it
            timerRunning = false
        }
    }

    LaunchedEffect(timerRunning, timeRemainingSeconds) {
        if (timerRunning && timeRemainingSeconds > 0) {
            delay(1000L)
            timeRemainingSeconds--
        } else if (timeRemainingSeconds == 0) {
            timerRunning = false
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        // Crisis Algorithm Selector Row
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(crisisList) { crisis ->
                val isSelected = crisis.id == selectedCrisisId
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (isSelected) CriticalRed else CriticalRedContainer,
                    border = BorderStroke(1.dp, CriticalRed),
                    modifier = Modifier.clickable {
                        selectedCrisisId = crisis.id
                        activeStepIndex = 0
                    }
                ) {
                    Text(
                        text = crisis.title,
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                        ),
                        color = if (isSelected) Color.White else CriticalRed,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }
        }

        if (currentCrisis == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No crisis algorithms loaded.")
            }
            return
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            contentPadding = PaddingValues(bottom = 90.dp)
        ) {
            // Crisis Title & Trigger Banner
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = CriticalRedContainer),
                    border = BorderStroke(1.5.dp, CriticalRed)
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = currentCrisis.title,
                                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                                color = CriticalRed
                            )
                            VerificationBadge(status = currentCrisis.verificationStatus)
                        }

                        Text(
                            text = "TRIGGER: ${currentCrisis.triggerCriteria}",
                            style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp, fontWeight = FontWeight.SemiBold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            // Step Indicator & Navigation
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "STEP ${activeStepIndex + 1} OF ${currentCrisis.steps.size}",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.primary
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        currentCrisis.steps.forEachIndexed { idx, _ ->
                            Box(
                                modifier = Modifier
                                    .size(if (idx == activeStepIndex) 10.dp else 8.dp)
                                    .clip(CircleShape)
                                    .background(
                                        if (idx == activeStepIndex) MaterialTheme.colorScheme.primary
                                        else MaterialTheme.colorScheme.outline.copy(alpha = 0.4f)
                                    )
                                    .clickable { activeStepIndex = idx }
                            )
                        }
                    }
                }
            }

            // Active Step Content Card
            currentStep?.let { step ->
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
                    ) {
                        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text(
                                text = step.title,
                                style = MaterialTheme.typography.titleLarge.copy(fontSize = 18.sp, fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )

                            Text(
                                text = step.instruction,
                                style = MaterialTheme.typography.bodyLarge.copy(fontSize = 15.sp, lineHeight = 22.sp),
                                color = MaterialTheme.colorScheme.onSurface
                            )

                            // Step Countdown / Cycle Timer
                            if (step.timerSeconds != null) {
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = MaterialTheme.colorScheme.surfaceVariant,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(
                                        modifier = Modifier.padding(12.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column {
                                            Text(
                                                text = "CYCLE / RESUSCITATION TIMER",
                                                style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold),
                                                color = MaterialTheme.colorScheme.primary
                                            )
                                            val mins = timeRemainingSeconds / 60
                                            val secs = timeRemainingSeconds % 60
                                            Text(
                                                text = String.format(Locale.US, "%02d:%02d", mins, secs),
                                                style = MaterialTheme.typography.headlineMedium.copy(
                                                    fontFamily = FontFamily.Monospace,
                                                    fontWeight = FontWeight.Bold
                                                ),
                                                color = if (timeRemainingSeconds <= 10) CriticalRed else MaterialTheme.colorScheme.onSurface
                                            )
                                        }

                                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                            Button(
                                                onClick = { timerRunning = !timerRunning },
                                                colors = ButtonDefaults.buttonColors(
                                                    containerColor = if (timerRunning) AmberWarning else MaterialTheme.colorScheme.primary
                                                ),
                                                shape = RoundedCornerShape(6.dp)
                                            ) {
                                                Icon(
                                                    imageVector = if (timerRunning) Icons.Default.Pause else Icons.Default.PlayArrow,
                                                    contentDescription = null,
                                                    modifier = Modifier.size(16.dp)
                                                )
                                                Spacer(modifier = Modifier.width(4.dp))
                                                Text(if (timerRunning) "Pause" else "Start", fontSize = 12.sp)
                                            }

                                            OutlinedButton(
                                                onClick = {
                                                    timerRunning = false
                                                    timeRemainingSeconds = step.timerSeconds
                                                },
                                                shape = RoundedCornerShape(6.dp)
                                            ) {
                                                Icon(Icons.Default.Refresh, contentDescription = "Reset", modifier = Modifier.size(16.dp))
                                            }
                                        }
                                    }
                                }
                            }

                            // Step Checklist Items
                            if (step.checklist.isNotEmpty()) {
                                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text(
                                        text = "ACTION CHECKLIST",
                                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold),
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                    step.checklist.forEach { checkText ->
                                        val isChecked = checkedItems[checkText] ?: false
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clickable { checkedItems[checkText] = !isChecked }
                                                .padding(vertical = 2.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Checkbox(
                                                checked = isChecked,
                                                onCheckedChange = { checkedItems[checkText] = it }
                                            )
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(
                                                text = checkText,
                                                style = MaterialTheme.typography.bodyMedium.copy(
                                                    fontSize = 13.sp,
                                                    color = if (isChecked) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface
                                                )
                                            )
                                        }
                                    }
                                }
                            }

                            // Suggested Drug Cards
                            if (step.drugSuggestions.isNotEmpty()) {
                                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text(
                                        text = "RECOMMENDED DRUGS",
                                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold),
                                        color = TealPrimaryDark
                                    )
                                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        step.drugSuggestions.forEach { drugId ->
                                            OutlinedButton(
                                                onClick = { onNavigateToDrug(drugId) },
                                                shape = RoundedCornerShape(6.dp),
                                                colors = ButtonDefaults.outlinedButtonColors(contentColor = TealPrimaryDark)
                                            ) {
                                                Icon(Icons.Default.Medication, contentDescription = null, modifier = Modifier.size(16.dp))
                                                Spacer(modifier = Modifier.width(6.dp))
                                                Text("Open $drugId Dosing", fontSize = 12.sp)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Step Navigation Controls (Prev / Next)
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    OutlinedButton(
                        onClick = { if (activeStepIndex > 0) activeStepIndex-- },
                        enabled = activeStepIndex > 0,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.ArrowBack, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Previous Step")
                    }

                    Button(
                        onClick = {
                            if (activeStepIndex < currentCrisis.steps.size - 1) {
                                activeStepIndex++
                            }
                        },
                        enabled = activeStepIndex < currentCrisis.steps.size - 1,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Next Step")
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(16.dp))
                    }
                }
            }

            // Source & Provenance
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text(
                            text = "Reference Source:",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = "${currentCrisis.source.title} (${currentCrisis.source.organization}, ${currentCrisis.source.year}) • Level: ${currentCrisis.source.evidenceLevel}",
                            style = MaterialTheme.typography.bodyMedium.copy(fontSize = 11.sp),
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}
