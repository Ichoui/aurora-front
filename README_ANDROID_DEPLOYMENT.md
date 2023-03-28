# ANDROID

# Shell Order

`npm run android:build:prod` : Build in prod mode<br>
`npm run android:create` : create android folder<br>
`npm run android:generate-logos-assets` : generate logo and splashcreens for PlayStore and app (launch "à la mano"... sometimes bugged)<br>
`npm run android:trapeze` : generate android data like manifest config and update version. Copy [styles.xml](src/styles.xml) to path `android/app/src/main/res/values/styles.xml`<br>
`npm run android:update-files` : Copy web assets <br>
`npm run android:copy-files` : Update native dependecies, Install capacitor and/or cordova plugins<br>

# Build Splashscreen et Logos

Official tool for building splashscreens and Playstore Logo
https://www.npmjs.com/package/@capacitor/assets

An Android folder should exists
