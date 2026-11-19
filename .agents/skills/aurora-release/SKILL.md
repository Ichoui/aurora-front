---
name: aurora-release
description: Générer un bundle Android .aab signé pour Aurorapp ou déployer la fonction Firebase aurora. Utiliser pour une release locale avec versions Android et décision explicite oui ou non pour le backend.
---

# Release Aurorapp

Depuis `aurora-front`, lire le [guide Android](../../../README_ANDROID_DEPLOYMENT.md) si un bundle est demandé et le [guide Firebase](../../../../aurora-back/docs/deployment.md) si l’API est concernée. Conserver les deux dépôts voisins et les scripts existants comme points d’entrée.

1. Demander les informations encore manquantes. Pour Android, demander le `versionName`, le `versionCode` et le plus grand code déjà utilisé dans Play Console, si ce dernier n’a pas encore été vérifié. Pour une demande de release, obtenir séparément un **oui/non** au déploiement backend. Réutiliser une réponse explicite déjà donnée. Pour une opération backend seule, demander le projet Firebase exact et le numéro ou la référence de release à consigner. Pour une release combinée, utiliser la référence donnée pour le backend ou demander celle qui convient.
2. Préparer le bundle Android avec `npm run android:bundle -- VERSION_NAME VERSION_CODE`. Vérifier que le code dépasse celui connu dans Play, et que le JDK, l’empreinte et la configuration de signature sont chargés localement selon le guide. Les secrets restent dans les fichiers ignorés ou l’environnement local. Donner le chemin absolu du bundle, les versions et son SHA-256. La génération du bundle est une opération locale. Une mise en ligne Play demande une demande explicite distincte.
3. Si le backend est autorisé, dans `aurora-back` vérifier le projet explicite, le résultat de `npm run docs:check`, l’artefact contenant le catalogue et l’API de qualification. Pour une cible de production, demander confirmation du projet si l’autorisation précédente ne le nomme pas et vérifier que l’URL destinée aux clients existants est celle attendue. Utiliser `./node_modules/.bin/firebase deploy --only functions:aurora --project PROJECT_ID`. Le hook Firebase compile avant la mise en ligne. Si la réponse est non ou en attente, poursuivre le travail Android et garder le backend en attente.
4. Après déploiement, vérifier la réponse de l’URL retenue avec le header `aurora: true`, la version et la cible du déploiement, puis rapporter le résultat. En cas d’échec du smoke test, arrêter la diffusion mobile et suivre le guide Firebase pour qualifier le retour arrière avec le propriétaire.
