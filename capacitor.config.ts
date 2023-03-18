import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.aurora.v2',
  appName: 'Aurora Northern Lights',
  webDir: 'www',
  bundledWebRuntime: false,
};

export default config;

//https://capacitorjs.com/docs/config  s'appelait capacitor.config.json au début, changé selon cette doc pour le typage

// {
//     "appId": "io.aurora.start",
//     "appName": "Aurora Chasers",
//     "bundledWebRuntime": false,
//     "npmClient": "npm",
//     "webDir": "www",
//     "windowsAndroidStudioPath": "C:\\Users\\nicol\\AppData\\Local\\JetBrains\\Toolbox\\apps\\AndroidStudio\\ch-0\\193.6626763\\bin\\studio64.exe",
//     "plugins": {
//     "SplashScreen": {
//         "launchShowDuration": 0
//     }
// },
//     "cordova": {
//     "preferences": {
//         "ScrollEnabled": "false",
//             "android-minSdkVersion": "19",
//             "BackupWebStorage": "none",
//             "SplashMaintainAspectRatio": "true",
//             "FadeSplashScreenDuration": "300",
//             "SplashShowOnlyFirstTime": "false",
//             "SplashScreen": "screen",
//             "SplashScreenDelay": "3000"
//     }
// },
//     "server": {
//     "url": "http://192.168.10.54:8100"
// }
// }
