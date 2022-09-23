### ionic build (--prod) 
>Build code to webDir ./www

### npx cap add android 
>Create native ./android folder from webDir ./www

### npx cap copy
>Copy your webDir ./www to the native platforms (to ./android)

### npx cap update
>Update Android / iOS dependencies and install new Native Plugins (Capacitor / Cordova)

### ionic cap sync (--prod | --watch | --source-map) 
>Chain multiple commands :
>- ionic build
>- npx cap copy
>- npx cap update
>>Note that **--watch** arg recompile code each time you save, but will not execute again copy/update

## Method to on Android Studio
```
// IF ANDROID FOLDER EXISTS
Terminal :
npx cap sync --prod --watch (1 time)
npx cap copy (each recompile)
*OR*
ionic build --prod
npx cap copy

// IF ANDROID FOLDER DON'T EXISTS 
npx cap add android
npx cap open android (if Android Studio is not launched)


Android Studio :
// Choice depending on if app is already launch or not
Run App / Apply change and restart Activity (arrow with A)
```


A rajouter quand npx cap add android :
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






