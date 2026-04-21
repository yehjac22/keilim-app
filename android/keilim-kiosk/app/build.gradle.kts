plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.keilim.kiosk"
    compileSdk = 34

    buildFeatures {
        buildConfig = true
    }

    defaultConfig {
        applicationId = "com.keilim.kiosk"
        minSdk = 19
        targetSdk = 34
        val buildVersionCode = providers.gradleProperty("versionCode").orElse("1").get().toInt()
        val buildVersionName = providers.gradleProperty("versionName").orElse("1.0").get()
        versionCode = buildVersionCode
        versionName = buildVersionName

        val kioskUrl = providers.gradleProperty("kioskUrl").orElse("http://10.0.2.2:3001").get()
        buildConfigField("String", "KIOSK_URL", "\"$kioskUrl\"")
        buildConfigField("String", "UPDATE_PAGE_URL", "\"$kioskUrl/android\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.10.1")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")
}
