# Plan d’exécution front

**P0** désigne un correctif ou une validation nécessaire à la diffusion du lot concerné. **P1** désigne une amélioration du prochain lot. **P2** désigne un chantier conditionné par des mesures ou une plateforme future. La difficulté estime la complexité et le risque de régression.

| Tâche | Priorité | Difficulté | Dépendance et résultat attendu |
| --- | --- | --- | --- |
| **F01 · Établir la référence Play** | P0 | Moyenne | En parallèle de B01 côté API. Relever la version Play, l’URL API et les comportements à préserver. Capturer les parcours de référence dans Brave, sur un Android modeste et sur un Android récent. Consigner version, appareil, résultat et réseau. |
| **F02 · Réparer les liens directs et le retour** | P0 | Moyenne | Après F01. Corriger la redirection au démarrage et utiliser la pile Ionic. Les routes Carte et Aide restent ouvertes en accès direct. Le retour ferme d’abord clavier ou overlay, puis restaure l’onglet et l’écran d’origine. Vérifier le bouton et le geste Android. |
| **F03 · Rendre la carte utilisable malgré une erreur** | P0 | Moyenne | Après F01, en parallèle de F02. Le fond, le marqueur et la recherche restent disponibles si OVATION ou le nowcast échoue. Le spinner se termine et chaque source en erreur peut être relancée. L’attribution reste visible et une coordonnée à 0° est conservée. |
| **F04 · Fiabiliser le lieu et le cache** | P1 | Élevée | Après F03. Démarrer avec le lieu conservé ou un repli affiché. Demander le GPS sur action, gérer refus et précision approximative, puis distinguer aperçu et lieu confirmé. Lors d’une sélection A puis B avec réponse A tardive, seul B alimente l’affichage et le cache. La mise à jour conserve les anciens lieux et préférences. |
| **F05 · Préserver le direct et qualifier les onglets** | P1 | Moyenne | Après F02. Ouvrir Aurores sur le direct avec la scène entière et ses mesures, sans défilement vertical. Afficher le lieu et la fraîcheur via Infos. Conserver la carte uniquement au deuxième volet et le logo central débordant de la barre. Garder les trois libellés, dont « Réglages » et « Settings ». |
| **F06 · Qualifier le correctif Ionic** | P1 | Faible | Tester la mise à jour Ionic isolément avec la référence F01. Vérifier le focus, les overlays, les zones sûres et les gestes. |
| **F07 · Corriger la légende et le rendu OVATION** | P1 | Moyenne | Après F03. Aligner la légende sur les classes de rendu et vérifier les seuils, la première cellule de la grille et les deux hémisphères. |
| **F08 · Qualifier l’AAB de chaque lot** | P0 | Élevée | Après les tâches retenues pour la release. Avec les accès Play et la clé d’envoi existante, vérifier versions, empreinte et package, puis installer sur piste interne. La recette doit passer sur installation vierge et après mise à jour depuis Play avec lieu et préférences préexistants. |
| **F09 · Retirer la clé météo du bundle** | P1 | Moyenne | Après B05, quand la production et sa révision de repli acceptent les appels sans `appid`. Vérifier météo et géocodage sur l’artefact de qualification. L’ancienne app doit continuer à fonctionner sur la même API. |
| **F10 · Mesurer la fluidité de Leaflet** | P2 | Moyenne | Après F03 et F07. Mesurer chargement, zoom, panoramique et mémoire sur Android modeste. Tester un rendu Canvas si ces mesures justifient de modifier le moteur de dessin. |
| **F11 · Préparer le pilote iOS** | P2 | Élevée | Après stabilisation des parcours partagés. Vérifier permissions, VoiceOver, Dynamic Type, zones sûres et retour sur simulateur et iPhone. Conserver le contrat HTTP commun. |

## Ordre de réalisation

1. **Stabilisation Android.** F01, puis F02 et F03 en parallèle, puis F08 sur une première candidate corrective.
2. **Expérience mobile.** F04 et F05 en lots distincts, avec F06 et F07 vérifiés indépendamment. Rejouer F08 avant chaque diffusion.
3. **Suites.** F09 suit la migration API du [plan back](../back/02-plan-execution.md). F10 et F11 s’appuient sur une base Android validée.

La [recette Android](02-recette.md) détaille les scénarios fonctionnels. Le [guide de release](../../README_ANDROID_DEPLOYMENT.md) décrit les secrets locaux, la signature et la diffusion progressive. Si les erreurs augmentent après publication, suspendre la progression et préparer un correctif avec un code de version supérieur pour les appareils déjà mis à jour.
