## ANDROID

### Android Studio

### Builder pour déployement

Pour déployer l'application sur la [console Android](https://play.google.com/apps/publish/?account=6358788392649908936#AppDashboardPlace:p=io.aurora.start&appid=4976027160362440881), il faut générer un APK type .aab signé. Suivre les points suivants :

#### Version

Mettre à jour la version comme suit pour chaque déploiement dans le fichier `android/app/build.gradle`


```shell
// Pour la Version 5.3.1 Build n° 3 
versionCode 1000
versionName "1.0"
```
La versionCode doit être plus élevée que la dernière version en ligne pour être prise en compte

#### Génération de l'icône pour les notifications push

Dans Android Studio, faire Click droit sur app > res. Cliquer sur New > Image Asset
Sélectionner le type d'icone "Notification Icons". Renseigner le nom "notification_icon".
Importer l'image contenue dans projet_front_anie > resources > android > notification_icon.png
Mettre le padding à -10
Cliquer sur Next et générer l'icône.


#### Deployment 2.0

Il est visiblement demandé par Google lors de l'upload de l'APK pour déploiement d'utiliser leur système [Android App Bundler](https://developer.android.com/platform/technology/app-bundle), qui vise à réduire la taille de l'application pour l'utilisateur.

Le format remplaçant le .apk se nomme `.aab`.

Depuis Android Studio :

> Build > Generate Signed Bundle / Apk

- Android App Bundle (format .aab)
- Choose existing : Sélectionner le keystore du projet (.jks)
- Rentrer le keystore password, l'alias et le key password (ils existent déjà, demander à Morgan par exemple)
- Ne pas cocher "Export encrypted..."
- Sélectionner "release" puis terminer.
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
