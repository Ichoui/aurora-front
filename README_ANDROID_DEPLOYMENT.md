# ANDROID

# Shell Order

### FIRST TIME

`npm run android:build:prod` : Build in prod mode<br>
`npm run android:create` : create android folder<br>
`npm run android:generate-logos-assets` : generate logo and splashcreens for PlayStore and app (launch "à la mano"... sometimes bugged)<br>
`npm run android:sync-styles` : copy [styles.xml](src/styles.xml) to `android/app/src/main/res/values/styles.xml`<br>
`npm run android:update-files` : Update native dependecies, Install capacitor and/or cordova plugins<br>
`npm run android:copy-files` : Copy web assets <br>
Note : les permissions manifest et les versions (versionCode/versionName) sont gérées directement dans le projet Android.<br>

---

### IF ANDROID FOLDER EXISTS

`npm run android:build:prod` : Build in prod mode<br>
`npm run android:sync-styles` : copy [styles.xml](src/styles.xml) to `android/app/src/main/res/values/styles.xml`<br>
`npm run android:update-files` : Update native dependecies, Install capacitor and/or cordova plugins<br>
`npm run android:copy-files` : Copy web assets <br>
Note : les permissions manifest et les versions (versionCode/versionName) sont gérées directement dans le projet Android.<br>

# Build Splashscreen et Logos

Official tool for building splashscreens and Playstore Logo
https://www.npmjs.com/package/@capacitor/assets

An Android folder should exists

# Symbole de débogage

Il est indiqué dans la doc de Google, qu'on doit importer les symboles de débogages pour chaque release, pour mieux debuger une application.

Il faut rajouter dans le fichier `build.gradle` le chemin suivant :

> android.defaultConfig.ndk.debugSymbolLevel = 'FULL | SYMBOL_TABLE'

_Full -> application inférieure à 300Mo, autrement mettre Symbol_table_

Après build de l'application native, il faut importer ces symboles dans la Console Google.

> Aller à `[YOUR_PROJECT]\app\build\intermediates\merged_native_libs\release\out\lib`<br>
> Créer "Symbol File.zip" avec les 3 fichiers suivants :
>
> - arm64-v8a
> - armeabi-v7a
> - x86_64

Depuis l'interface du PlayStore :

- Explorateur d'app bundle
- Choisir la version souhaitée
- Onglet téléchargements
- Uploader le zip dans "Symboles de débogages natifs"

Remarque : il existe manifestement une erreur du côté du PlayStore, la doc Google indique clairement que seule les appli .apk doivent importer leurs symbole. Les .aab devraient être importé automatiquement par Google au moment de l'upload sur le PlayStore.

# Deployment on Play Store

Il est demandé par Google lors de l'upload de l'APK pour déploiement d'utiliser leur système [Android App Bundler](https://developer.android.com/platform/technology/app-bundle), qui vise à réduire la taille de l'application pour l'utilisateur. Extension **.aab**

Depuis Android Studio, on génère l'application au format .aab :

> Build > Generate Signed Bundle / Apk

- Android App Bundle
- Key store path : Sélectionner le keystore du projet (./keystore)
- Key store password : 6 chiffres bien connus 😬
- Key alias : alias_aurora (existe déjà, lié au .keystore)
- Key password : 6 chiffres bien connus 😬
- Décocher "Export encrypted key..."
- Sélectionner "release"
- Le fichier se réceptionne sur le path suivant `android\app\release\app-release.aab`

**Pour déploiement en prod**

_Publication gérée_ : Il faut l'activer pour avoir le contrôle de ce qu'on déploie (modifications store ou application)

_Publier _ : C'est dans ce pannel qu'on gère les différentes versions, allant de la version de test fermée interne à la production.
Pour créer une nouvelle version :

1.  Choisir la Version souhaitée (interne alpha bêta...)
2.  Créer une release
3.  Ajouter l'artefact .aab précédemment généré (si la version a déjà été upload précédemment, il est possible de la retrouver dans la bibliothèque d'artefacts)
4.  Gérer les [symboles de debogage]
5.  Faire correspondre le _Nom de la release_ avec la version souhaitée
6.  Lancer le déploiement en version [de votre choix]

Informatif : Une adresse email présente dans une liste de diffusion, par exemple, en version de tests internes, ne peut être utilisée dans une autre version de test. Elle doit être unique. Il faut alors désinscrire l'adresse mail de la liste de diffusion, la publiée et la ré-inscrire.

L'application va maintenant être vérifiée par Google. Vous pouvez retrouver en haut votre demande dans _Affichage le journal des modifications_. Lorsque l'application sera acceptée par Google, il vous suffira d'appuyer sur le bouton [Mettre en Ligne]
