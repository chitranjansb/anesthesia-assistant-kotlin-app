
package com.example.anesthesiaassistant

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.anesthesiaassistant.data.model.SearchDoc
import com.example.anesthesiaassistant.ui.components.EmergencyQuickModal
import com.example.anesthesiaassistant.ui.components.GlobalSearchDialog
import com.example.anesthesiaassistant.ui.screens.*
import com.example.anesthesiaassistant.ui.theme.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AnesthesiaAssistantTheme {
                MainAppShell()
            }
        }
    }
}

private fun calcIdToTabIndex(calcId: String?): Int = when (calcId) {
    "bmi" -> 0
    "fluids", "parkland" -> 1
    "ebv", "map", "anion_gap" -> 2
    "ett" -> 3
    "apfel", "rcri", "stopbang", "childpugh", "meld" -> 4
    "ards", "crrt" -> 5
    "la_max" -> 6
    else -> 0
}

object Routes {
    const val DASHBOARD = "dashboard"
    const val DRUGS = "drugs"
    const val CALCULATORS = "calculators"
    const val CASE = "case"
    const val CRISIS = "crisis"
    const val AIRWAY = "airway"
    const val REGIONAL = "regional"
    const val CHECKLISTS = "checklists"
    const val COMPARE = "compare"
    const val NOTES = "notes"
    const val SETTINGS = "settings"
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppShell() {
    val context = LocalContext.current
    val app = context.applicationContext as AnesthesiaApp
    val repository = app.repository
    val navController = rememberNavController()

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: Routes.DASHBOARD

    // Global Search & Emergency Dialog state
    var showSearchDialog by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }
    var searchResults by remember { mutableStateOf<List<SearchDoc>>(emptyList()) }
    var showEmergencyModal by remember { mutableStateOf(false) }
    var showMoreMenu by remember { mutableStateOf(false) }

