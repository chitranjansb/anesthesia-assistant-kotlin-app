package com.example.anesthesiaassistant.data.repository

import android.content.Context
import com.example.anesthesiaassistant.data.local.*
import com.example.anesthesiaassistant.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json

class ClinicalDataRepository(
    private val context: Context,
    private val database: AppDatabase
) {
    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        coerceInputValues = true
    }

    private var cachedDrugs: List<Drug> = emptyList()
    private var cachedCrisisAlgorithms: List<CrisisAlgorithm> = emptyList()
    private var cachedProtocols: List<Protocol> = emptyList()
    private var cachedChecklists: List<Checklist> = emptyList()
    private var cachedRegionalBlocks: List<RegionalBlock> = emptyList()

    suspend fun loadInitialData() = withContext(Dispatchers.IO) {
        if (cachedDrugs.isEmpty()) {
            cachedDrugs = loadJsonFromAsset<List<Drug>>("data/drugs.json") ?: emptyList()
        }
        if (cachedCrisisAlgorithms.isEmpty()) {
            cachedCrisisAlgorithms = loadJsonFromAsset<List<CrisisAlgorithm>>("data/crisis-algorithms.json") ?: emptyList()
        }
        if (cachedProtocols.isEmpty()) {
            cachedProtocols = loadJsonFromAsset<List<Protocol>>("data/protocols.json") ?: emptyList()
        }
        if (cachedChecklists.isEmpty()) {
            cachedChecklists = loadJsonFromAsset<List<Checklist>>("data/checklists.json") ?: emptyList()
        }
        if (cachedRegionalBlocks.isEmpty()) {
            cachedRegionalBlocks = loadJsonFromAsset<List<RegionalBlock>>("data/regional-blocks.json") ?: emptyList()
        }
    }

    private inline fun <reified T> loadJsonFromAsset(fileName: String): T? {
        return try {
            val content = context.assets.open(fileName).bufferedReader().use { it.readText() }
            json.decodeFromString<T>(content)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    fun getDrugs(): List<Drug> = cachedDrugs
    fun getDrugById(id: String): Drug? = cachedDrugs.find { it.id.equals(id, ignoreCase = true) }

    fun getCrisisAlgorithms(): List<CrisisAlgorithm> = cachedCrisisAlgorithms
    fun getCrisisAlgorithmById(id: String): CrisisAlgorithm? = cachedCrisisAlgorithms.find { it.id.equals(id, ignoreCase = true) }

    fun getProtocols(): List<Protocol> = cachedProtocols
    fun getProtocolById(id: String): Protocol? = cachedProtocols.find { it.id.equals(id, ignoreCase = true) }

    fun getChecklists(): List<Checklist> = cachedChecklists
    fun getChecklistById(id: String): Checklist? = cachedChecklists.find { it.id.equals(id, ignoreCase = true) }

    fun getRegionalBlocks(): List<RegionalBlock> = cachedRegionalBlocks
    fun getRegionalBlockById(id: String): RegionalBlock? = cachedRegionalBlocks.find { it.id.equals(id, ignoreCase = true) }

    // Search across all models
    fun searchAll(query: String): List<SearchDoc> {
        val q = query.trim().lowercase()
        if (q.isEmpty()) return emptyList()

        val results = mutableListOf<SearchDoc>()

        // Search drugs
        cachedDrugs.forEach { d ->
            if (d.genericName.lowercase().contains(q) ||
                d.brandExamplesIndia.any { it.lowercase().contains(q) } ||
                d.drugClass.lowercase().contains(q) ||
                d.tags.any { it.lowercase().contains(q) }
            ) {
                results.add(
                    SearchDoc(
                        kind = "drug",
                        id = d.id,
                        title = d.genericName,
                        subtitle = "${d.drugClass} • ${d.brandExamplesIndia.take(2).joinToString(", ")}",
                        keywords = d.tags
                    )
                )
            }
        }

        // Search crisis algorithms
        cachedCrisisAlgorithms.forEach { c ->
            if (c.title.lowercase().contains(q) ||
                c.category.lowercase().contains(q) ||
                c.triggerCriteria.lowercase().contains(q)
            ) {
                results.add(
                    SearchDoc(
                        kind = "crisis",
                        id = c.id,
                        title = c.title,
                        subtitle = "Emergency: ${c.category}",
                        keywords = listOf("crisis", "emergency", c.category)
                    )
                )
            }
        }

        // Search calculators (known set)
        val calcTitles = listOf(
            "bmi" to "BMI & Ideal Body Weight (Devine / Boer)",
            "fluids" to "Maintenance Fluids (4-2-1 Rule) & NPO Deficit",
            "parkland" to "Parkland Burn Resuscitation Formula",
            "ebv" to "Estimated Blood Volume & Allowable Blood Loss",
            "map" to "Mean Arterial Pressure (MAP) Calculator",
            "anion_gap" to "Anion Gap Calculator",
            "ett" to "Pediatric ETT Sizing (Cole Formula)",
            "apfel" to "Apfel PONV Risk Score",
            "rcri" to "Revised Cardiac Risk Index (RCRI)",
            "stopbang" to "STOP-BANG OSA Risk Screening",
            "childpugh" to "Child-Pugh Liver Disease Score",
            "meld" to "MELD Liver Score",
            "ards" to "PaO2/FiO2 Ratio & Berlin ARDS Severity",
            "crrt" to "CRRT Effluent Dose Calculator",
            "la_max" to "Local Anesthetic Maximum Safe Dose"
        )
        calcTitles.forEach { (id, title) ->
            if (title.lowercase().contains(q) || id.contains(q)) {
                results.add(
                    SearchDoc(
                        kind = "calculator",
                        id = id,
                        title = title,
                        subtitle = "Clinical Calculator",
                        keywords = listOf("calculator", "formula")
                    )
                )
            }
        }

        // Search protocols
        cachedProtocols.forEach { p ->
            if (p.title.lowercase().contains(q) ||
                p.category.lowercase().contains(q) ||
                p.summary.lowercase().contains(q)
            ) {
                results.add(
                    SearchDoc(
                        kind = "protocol",
                        id = p.id,
                        title = p.title,
                        subtitle = "Protocol: ${p.category}",
                        keywords = listOf(p.category)
                    )
                )
            }
        }

        // Search checklists
        cachedChecklists.forEach { ch ->
            if (ch.title.lowercase().contains(q) ||
                ch.phase.lowercase().contains(q)
            ) {
                results.add(
                    SearchDoc(
                        kind = "checklist",
                        id = ch.id,
                        title = ch.title,
                        subtitle = "Safety Checklist: ${ch.phase}",
                        keywords = listOf(ch.phase)
                    )
                )
            }
        }

        // Search regional blocks
        cachedRegionalBlocks.forEach { b ->
            if (b.name.lowercase().contains(q) ||
                b.targetNervesOrPlane.lowercase().contains(q) ||
                b.category.lowercase().contains(q) ||
                b.commonIndications.any { it.lowercase().contains(q) }
            ) {
                results.add(
                    SearchDoc(
                        kind = "regional-block",
                        id = b.id,
                        title = b.name,
                        subtitle = "${b.category} • ${b.targetNervesOrPlane}",
                        keywords = b.commonIndications
                    )
                )
            }
        }

        return results
    }

    // Room DB integrations
    val savedCases: Flow<List<CaseEntity>> = database.caseDao().getAllCases()
    suspend fun saveCase(case: CaseEntity) = database.caseDao().insertCase(case)
    suspend fun deleteCase(id: String) = database.caseDao().deleteCaseById(id)

    val favorites: Flow<List<FavoriteEntity>> = database.favoriteDao().getAllFavorites()
    fun isFavorite(id: String): Flow<Boolean> = database.favoriteDao().isFavorite(id)
    suspend fun toggleFavorite(kind: String, refId: String, title: String, subtitle: String? = null, isFav: Boolean) {
        val id = "$kind:$refId"
        if (isFav) {
            database.favoriteDao().deleteFavoriteById(id)
        } else {
            database.favoriteDao().insertFavorite(
                FavoriteEntity(id = id, kind = kind, refId = refId, title = title, subtitle = subtitle)
            )
        }
    }

    val notes: Flow<List<NoteEntity>> = database.noteDao().getAllNotes()
    suspend fun saveNote(note: NoteEntity) = database.noteDao().insertNote(note)
    suspend fun deleteNote(id: String) = database.noteDao().deleteNoteById(id)

    val recentItems: Flow<List<RecentEntity>> = database.recentDao().getRecentItems()
    suspend fun logRecent(kind: String, refId: String, title: String) {
        val id = "$kind:$refId"
        database.recentDao().insertRecent(
            RecentEntity(id = id, kind = kind, refId = refId, title = title)
        )
    }
}
