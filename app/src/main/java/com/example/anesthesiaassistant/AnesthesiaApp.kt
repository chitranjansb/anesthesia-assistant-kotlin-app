package com.example.anesthesiaassistant

import android.app.Application
import com.example.anesthesiaassistant.data.local.AppDatabase
import com.example.anesthesiaassistant.data.repository.ClinicalDataRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class AnesthesiaApp : Application() {
    lateinit var repository: ClinicalDataRepository
        private set

    override fun onCreate() {
        super.onCreate()
        val database = AppDatabase.getDatabase(this)
        repository = ClinicalDataRepository(this, database)
        CoroutineScope(Dispatchers.IO).launch {
            repository.loadInitialData()
        }
    }
}
