# Aurora Northern Lights Project

### Installation
`npm i` for dependencies
<br> Create a typescript file here `src/environments/keep.ts` and then :
- export a const named `OPENWHEATHER_API_KEY`

You will need an OpenWeatherMap free account.

Start project with `npm run start:browser-cordova` and test on your browser.
Uncomment in `tab1/tab1.page.ts` the following : this.getForecast() , then comment the lines below to avoid reverseGeoloc errors due to cordova.


`Update:native` & `prepare:native` for building /www and /android folders, then use `ide:open` to open Android Studio and build project to your phone.

### About 
Aurora Northern Lights Forecast 
<br>
Mobile App (IONIC Angular).
This project will be deployed on Android mobile devices in a first time. 
<br>
1st Release date : mi-december 2019.


### Credits 
- OpenWeatherMap API for the weather : https://openweathermap.org/api/one-call-api#data 
- Aurora Live API for the auroras' informations : http://auroraslive.io/#/
- Thanks to JHEY for his talent, found on Codepen : https://codepen.io/jh3y/pen/JKddVx
- Various websites for informations & stories about Aurora
- Me, @Ichoui, for sure ☺


    "ngx-pinch-zoom": "^2.6.2",
    "cordova-browser": "^6.0.0",
    "cordova-plugin-geolocation": "4.1.0",
    "cordova-plugin-nativegeocoder": "3.4.1",
    "cordova-res": "^0.15.4",
    "cordova-sqlite-storage": "^3.4.1",
    "@capacitor/android": "4.0.1",
    "@ionic-native/core": "5.36.0",
    "@ionic-native/geolocation": "5.36.0",
    "@ionic-native/in-app-browser": "5.36.0",
    "@ionic-native/native-geocoder": "5.36.0",
    "@ionic-native/splash-screen": "5.36.0",
    "@ionic-native/status-bar": "5.36.0",
    "@ionic/storage": "3.0.6",


    "@ngx-translate/core": "^14.0.0",
    "@ngx-translate/http-loader": "^7.0.0",
    "@types/chart.js": "^2.9.37",
    "@types/leaflet": "^1.7.11",
    "chart.js": "^3.9.1",
    "chartjs-plugin-datalabels": "^2.1.0",

    "@ngx-translate/core": "^14.0.0",
    "@ngx-translate/http-loader": "^7.0.0",
    "@types/chart.js": "^2.9.37",
    "@types/leaflet": "^1.7.11",
    "chart.js": "^3.9.1",
    "chartjs-plugin-datalabels": "^2.1.0",
    "core-js": "^2.5.7",
    "leaflet": "^1.8.0",
    "moment": "^2.29.4",
    "ng-lottie": "^0.3.2",
    "ngx-lottie": "^8.2.1",
    "prettier": "^2.7.1",
