package com.example.anesthesiaassistant.data.model

import kotlinx.serialization.Serializable

@Serializable
data class SourceRef(
    val organization: String = "",
    val title: String = "",
    val year: Int = 2024,
    val version: String? = null,
    val lastUpdated: String? = null,
    val url: String? = null,
    val evidenceLevel: String? = "Not graded"
)

@Serializable
data class DrugDose(
    val label: String = "",
    val value: String = "",
    val notes: String? = null
)

@Serializable
data class Pharmacokinetics(
    val onset: String? = null,
    val peak: String? = null,
    val duration: String? = null,
    val proteinBinding: String? = null,
    val halfLife: String? = null,
    val metabolism: String? = null,
    val excretion: String? = null
)

@Serializable
data class Doses(
    val adult: DrugDose? = null,
    val pediatric: DrugDose? = null,
    val geriatric: DrugDose? = null,
    val obese: DrugDose? = null,
    val renalAdjustment: DrugDose? = null,
    val hepaticAdjustment: DrugDose? = null,
    val infusion: DrugDose? = null,
    val emergency: DrugDose? = null,
    val maximum: DrugDose? = null
)

@Serializable
data class Drug(
    val id: String,
    val genericName: String,
    val brandExamplesIndia: List<String> = emptyList(),
    val drugClass: String = "",
    val classColor: String? = null,
    val mechanism: String = "",
    val concentrations: List<String> = emptyList(),
    val preparation: String? = null,
    val dilution: String? = null,
    val infusionPrep: String? = null,
    val rsi: DrugDose? = null,
    val pediatricRsi: DrugDose? = null,
    val fluidCompatibility: String? = null,
    val storage: String? = null,
    val pharmacokinetics: Pharmacokinetics = Pharmacokinetics(),
    val doses: Doses = Doses(),
    val pregnancyCategory: String? = null,
    val pregnancy: String? = null,
    val lactation: String? = null,
    val contraindications: List<String> = emptyList(),
    val interactions: List<String> = emptyList(),
    val sideEffects: List<String> = emptyList(),
    val overdoseManagement: String? = null,
    val monitoring: List<String> = emptyList(),
    val ampouleColor: String? = null,
    val quickTips: List<String> = emptyList(),
    val tags: List<String> = emptyList(),
    val source: SourceRef = SourceRef(),
    val verificationStatus: String = "unverified-ai-seed"
)

@Serializable
data class ProtocolSection(
    val heading: String,
    val body: String
)

@Serializable
data class Protocol(
    val id: String,
    val title: String,
    val category: String,
    val summary: String,
    val sections: List<ProtocolSection> = emptyList(),
    val flowchartDescription: String? = null,
    val source: SourceRef = SourceRef(),
    val verificationStatus: String = "unverified-ai-seed"
)

@Serializable
data class CrisisStep(
    val id: String,
    val title: String,
    val instruction: String,
    val timerSeconds: Int? = null,
    val drugSuggestions: List<String> = emptyList(),
    val checklist: List<String> = emptyList()
)

@Serializable
data class CrisisAlgorithm(
    val id: String,
    val title: String,
    val category: String,
    val triggerCriteria: String,
    val steps: List<CrisisStep> = emptyList(),
    val source: SourceRef = SourceRef(),
    val verificationStatus: String = "unverified-ai-seed"
)

@Serializable
data class ChecklistItem(
    val id: String,
    val label: String,
    val critical: Boolean = false
)

@Serializable
data class Checklist(
    val id: String,
    val title: String,
    val phase: String,
    val items: List<ChecklistItem> = emptyList(),
    val source: SourceRef = SourceRef(),
    val verificationStatus: String = "unverified-ai-seed"
)

@Serializable
data class RegionalBlock(
    val id: String,
    val name: String,
    val category: String,
    val targetNervesOrPlane: String,
    val commonIndications: List<String> = emptyList(),
    val patientPosition: String = "",
    val landmarkTechnique: String? = null,
    val ultrasoundApproach: String? = null,
    val needleApproach: String? = null,
    val localAnestheticVolume: String = "",
    val onsetTime: String? = null,
    val keyComplications: List<String> = emptyList(),
    val contraindications: List<String> = emptyList(),
    val pearls: List<String> = emptyList(),
    val source: SourceRef = SourceRef(),
    val verificationStatus: String = "unverified-ai-seed"
)

@Serializable
data class CaseInput(
    val ageYears: Double = 0.0,
    val weightKg: Double = 0.0,
    val sex: String = "male",
    val asa: String = "II",
    val surgery: String = "",
    val comorbidities: List<String> = emptyList()
)

@Serializable
data class CasePlanRow(
    val section: String,
    val text: String,
    val rationale: String? = null,
    val drugIds: List<String> = emptyList()
)

@Serializable
data class SearchDoc(
    val kind: String,
    val id: String,
    val title: String,
    val subtitle: String? = null,
    val keywords: List<String> = emptyList()
)
