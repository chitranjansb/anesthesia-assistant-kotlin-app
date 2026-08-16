package com.example.anesthesiaassistant.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "saved_cases")
data class CaseEntity(
    @PrimaryKey val id: String,
    val label: String,
    val ageYears: Double,
    val weightKg: Double,
    val sex: String,
    val asa: String,
    val surgery: String,
    val comorbiditiesJson: String,
    val planJson: String,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "favorites")
data class FavoriteEntity(
    @PrimaryKey val id: String, // "${kind}:${refId}"
    val kind: String,
    val refId: String,
    val title: String,
    val subtitle: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "notes")
data class NoteEntity(
    @PrimaryKey val id: String,
    val title: String,
    val body: String,
    val linkedRefId: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "recent_items")
data class RecentEntity(
    @PrimaryKey val id: String, // "${kind}:${refId}"
    val kind: String,
    val refId: String,
    val title: String,
    val timestamp: Long = System.currentTimeMillis()
)
