package com.keilim.kiosk

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class UtensilsCacheDbHelper(context: Context) : SQLiteOpenHelper(context, DB_NAME, null, DB_VERSION) {
    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE $TABLE_CACHE (
              $COL_CACHE_KEY TEXT PRIMARY KEY,
              $COL_CACHE_VALUE TEXT NOT NULL,
              $COL_UPDATED_AT INTEGER NOT NULL
            )
            """.trimIndent()
        )
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS $TABLE_CACHE")
        onCreate(db)
    }

    fun saveCache(cacheKey: String, cacheValue: String) {
        val values = ContentValues().apply {
            put(COL_CACHE_KEY, cacheKey)
            put(COL_CACHE_VALUE, cacheValue)
            put(COL_UPDATED_AT, System.currentTimeMillis())
        }

        writableDatabase.insertWithOnConflict(TABLE_CACHE, null, values, SQLiteDatabase.CONFLICT_REPLACE)
    }

    fun readCache(cacheKey: String): String? {
        readableDatabase.query(
            TABLE_CACHE,
            arrayOf(COL_CACHE_VALUE),
            "$COL_CACHE_KEY = ?",
            arrayOf(cacheKey),
            null,
            null,
            null,
            "1"
        ).use { cursor ->
            if (cursor.moveToFirst()) {
                return cursor.getString(0)
            }
        }

        return null
    }

    companion object {
        private const val DB_NAME = "keilim_cache.db"
        private const val DB_VERSION = 1

        private const val TABLE_CACHE = "utensils_cache"
        private const val COL_CACHE_KEY = "cache_key"
        private const val COL_CACHE_VALUE = "cache_value"
        private const val COL_UPDATED_AT = "updated_at"
    }
}
