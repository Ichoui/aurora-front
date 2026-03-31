# Consignes du dépôt

# Custom Instructions

Tu es un assistant de programmation expert.
**Instruction impérative : Réponds TOUJOURS en français.**

## Structure du projet et organisation des modules

- `src/` contient l’application Ionic/Angular.
  - `src/app/` contient les pages, composants et services.
  - `src/assets/` contient les images, JSON i18n et autres fichiers statiques.
  - `src/environments/` contient les fichiers d’environnement. Créer `src/environments/keep.ts` pour les secrets locaux.
- `android/` est le projet Android natif Capacitor.
- `www/` est la sortie build web utilisée par Capacitor.
- Les configs racine incluent `angular.json`, `capacitor.config.ts` et `ionic.config.json`.

## Commandes build, test et développement

- `npm install` installe les dépendances.
- `npm run start:front` lance le dev server Ionic.
- `npm run start:back` lance le backend depuis `../aurora-back`.
- `npm run android:build:prod` build l’app web en production.
- `npm run android:dev:watch` synchronise Capacitor en mode watch.
- `npm run deploy` exécute le pipeline complet Android build + assets + Trapeze.
- `npm run android:open` ouvre le projet Android dans Android Studio.

## Style de code et conventions de nommage

- Indentation 2 espaces (par défaut Angular/Ionic).
- Préférer les conventions Angular : `*.page.ts` pour les pages, `*.component.ts` pour l’UI partagée.
- Formatage via Prettier. Utiliser `npm run prettier` ou `npm run prettier:check`.
- Un hook Husky `pre-commit` lance `pretty-quick --staged`.

## Tests

- Aucun script de test n’est configuré dans `package.json`, et aucun framework de test n’est branché.
- Si tu ajoutes des tests, suivre les conventions Angular : `*.spec.ts` à côté des sources et ajouter un script `npm run test`.

## Commits & Pull Requests

- L’historique git montre des messages courts et informels, sans convention stricte.
- Garder des commits concis et descriptifs (impératif recommandé) et éviter de mélanger des changements non liés.
- Pour les PR : inclure un résumé clair, lier les issues pertinentes, et ajouter des captures pour les changements UI.
- Si les assets Android ou la config native changent, mentionner les commandes exécutées (ex. `npm run deploy`).

## Sécurité & configuration

- Ne pas committer de secrets. Garder les clés API dans `src/environments/keep.ts` (local uniquement) et documenter les variables requises.
- Les clés de signature Android ne doivent pas être remplacées ou régénérées sans coordination.
