# Release Android d’Aurorapp

## Prérequis locaux

- Node.js de `.nvmrc`, `npm ci`, JDK 21 dans `JAVA_HOME`, SDK Android 36 et dépendances Gradle accessibles. Le projet Capacitor existant utilise `io.aurora.start`. [Dépendances du projet](README_DEPENDENCIES.md) · [Détails de signature Android](https://developer.android.com/studio/publish/app-signing) · [Niveau d’API Play](https://developer.android.com/google/play/requirements/target-sdk)
- Copier `src/environments/keep.example.ts` vers `src/environments/keep.ts` si ce fichier local manque. Charger l’export `OPENWHEATHER_API_KEY` depuis le stockage de secrets habituel. Le build embarque cette clé météo dans les fichiers web, même si Git ignore `keep.ts`. Utiliser la clé de production prévue pour ce build et restreindre ses usages chez le fournisseur dans la mesure permise par le contrat. [Migration de la clé côté Firebase](ia/back/01-firebase-et-contrat.md)
- Identifier dans Play Console le plus grand `versionCode` déjà utilisé sur les pistes du produit, le `versionName` souhaité et le certificat SHA-256 **d’envoi**. Le `versionCode` doit être supérieur. Reprendre le keystore et l’alias d’envoi existants depuis le coffre local. Le fichier présent à la racine n’a pas été identifié comme le bon certificat. Documenter son origine avec le propriétaire avant tout déplacement ou remplacement.
- Fournir au processus `AURORA_ANDROID_KEYSTORE_PATH`, `AURORA_ANDROID_KEY_ALIAS`, `AURORA_ANDROID_STORE_PASSWORD` et `AURORA_ANDROID_UPLOAD_SHA256`. Fournir `AURORA_ANDROID_KEY_PASSWORD` si la clé requiert un mot de passe distinct. Utiliser l’environnement local ou le gestionnaire de secrets pour charger les mots de passe. Le script les transmet à `keytool` et `jarsigner` par référence à l’environnement et les retire de l’environnement du build.
- `android/app/google-services.json` active conditionnellement le plugin Google Services. Si le projet Play utilise la fonctionnalité associée, reprendre le fichier de la configuration Android de production et vérifier qu’il correspond au package et au projet attendus. La clé privée de compte de service Firebase reste côté serveur.

## Générer le bundle signé

À partir de la racine, renseigner les versions choisies en premier argument puis en second argument.

```sh
npm run android:bundle -- VERSION_NAME VERSION_CODE
```

Le script compare le certificat du keystore à l’empreinte Play, exécute le pipeline `npm run deploy` existant puis Gradle `:app:bundleRelease`. Les paramètres Gradle s’appliquent à ce build et les valeurs par défaut restent dans le fichier de projet. Le `.aab` signé et vérifié se trouve sous `android/app/build/outputs/bundle/release/aurorapp-VERSION_CODE-VERSION_NAME.aab`. Le script imprime son SHA-256. Archiver l’artefact, son empreinte, les deux numéros de version et la référence source de la release.

`npm run deploy` seul compile le web, génère l’icône et le splash, recopie les styles natifs et synchronise Capacitor. `android:create` est réservé à la création initiale. Voir les [customisations natives](README_ANDROID_CUSTOMIZATIONS.md).

Android Studio permet aussi la génération via **Build → Generate Signed Bundle / APK → Android App Bundle → release**. Pour cette voie, reporter les deux versions dans la configuration utilisée par l’IDE avant le build, utiliser la même clé d’envoi et contrôler l’empreinte. Le chemin dépend de la destination choisie dans l’IDE.

## Vérifier et diffuser

1. Contrôler le package, `versionCode`, `versionName` et la signature avec `bundletool` et le certificat Play. Si des bibliothèques natives sont présentes, vérifier la compatibilité des pages de 16 Kio et les symboles de cette version dans Play Console. [bundletool](https://developer.android.com/studio/command-line/bundletool) · [Pages 16 Kio](https://developer.android.com/guide/practices/page-sizes)
2. Déposer le `.aab` sur la piste interne après autorisation de publication. Installer la version Play antérieure sur un appareil témoin, choisir une ville et des réglages, puis appliquer la mise à jour interne. Jouer la [recette Android](ia/front/02-recette.md).
3. Passer à une diffusion progressive après la recette et surveiller erreurs, démarrages et API dans Play Console et Firebase. En cas de régression, arrêter la progression. Préparer un correctif avec `versionCode` supérieur pour les appareils déjà mis à jour.

La procédure Firebase est dans le [guide backend](../aurora-back/docs/deployment.md). Le [skill `aurora-release`](.agents/skills/aurora-release/SKILL.md) traite le bundle Android et demande séparément si le backend doit être déployé.
