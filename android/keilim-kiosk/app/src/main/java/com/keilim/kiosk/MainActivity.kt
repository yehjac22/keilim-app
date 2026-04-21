package com.keilim.kiosk

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var cacheDb: UtensilsCacheDbHelper
    private val ioExecutor = Executors.newSingleThreadExecutor()

    private val cacheStorageKey = "keilim-utensils-cache-v1"
    private val nativeCacheEvent = "keilim-native-cache-updated"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        cacheDb = UtensilsCacheDbHelper(this)

        webView = WebView(this)
        swipeRefreshLayout = SwipeRefreshLayout(this).apply {
            setOnRefreshListener {
                syncApiCache()
                webView.reload()
            }
            addView(webView)
        }
        setContentView(swipeRefreshLayout)

        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.mediaPlaybackRequiresUserGesture = false

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                swipeRefreshLayout.isRefreshing = false
                injectCachedPayloadIntoWebView()
                super.onPageFinished(view, url)
            }
        }
        webView.webChromeClient = WebChromeClient()
        webView.setOnLongClickListener {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(BuildConfig.UPDATE_PAGE_URL)))
            true
        }

        val url = BuildConfig.KIOSK_URL
        syncApiCache()
        webView.loadUrl(url)
    }

    override fun onResume() {
        super.onResume()
        syncApiCache()
        if (::webView.isInitialized) {
            webView.reload()
        }
    }

    override fun onDestroy() {
        ioExecutor.shutdownNow()
        super.onDestroy()
    }

    override fun onBackPressed() {
        if (::webView.isInitialized && webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    private fun syncApiCache() {
        ioExecutor.execute {
            val apiUrl = "${BuildConfig.KIOSK_URL.trimEnd('/')}/api/utensils"

            try {
                val connection = URL(apiUrl).openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connectTimeout = 5000
                connection.readTimeout = 7000

                connection.inputStream.bufferedReader().use { reader ->
                    val responseBody = reader.readText()
                    val localPayload = convertApiResponseToLocalPayload(responseBody) ?: return@use
                    cacheDb.saveCache(cacheStorageKey, localPayload)
                }

                runOnUiThread {
                    injectCachedPayloadIntoWebView()
                }
            } catch (error: Exception) {
                Log.d("KeilimKiosk", "API sync failed, using SQLite fallback", error)
            }
        }
    }

    private fun convertApiResponseToLocalPayload(rawApiResponse: String): String? {
        return try {
            val response = JSONObject(rawApiResponse)
            val dataArray = response.optJSONArray("data") ?: return null
            if (dataArray.length() == 0) {
                return null
            }

            val meta = response.optJSONObject("meta")
            val source = meta?.optString("source")?.takeIf { it.isNotBlank() } ?: "android-sqlite-cache"
            val updatedAt = meta?.optString("updatedAt")?.takeIf { it.isNotBlank() }

            JSONObject().apply {
                put("items", dataArray)
                put("source", source)
                put("updatedAt", updatedAt ?: JSONObject.NULL)
            }.toString()
        } catch (error: Exception) {
            Log.w("KeilimKiosk", "Failed to parse API payload for SQLite cache", error)
            null
        }
    }

    private fun injectCachedPayloadIntoWebView() {
        val cachedPayload = cacheDb.readCache(cacheStorageKey) ?: return
        val escapedPayload = JSONObject.quote(cachedPayload)

        val script = """
            (function() {
              try {
                localStorage.setItem('$cacheStorageKey', $escapedPayload);
                window.dispatchEvent(new CustomEvent('$nativeCacheEvent'));
              } catch (_error) {}
            })();
        """.trimIndent()

        webView.evaluateJavascript(script, null)
    }
}
