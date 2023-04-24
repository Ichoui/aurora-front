# ANDROID

# Shell Order

`npm run android:build:prod` : Build in prod mode<br>
`npm run android:create` : create android folder<br>
`npm run android:generate-logos-assets` : generate logo and splashcreens for PlayStore and app (launch "à la mano"... sometimes bugged)<br>
`npm run android:trapeze` : generate android data like manifest config and update version. Moreover, copy [styles.xml](src/styles.xml) to android folder path `android/app/src/main/res/values/styles.xml`<br>
`npm run android:update-files` : Update native dependecies, Install capacitor and/or cordova plugins<br>
`npm run android:copy-files` : Copy web assets <br>


IF ANDROID FOLDER EXISTS :
`npm run android:build:prod` : Build in prod mode<br>
`npm run android:trapeze` : generate android data like manifest config and update version. Moreover, copy [styles.xml](src/styles.xml) to android folder path `android/app/src/main/res/values/styles.xml`<br>
`npm run android:update-files` : Update native dependecies, Install capacitor and/or cordova plugins<br>
`npm run android:copy-files` : Copy web assets <br>

# Build Splashscreen et Logos

Official tool for building splashscreens and Playstore Logo
https://www.npmjs.com/package/@capacitor/assets

An Android folder should exists

# Deployment on Play Store

Il est visiblement demandé par Google lors de l'upload de l'APK pour déploiement d'utiliser leur système [Android App Bundler](https://developer.android.com/platform/technology/app-bundle), qui vise à réduire la taille de l'application pour l'utilisateur.

Depuis Android Studio :

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

Il faut activer la _Publication planifiée_, qui peut être trouvée dans le paneau de gauche de la Console Google dans 'Présence sur le Play Store / Tarifs et disponibilité' tout en bas. Doit être réactivé après chaque version Mise en ligne. **OBLIGATOIRE** pour un déploiement en prod.

_Gestion des releases_ : C'est dans ce pannel qu'on gère les différentes versions, allant de la version de test fermée interne à la production.
Pour créer une nouvelle version :

1.  Choisir la Version souhaitée (interne alpha bêta...)
2.  Gérer > Gérer une release
3.  Ajouter l'artefact .aab précédemment généré (si la version a déjà été upload précédemment, il est possible de la retrouver dans la bibliothèque d'artefacts)
4.  Faire correspondre le _Nom de la release_ avec la version souhaitée
5.  Vérifier
6.  Lancer le déploiement en version [de votre choix]

L'application va maintenant être vérifiée par Google. Vous pouvez retrouver en haut votre demande dans _Affichage le journal des modifications_. Lorsque l'application sera acceptée par Google, il vous suffira d'appuyer sur le bouton [Mettre en Ligne]
