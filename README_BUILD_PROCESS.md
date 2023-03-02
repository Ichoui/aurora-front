### ionic build (--prod)

> Build code to webDir ./www

### npx cap add android

> Create native ./android folder from webDir ./www

### npx cap copy

> Copy your webDir ./www to the native platforms (to ./android)

### npx cap update

> Update Android / iOS dependencies and install new Native Plugins (Capacitor / Cordova)

### ionic cap sync (--prod | --watch | --source-map)

> Chain multiple commands :
>
> - ionic build
> - npx cap copy
> - npx cap update
    >   > Note that **--watch** arg recompile code each time you save, but will not execute again copy/update

## Methods to run app on Android Studio

```
// IF ANDROID FOLDER EXISTS
Terminal :
[test mode]
ionic cap sync --prod --watch (first time only)
npx cap copy (each recompile with ctrl+s)

[prod mode]
ionic build --prod
npx cap copy

// IF ANDROID FOLDER DON'T EXISTS
npx cap add android
npx cap open android (if Android Studio is not launched)


Android Studio :
// Choice 1 or 2, depending on if app is already launch or not
1 : Run App
2 : Apply change and restart Activity (circular arrow with A)
```

Add the following when use commande `npx cap add android` (create the ./android folder) 

```
In androidManifest.XML :
// https://capacitorjs.com/docs/apis/geolocation
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-feature android:name="android.hardware.location.gps" />
```

https://stackoverflow.com/questions/70903567/pairing-new-device-on-android-studio-bumblebee-over-wifi

Was working on java19 (change env path)

Update date : 02/03/2023
