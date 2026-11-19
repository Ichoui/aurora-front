# Plan Aurora

Ce dossier centralise les décisions et les preuves de vérification pour le client Ionic/Capacitor et l’API NestJS/Firebase. La version distribuée depuis plusieurs années sert de référence pour les parcours, les préférences enregistrées et le contrat HTTP.

Les tâches, leur priorité, leur difficulté et leurs critères de passage sont dans les plans d’exécution [front](front/03-plan-execution.md) et [back](back/02-plan-execution.md).

| Ordre | Livrable | Critère de passage |
| --- | --- | --- |
| 1 | [Qualification et non-régression](front/02-recette.md) | Version Play et version locale comparées. Mise à jour Android sur une installation existante prévue dans la recette. |
| 2 | [Audit UX et feuille de route Ionic](front/01-experience-mobile.md) | Onglets accessibles, carte directement visible, verre lisible, permissions et retour vérifiés sur Android. |
| 3 | [Qualification Firebase et compatibilité](back/01-firebase-et-contrat.md) | API validée sur émulateur et sur un projet de qualification avec des requêtes représentatives de la version Play actuelle. |
| 4 | [Guide Android](../README_ANDROID_DEPLOYMENT.md) et [guide Firebase](../../aurora-back/docs/deployment.md) | Bundle signé vérifié, recette interne réussie et procédure de retour arrière connue avant diffusion. |

Pour chaque séance, mettre à jour le tableau de recette avec la date, le build, l’appareil, la cible API, le résultat et la preuve. Un contrôle de compilation, un appel API et un geste sur téléphone représentent trois validations distinctes.

Les changements sortent par lots indépendants. Traiter d’abord les erreurs de chargement, les permissions et la compatibilité, puis la navigation et la lisibilité. Évaluer les animations, optimisations et adaptations iOS après avoir mesuré cette première version. Si l’API change, rendre sa nouvelle version compatible avec l’ancienne app avant de publier le client.
