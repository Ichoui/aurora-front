# Plan d’exécution back

Firebase Functions v2, Node.js 22 et le catalogue embarqué sont en place. Le build, OpenAPI et 19 contrôles HTTP à chaud ont été validés localement. La qualification de la cible effectivement utilisée par Play reste à faire.

## État du lot de stabilisation

- **B01 et B04.** Le CLI n’a pas pu s’authentifier sur le projet configuré. La révision réelle, le projet de qualification et sa restauration restent à confirmer.
- **B02.** La recette reproductible `scripts/check-http.cjs` passe 22/22 sur l’émulateur, et `docs:check` passe. Le parcours météo avec la clé historique a été observé dans Brave.
- **B03.** L’initialisation est partagée. Après un échec, la requête suivante repart avec une nouvelle instance Express. Le test du cas concurrent et de la récupération passe. Les mesures sur Firebase restent à réaliser.
- **B05.** Le code local garde la priorité de l’`appid` historique et accepte un repli par variable serveur. Le test de compatibilité passe. Le secret distant et la qualification des appels sans `appid` restent à traiter avant F09.

| Tâche | Priorité | Difficulté | Dépendance et résultat attendu |
| --- | --- | --- | --- |
| **B01 · Cartographier le service en production** | P0 | Moyenne | En parallèle de F01. Avec les accès Play et Firebase, relever les versions mobiles prises en charge, URL et préfixes, redirections, projet, région, fonction et révision active. Identifier le projet de qualification et la source ou révision de repli. |
| **B02 · Figer la recette du contrat** | P0 | Moyenne | Préparation locale en parallèle de B01. Formaliser les requêtes historiques, puis les rejouer sur la cible qualifiée. Couvrir les routes villes et NOAA, coordonnées zéro et alias, formes d’OVATION et du nowcast, météo et géocodage avec clé de qualification, CORS, header et erreurs 400, 502 et 504. Vérifier OpenAPI et le catalogue dans l’artefact. |
| **B03 · Mesurer et fiabiliser le démarrage à froid** | P0 | Élevée | Avec la recette B02. Distinguer bootstrap, appels fournisseurs et effet de la concurrence. Reproduire un échec d’initialisation et vérifier qu’une requête suivante récupère après le 503 existant. Garder une initialisation partagée et un seul chargement OVATION simultané par instance. Les délais observés localement servent de scénario à reproduire. |
| **B04 · Répéter le déploiement ciblé et la restauration** | P0 | Moyenne | Après B01, avec B02 et B03 comme critères de validation. Déployer `functions:aurora` sur le projet de qualification nommé explicitement. Rejouer les requêtes historiques, tester un build courant pointant vers ce projet et vérifier séparément l’app Play sur son URL habituelle. Répéter la restauration et vérifier la révision et les réponses après retour. |
| **B05 · Déplacer OpenWeather vers Secret Manager** | P1 | Élevée | Après B04, avec accès au secret et au quota de qualification. Recevoir aussi bien l’appel historique avec `appid` que l’appel sans clé, préserver les réponses et les erreurs attendues et contrôler quota, latence et journaux. Déployer l’API compatible avant F09. Valider au préalable une révision de repli qui accepte également les deux formes. |
| **B06 · Ajuster capacité et cache sur mesures** | P2 | Moyenne | Après B03 et avec les mesures de qualification ou de production. Comparer latences, 5xx, charge NOAA/OpenWeather et coûts avant d’ajuster la capacité ou la durée du cache. |

**Ordre de réalisation.** Lancer B01 et la préparation de B02 ensemble. Mener B03 sur la base de cette recette. Utiliser B04 pour valider la candidate sur le projet de qualification et répéter la restauration avant toute publication autorisée. B05 et le ticket front F09 forment une migration distincte. Une release Android qui garde le contrat peut avancer indépendamment de cette migration.

**Accès requis.** Play Console et lecture de Firebase production pour l’inventaire. Projet Firebase de qualification avec droits de déploiement et clé OpenWeather de qualification pour la recette. La publication de la fonction en production fait l’objet d’un accord explicite dans le [workflow de release](../../../aurora-back/docs/deployment.md).

Le [détail du contrat et de l’inventaire](01-firebase-et-contrat.md) et le [plan front](../front/03-plan-execution.md) servent de référence pour les dépendances.
