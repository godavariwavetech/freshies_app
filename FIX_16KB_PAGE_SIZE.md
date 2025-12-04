# How to Fix 16 KB Page Size Issue for Google Play Store

This guide will help you fix the "Your app uses native libraries that don't support 16 KB memory page sizes" error when uploading to Google Play Store.

## Problem
Google Play Store requires all apps targeting Android 15 (API 35) or higher to support 16 KB memory page sizes. This is a requirement for newer Android devices.

## Solution

### Step 1: Check Your Android Gradle Plugin Version

Your app needs **Android Gradle Plugin (AGP) 8.5.1 or higher** to automatically handle 16 KB page size alignment.

To check your AGP version, look at your `android/build.gradle` file. React Native 0.76+ typically uses AGP 8.8.0+, which already supports this.

### Step 2: Update `android/gradle.properties`

**DO NOT add** the deprecated property `android.bundle.enableUncompressedNativeLibs` (it was removed in AGP 8.1+).

If you see this property in your `gradle.properties`, **remove it**:
```properties
# ❌ REMOVE THIS (deprecated in AGP 8.1+)
android.bundle.enableUncompressedNativeLibs=false
```

AGP 8.5.1+ automatically handles 16 KB alignment, so no property is needed.

### Step 3: Update `android/app/build.gradle`

Add packaging configuration to ensure proper native library handling:

```gradle
android {
    // ... your existing configuration ...
    
    buildTypes {
        // ... your build types ...
    }
    
    // Add this block to support 16 KB page size requirement
    packaging {
        jniLibs {
            useLegacyPackaging = false
        }
    }
}
```

### Step 4: Update NDK Version (Optional but Recommended)

In `android/build.gradle`, ensure you're using NDK r26b or higher:

```gradle
buildscript {
    ext {
        // ... other config ...
        ndkVersion = "26.1.10909125"  // or higher (r27, r28)
        // ...
    }
}
```

**Note:** If you update to NDK 28, you'll need to accept the license:
```bash
sdkmanager --licenses
```

### Step 5: Clean and Rebuild

```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

### Step 6: Verify Your Build

After building, check that:
1. The build completes successfully
2. No errors about deprecated properties
3. The AAB file is generated

## Complete Example Files

### `android/gradle.properties`
```properties
# ... your existing properties ...

# Use this property to enable or disable the Hermes JS engine.
hermesEnabled=true

# Note: 16 KB page size support is automatically handled by AGP 8.5.1+
# The deprecated 'android.bundle.enableUncompressedNativeLibs' property is not needed

# ... rest of your properties ...
```

### `android/app/build.gradle` (relevant section)
```gradle
android {
    // ... existing config ...
    
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
    
    // Packaging options to support 16 KB page size requirement
    packaging {
        jniLibs {
            useLegacyPackaging = false
        }
    }
}
```

## Troubleshooting

### If you still get the error after these changes:

1. **Check third-party libraries**: Some native libraries might not support 16 KB pages yet. Update all your dependencies:
   ```bash
   npm update
   # or
   yarn upgrade
   ```

2. **Verify AGP version**: Make sure you're using AGP 8.5.1 or higher. Check your React Native version compatibility.

3. **Check specific libraries**: Common culprits include:
   - `react-native-pdf`
   - `react-native-razorpay`
   - `react-native-reanimated`
   - Any library with native code (`.so` files)

   Update these to their latest versions.

4. **Test with emulator**: Use an Android emulator configured with 16 KB page size to test your app.

## Quick Checklist

- [ ] Removed deprecated `android.bundle.enableUncompressedNativeLibs` property
- [ ] Added `packaging` block to `android/app/build.gradle`
- [ ] Verified AGP version is 8.5.1+ (check React Native version)
- [ ] Updated NDK to r26b or higher (optional)
- [ ] Cleaned and rebuilt the project
- [ ] Updated all npm dependencies
- [ ] Built new release bundle

## Summary

The key points:
1. **AGP 8.5.1+ automatically handles 16 KB alignment** - no property needed
2. **Remove deprecated properties** - they cause build errors
3. **Add packaging configuration** - ensures proper native library handling
4. **Update dependencies** - ensure all native libraries support 16 KB pages

Your app should now pass Google Play Store's 16 KB page size validation!

