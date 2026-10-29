# Consignes du dépôt

## Projet associé

Ce dépôt est le client Ionic/Angular de l'API NestJS/Firebase située dans `../aurora-back` (chemin local habituel : `/Users/ichoui/Dev/aurora-back`). Le client cible actuellement Android ; une version Apple est prévue. Les deux plateformes doivent pouvoir utiliser le même contrat HTTP.

Codex peut lire les deux dépôts pour comprendre un flux complet, retrouver la définition d'une route ou d'un champ et mesurer l'impact d'un changement. Pour les appels réseau, consulter `src/app/aurora.service.ts`, les modèles et `src/environments/` ici, puis `../aurora-back/docs/api-contract.md`, `../aurora-back/docs/openapi.json` et les contrôleurs du backend. Ne modifier le dépôt voisin que si la demande porte aussi sur ce dépôt ou si la modification est nécessaire à la tâche demandée ; expliquer alors le changement.

En cas d'écart entre le contrat documenté et le client, examiner les deux implémentations avant de décider laquelle adapter. Préserver les comportements utilisés par l'application et ne pas lier le contrat partagé à Android.

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

- Je préfere que tu ne touches pas à GIT et que tu me laisses faire les commits et les PR, pour garder un historique propre et cohérent.

[//]: # '- L’historique git montre des messages courts et informels, sans convention stricte.'
[//]: # '- Garder des commits concis et descriptifs (impératif recommandé) et éviter de mélanger des changements non liés.'
[//]: # '- Pour les PR : inclure un résumé clair, lier les issues pertinentes, et ajouter des captures pour les changements UI.'
[//]: # '- Si les assets Android ou la config native changent, mentionner les commandes exécutées (ex. `npm run deploy`).'

## Sécurité & configuration

- Ne pas committer de secrets. Garder les clés API dans `src/environments/keep.ts` (local uniquement) et documenter les variables requises.
- Les clés de signature Android ne doivent pas être remplacées ou régénérées sans coordination.
