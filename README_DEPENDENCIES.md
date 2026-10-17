# Mise à niveau — 17 octobre 2026

## Dépendances

| Ensemble                       | Version |
| ------------------------------ | ------- |
| Angular, CLI et builder        | 22.2.3  |
| Angular ESLint                 | 22.6.0  |
| Ionic                          | 9.0.8   |
| Capacitor Core, Android et CLI | 8.5.3   |
| TypeScript                     | 6.0.3   |
| ESLint                         | 10.13.0 |
| ngx-translate                  | 18.0.0  |
| ngx-lottie                     | 22.0.0  |
| Swiper                         | 14.3.0  |
| Ionicons                       | 8.1.0   |

Toutes les dépendances directes, y compris les bibliothèques secondaires et les outils, ont été vérifiées dans le registre npm et actualisées vers leur dernière version stable compatible. Certaines bibliothèques, comme Leaflet, Ionic Storage et le pilote SQLite, ont une dernière publication ancienne : elles ne sont pas pour autant en retard de version. `package-lock.json` fixe les versions installées.

Exception de compatibilité : TypeScript reste en 6.0.x, car Angular 22 impose `>=6.0 <6.1`, malgré la disponibilité de TypeScript 7. Les anciens plugins ESLint inutilisés ont été retirés, permettant ESLint 10.

## Modernisation réalisée

- Builder `@angular/build:application` (esbuild), sortie web conservée dans `www/`, démarrage via le CLI local et suppression de Webpack et de Zone.js.
- Application standalone et zoneless, `inject()`, signal inputs et queries, valeurs dérivées avec `computed()`, initialisation DOM via `afterNextRender()`.
- `OnPush` sur les composants adaptés. Les composants racine et de navigation Ionic conservent volontairement `Eager`, nécessaire aux vues mises en cache du routeur Ionic lorsque leur état utilise encore des propriétés ordinaires.
- Transmission des entrées des modales par `ComponentRef.setInput()` grâce à `provideIonicAngular({ useSetInputAPI: true })` ; cet élément est nécessaire pour les signal inputs.
- Intercepteur HTTP fonctionnel, backend Fetch par défaut et désabonnement avec `takeUntilDestroyed()` ; nettoyage des graphiques, cartes, recherches et temporisations.
- TypeScript et templates stricts, sans `any` explicite ni suppression des diagnostics Angular dans le code applicatif. Types explicites pour les API, le stockage, les graphiques et les événements Ionic.
- Géolocalisation avec `@capacitor/geolocation`, barres système avec `SystemBars` du cœur Capacitor ; suppression de l’ancien pont Cordova de géolocalisation et du plugin Status Bar remplacé.
- Imports Ionic actuels, icônes enregistrées explicitement, Sass `@use`, suppression de la feuille Leaflet distante obsolète et configuration ESLint réellement appliquée au projet.
- Découpage des méthodes et fonctions conservé, sans refonte métier. SQLite et son pilote sont maintenus pour préserver les données existantes : changer le moteur demanderait une migration distincte.

## Environnement et commandes

Utiliser `nvm use` avant les commandes npm : `.nvmrc` sélectionne Node 22.22.3. Les autres versions de Node acceptées sont déclarées dans `package.json`.

Android nécessite JDK 21 et SDK Android 36. Les versions Gradle et Android Gradle Plugin restent celles prévues pour Capacitor 8. `JAVA_HOME` doit désigner le JDK ; configurer le SDK via `ANDROID_HOME` ou `android/local.properties`.

```sh
nvm use
npm install
npm run lint
npm run typecheck
npm run prettier:check
npm run build -- --configuration=ci
npm run android:build:prod
npm run android:sync
cd android
./gradlew :app:assembleDebug --no-daemon --console=plain
```

Le script `deploy` prépare le projet Android existant ; il ne recrée plus le dossier natif. La signature et les identifiants de publication ne sont pas modifiés. L’APK debug utilise la signature de développement et se trouve dans `android/app/build/outputs/apk/debug/app-debug.apk`.

## Vérifications et limites

Les contrôles incluent lint, typage strict, formatage, builds web de développement et production, synchronisation Capacitor et compilation Android debug. Des vérifications temporaires comparent 632 résultats des utilitaires métier avec le code précédent, et des parcours navigateur couvrent démarrage, traductions, préférences, navigation Ionic mise en cache, graphiques météo/aurores, modale des pôles et recherche de ville. Les API externes sont simulées dans ces parcours ; aucun framework de test permanent n’a été ajouté.

Le registre a été interrogé pour toutes les dépendances directes. L’audit final signale **0 vulnérabilité de production** et **7 alertes dans l’outillage** (3 modérées, 3 élevées, 1 critique), via les chaînes Capacitor/assets/Trapeze et leurs dépendances `sharp`, `tar`, `xcode` et `uuid`. Les paquets parents sont déjà à leur dernière version publiée. Ne pas forcer des versions transitives incompatibles ni appliquer aveuglément `npm audit fix --force`.

Une validation sur appareil reste nécessaire pour la géolocalisation native, SQLite, les permissions et le rendu Android réel. La compilation native et les parcours web simulés ne remplacent pas cette recette.

Le build optimisé peut signaler l’utilisation d’`eval` dans le moteur d’expressions de `lottie-web`. Cet avertissement provient de la bibliothèque actuelle, pas du code applicatif. Les dépendances CommonJS conservées (notamment LocalForage/SQLite) sont déclarées explicitement dans la configuration Angular.
