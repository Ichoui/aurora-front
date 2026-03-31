# Customisations Android (backup)

Ce document sert de **backup** des customisations natives à réappliquer si le dossier `android/` est supprimé puis recréé.

## Procédure rapide

1. `npm run android:create`
2. Appliquer les sections ci‑dessous (manifest, versions, styles, couleurs).
3. `npm run android:sync-styles`
4. `npm run android:update-files`
5. `npm run android:copy-files`

## Manifest — permissions et features

Fichier : `android/app/src/main/AndroidManifest.xml`

Ajouter sous `<!-- Permissions -->` :

```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-feature android:name="android.hardware.location.gps" />
```

## Versions app (Gradle)

Fichier : `android/app/build.gradle` → `defaultConfig`

```gradle
versionCode 2019
versionName "1.3.1"
```

## SDK levels

Fichier : `android/variables.gradle`

```gradle
minSdkVersion = 24
compileSdkVersion = 36
targetSdkVersion = 36
```

## Styles Android

Source : `src/styles.xml`  
Destination : `android/app/src/main/res/values/styles.xml`

Commande : `npm run android:sync-styles`

## Couleurs Android (nécessaires pour styles.xml)

Fichier : `android/app/src/main/res/values/colors.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#69bfaf</color>
    <color name="colorPrimaryDark">#5ca89a</color>
    <color name="colorAccent">#69bfaf</color>
</resources>
```