    LaunchedEffect(searchQuery) {
        searchResults = if (searchQuery.isNotBlank()) {
            repository.searchAll(searchQuery)
        } else {
            emptyList()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = MaterialTheme.colorScheme.primaryContainer,
                            modifier = Modifier.size(32.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.MedicalServices,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                        Column {
                            Text(
                                text = "Anesthesia Assistant",
                                style = MaterialTheme.typography.titleMedium.copy(fontSize = 15.sp),
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Clinical Reference • Offline",
                                style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                },
                actions = {
                    // Global Search
                    IconButton(onClick = { showSearchDialog = true }) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    // Global Emergency Button
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = CriticalRed,
                        modifier = Modifier
                            .padding(end = 8.dp)
                            .clickable { showEmergencyModal = true }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = "Emergency",
                                tint = Color.White,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "CRISIS",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                ),
                                color = Color.White
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp
            ) {
                // 1. Dashboard
                NavigationBarItem(
                    selected = currentRoute == Routes.DASHBOARD,
                    onClick = {
                        navController.navigate(Routes.DASHBOARD) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    icon = { Icon(if (currentRoute == Routes.DASHBOARD) Icons.Default.Dashboard else Icons.Outlined.Dashboard, contentDescription = "Dashboard") },
                    label = { Text("OT Dash", fontSize = 11.sp) }
                )

                // 2. Drugs
                NavigationBarItem(
                    selected = currentRoute.startsWith(Routes.DRUGS),
                    onClick = {
                        navController.navigate(Routes.DRUGS) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    icon = { Icon(if (currentRoute.startsWith(Routes.DRUGS)) Icons.Default.Medication else Icons.Outlined.Medication, contentDescription = "Drugs") },
                    label = { Text("Drugs", fontSize = 11.sp) }
                )

                // 3. Calculators
                NavigationBarItem(
                    selected = currentRoute.startsWith(Routes.CALCULATORS),
                    onClick = {
                        navController.navigate(Routes.CALCULATORS) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    icon = { Icon(if (currentRoute.startsWith(Routes.CALCULATORS)) Icons.Default.Calculate else Icons.Outlined.Calculate, contentDescription = "Calculators") },
                    label = { Text("Calcs", fontSize = 11.sp) }
                )

                // 4. Crisis
                NavigationBarItem(
                    selected = currentRoute.startsWith(Routes.CRISIS),
                    onClick = {
                        navController.navigate(Routes.CRISIS) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    icon = { Icon(if (currentRoute.startsWith(Routes.CRISIS)) Icons.Default.Warning else Icons.Outlined.Warning, contentDescription = "Crisis", tint = CriticalRed) },
                    label = { Text("Crisis", fontSize = 11.sp, color = CriticalRed) }
                )

                // 5. More (Hub)
                val isMoreSelected = currentRoute in listOf(
                    Routes.CASE, Routes.AIRWAY, Routes.REGIONAL, Routes.CHECKLISTS, Routes.NOTES, Routes.SETTINGS
                )
                NavigationBarItem(
                    selected = isMoreSelected,
                    onClick = { showMoreMenu = true },
                    icon = { Icon(Icons.Default.Menu, contentDescription = "More Tools") },
                    label = { Text("More", fontSize = 11.sp) }
                )
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Routes.DASHBOARD,
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Dashboard
            composable(Routes.DASHBOARD) {
                DashboardScreen(
                    repository = repository,
                    onNavigateToCase = { navController.navigate(Routes.CASE) },
                    onNavigateToCrisis = { id -> navController.navigate("${Routes.CRISIS}?crisisId=$id") },
                    onNavigateToDrug = { id -> navController.navigate("${Routes.DRUGS}?drugId=$id") },
                    onNavigateToCalc = { calcId -> navController.navigate("${Routes.CALCULATORS}?calcId=$calcId") },
                    onNavigateToProtocol = { id -> navController.navigate("${Routes.CHECKLISTS}?protocolId=$id") },
                    onNavigateToAllDrugs = { navController.navigate(Routes.DRUGS) },
                    onNavigateToAllCalcs = { navController.navigate(Routes.CALCULATORS) }
                )
            }

            // Drugs
            composable(
                route = "${Routes.DRUGS}?drugId={drugId}",
                arguments = listOf(navArgument("drugId") {
                    type = NavType.StringType
                    nullable = true
                    defaultValue = null
                })
            ) { backStackEntry ->
                val drugId = backStackEntry.arguments?.getString("drugId")
                DrugsScreen(
                    repository = repository,
                    selectedDrugId = drugId,
                    onNavigateToCompare = { compareList ->
                        val joined = compareList.joinToString(",")
                        navController.navigate("${Routes.COMPARE}?ids=$joined")
                    }
                )
            }

            // Calculators
            composable(
                route = "${Routes.CALCULATORS}?calcId={calcId}",
                arguments = listOf(navArgument("calcId") {
                    type = NavType.StringType
                    nullable = true
                    defaultValue = null
                })
            ) { backStackEntry ->
                val calcId = backStackEntry.arguments?.getString("calcId")
                CalculatorsScreen(initialTab = calcIdToTabIndex(calcId))
            }

            // Case Planner
            composable(Routes.CASE) {
                CaseScreen(
                    repository = repository,
                    onNavigateToDrug = { id -> navController.navigate("${Routes.DRUGS}?drugId=$id") }
                )
            }

            // Crisis Algorithms
            composable(
                route = "${Routes.CRISIS}?crisisId={crisisId}",
                arguments = listOf(navArgument("crisisId") {
                    type = NavType.StringType
                    nullable = true
                    defaultValue = null
                })
            ) { backStackEntry ->
                val crisisId = backStackEntry.arguments?.getString("crisisId")
                CrisisScreen(
                    repository = repository,
                    initialCrisisId = crisisId,
                    onNavigateToDrug = { id -> navController.navigate("${Routes.DRUGS}?drugId=$id") }
                )
            }

            // Airway Reference
            composable(Routes.AIRWAY) {
                AirwayScreen()
            }

            // Regional Anesthesia
            composable(Routes.REGIONAL) {
                RegionalScreen(repository = repository)
            }

            // Checklists & Protocols
            composable(
                route = "${Routes.CHECKLISTS}?protocolId={protocolId}",
                arguments = listOf(navArgument("protocolId") {
                    type = NavType.StringType
                    nullable = true
                    defaultValue = null
                })
            ) { backStackEntry ->
                val protocolId = backStackEntry.arguments?.getString("protocolId")
                ChecklistsScreen(
                    repository = repository,
                    initialProtocolId = protocolId
                )
            }

            // Compare Screen
            composable(
                route = "${Routes.COMPARE}?ids={ids}",
                arguments = listOf(navArgument("ids") {
                    type = NavType.StringType
                    defaultValue = ""
                })
            ) { backStackEntry ->
                val idsString = backStackEntry.arguments?.getString("ids") ?: ""
                val ids = idsString.split(",").filter { it.isNotBlank() }
                CompareScreen(
                    repository = repository,
                    drugIds = ids,
                    onBack = { navController.popBackStack() }
                )
            }

            // Notes & Favorites
            composable(Routes.NOTES) {
                NotesFavoritesScreen(
                    repository = repository,
                    onNavigateToDrug = { id -> navController.navigate("${Routes.DRUGS}?drugId=$id") },
                    onNavigateToCrisis = { id -> navController.navigate("${Routes.CRISIS}?crisisId=$id") },
                    onNavigateToProtocol = { id -> navController.navigate("${Routes.CHECKLISTS}?protocolId=$id") }
                )
            }

            // Settings & About
            composable(Routes.SETTINGS) {
                SettingsScreen(repository = repository)
            }
        }
    }

    // More Sheet Menu
    if (showMoreMenu) {
        ModalBottomSheet(
            onDismissRequest = { showMoreMenu = false }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                    .padding(bottom = 32.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "ADDITIONAL CLINICAL MODULES",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary
                )

                val menuItems = listOf(
                    Triple(Routes.CASE, "Patient Case Planner", Icons.Default.MedicalServices),
                    Triple(Routes.AIRWAY, "Airway Sizing & Evaluation", Icons.Default.Air),
                    Triple(Routes.REGIONAL, "Regional Blocks & Planes", Icons.Default.LocationSearching),
                    Triple(Routes.CHECKLISTS, "Checklists & Protocols", Icons.Default.Checklist),
                    Triple(Routes.NOTES, "Notes & Favorites", Icons.Default.Notes),
                    Triple(Routes.SETTINGS, "Settings & Provenance", Icons.Default.Settings)
                )

                menuItems.forEach { (route, title, icon) ->
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                showMoreMenu = false
                                navController.navigate(route) {
                                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(title, style = MaterialTheme.typography.titleMedium.copy(fontSize = 14.sp, fontWeight = FontWeight.SemiBold))
                        }
                    }
                }
            }
        }
    }

    // Global Search Dialog
    if (showSearchDialog) {
        GlobalSearchDialog(
            query = searchQuery,
            onQueryChange = { searchQuery = it },
            results = searchResults,
            onSelectDoc = { doc ->
                showSearchDialog = false
                searchQuery = ""
                when (doc.kind) {
                    "drug" -> navController.navigate("${Routes.DRUGS}?drugId=${doc.id}")
                    "crisis" -> navController.navigate("${Routes.CRISIS}?crisisId=${doc.id}")
                    "calculator" -> navController.navigate(Routes.CALCULATORS)
                    "protocol" -> navController.navigate("${Routes.CHECKLISTS}?protocolId=${doc.id}")
                    "checklist" -> navController.navigate(Routes.CHECKLISTS)
                    "regional-block" -> navController.navigate(Routes.REGIONAL)
                }
            },
            onDismiss = {
                showSearchDialog = false
                searchQuery = ""
            }
        )
    }

    // Emergency Quick Modal
    if (showEmergencyModal) {
        EmergencyQuickModal(
            onSelectCrisis = { crisisId ->
                showEmergencyModal = false
                navController.navigate("${Routes.CRISIS}?crisisId=$crisisId")
            },
            onDismiss = { showEmergencyModal = false }
        )
    }
}
