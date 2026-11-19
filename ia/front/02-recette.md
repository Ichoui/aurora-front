# Recette Android et compatibilité

## Référence visuelle Aurores

Le direct s’ouvre en premier. L’aurore, les mesures et le paysage occupent le volet sans défilement vertical. La probabilité au zénith est intégrée aux mesures. Sous Infos, le nom du lieu ouvre l’écran Localisation. L’heure d’actualisation est dans Infos. La miniature Leaflet se trouve sur le deuxième volet, avec les prévisions. Elle est centrée sur le lieu retenu et un toucher ouvre la carte complète. Le logo central dépasse de la barre d’onglets.

Au premier lancement, Tromsø sert de lieu par défaut. La sélection reste vide dans le stockage local jusqu’à une confirmation par « Utiliser ce lieu ». Lors des lancements suivants, le choix enregistré est repris.

Vérifié dans Brave, profil Pixel 10 en portrait (412 × 924). Après une tentative de défilement vertical, les mesures et le paysage sont restés en place. Le lien de la carte depuis le deuxième volet a ouvert la page Leaflet.

## Lot de stabilisation

| Support | Vérification | Résultat |
| --- | --- | --- |
| Brave, serveur de recette local | Accueil, onglets et prévisions | Météo, Aurores et Réglages nommés. Le bouton Prévisions bascule vers les prévisions et propose le retour au direct. |
| Brave, serveur de recette local | Liens directs et retour | Carte et aide contextuelle ouvertes directement. Le bouton Retour de chacune revient sur Aurores. |
| Brave, serveur de recette local | Carte, lieu et météo | Recherche accentuée de Québec, aperçu avant confirmation et lieu retrouvé sur l’accueil après navigation et rechargement. Estimation de 0 % affichée comme une valeur. Météo chargée pour Québec. L’attribution OpenStreetMap et l’action de reprise sont visibles. Certaines tuiles ont signalé une erreur locale. |
| Front local | Outils et dépendances | TypeScript, lint et build web de production réussis avec Ionic 9.0.11. Le bundler signale toujours l’appel à `eval` déjà constaté. |
| Suite native | Android et iOS | La validation de ce lot s’arrête au navigateur pour le moment. Gestes système, GPS natif, mise à jour Play et AAB du nouveau lot restent à qualifier. |

## Résultats constatés

| Support | Vérification | Résultat |
| --- | --- | --- |
| Front local | TypeScript et lint | `npm run typecheck` et `npm run lint` réussis. |
| Front local | Build web de production | Réussi en dossier temporaire. Le bundler signale un appel à `eval` dans un chunk. |
| Brave, Pixel 10 émulé | Accueil Aurores, valeurs et navigation | Affichage de l’accueil et des mesures observé. Deux onglets sans nom dans l’arbre d’accessibilité. Une ouverture directe de la carte revient à Aurores. |
| Émulateur Firebase local | 19 contrôles HTTP | À chaud, 19/19 réussis, dont villes actuelle et historique, agrégat SWPC, OVATION, coordonnées zéro, nowcast, pôles, prévisions, header et validation. Cinq requêtes parallèles ont dépassé 30 s au premier passage. Météo et géocodage vérifiés sur entrées invalides, les réponses avec clé restent à qualifier. |
| Backend local | TypeScript, build et contrat | `tsc --noEmit --incremental false -p tsconfig.build.json` et `npm run docs:check` réussis. Le build isolé contient le point d’entrée et le catalogue. |
| Android, copie locale isolée | Pipeline, bundle et signature | Deux bundles de test générés avec des codes distincts et un certificat de test. Signature et intégrité vérifiées. Le manifeste final porte le package et les versions attendus. Un second build concurrent est refusé par le verrou. |
| Android physique, iOS, Play Console | Gestes natifs, mise à jour, certificat, piste interne | À exécuter avec appareils et accès de publication. |

## Parcours à valider

| Domaine | Actions et résultat attendu |
| --- | --- |
| Démarrage | Installation vierge, mise à jour depuis Play avec données existantes, retour après arrêt forcé, ouverture hors ligne. Le premier écran reste utilisable, les préférences persistent et l’âge des données est lisible. |
| Aurores | Kp courant, vent, densité, Bz/Bt, propagation et chance au zénith. Rafraîchissement manuel, détails des indicateurs, 0 %, valeur nulle, délai et erreur amont. Vérifier FR/EN, unités et arrondis connus. |
| Prévisions | Prochaines heures et Kp 27 jours, vent solaire et cycle solaire, animations OVATION Nord/Sud, légendes, popovers et liens d’aide. Tester données partielles, changement de jour et fuseau, format 12/24 h et réseaux lents. |
| Météo | Ville et pays, météo courante, prévisions horaires et quotidiennes, graphiques, Celsius/Fahrenheit, unités et rafraîchissement. Vérifier cache avec API inaccessible, changement rapide de lieu et tranches DST. |
| Carte | Depuis l’accueil et par lien direct, tuiles et attribution, overlay et légende, zoom/pan, rotation, recherche accentuée/homonymes, résultat vide, GPS précis et approximatif, refus, recentrage, confirmation de lieu. Tester 0°, antéméridien, deux hémisphères, double sélection et erreurs distinctes de tuiles, géocodage et nowcast. |
| Réglages et aide | Langue, mesures, température, format d’heure, À propos, aide, CGU, liens externes et numéro de version natif. Vérifier la persistance en redémarrant et après mise à jour. |
| Navigation | Onglets tactile et clavier, retour depuis carte, aide et à propos, retour matériel et prédictif, overlays et clavier, ouverture de lien et retour d’une application externe. Le bon écran et son défilement sont restaurés. |
| Accessibilité et fluidité | TalkBack, texte agrandi, contrastes sur le fond animé, réduction des mouvements, portrait/paysage, encoches et zones sûres. Mesurer le temps d’accès aux données et la fluidité de la carte avant et après sur un Android modeste. |

Exécuter sur Brave pour les états web, un appareil Android modeste et un Android récent pour les permissions et les gestes, puis sur l’artefact distribué via piste interne. Garder la piste iOS pour le futur build natif. Recueillir par parcours l’appareil et la version, la source API, le résultat et, en cas d’écart, les étapes et une preuve sans données privées. L’étape de diffusion exige la recette des parcours existants et la vérification d’un appareil mis à jour depuis Play.
