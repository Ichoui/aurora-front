# Aurorapp

Application mobile Ionic/Angular et Capacitor pour observer les aurores boréales. Android est disponible aujourd'hui ; une version Apple est prévue. Le backend NestJS/Firebase se trouve dans [`../aurora-back`](../aurora-back/README.md) et fournit la même API aux deux plateformes.

## Installation initiale

Utilisez Node.js 22.22.3 (`.nvmrc`) et installez les dépendances dans les deux dépôts :

```sh
nvm install
npm ci
npm --prefix ../aurora-back ci
```

Le backend charge son catalogue de villes depuis un fichier inclus dans la fonction Firebase : aucune base de données locale n'est nécessaire. Dans ce dépôt, créez `src/environments/keep.ts` et exportez `OPENWHEATHER_API_KEY` avec votre clé OpenWeather. Ce fichier est local et ignoré par Git. Ces préparatifs ne sont nécessaires qu'une fois ; voir le [README backend](../aurora-back/README.md) pour l'émulateur.

## Développement local

Depuis `aurora-front`, ouvrez trois terminaux et lancez une commande dans chacun, dans cet ordre :

```sh
npm run dev:back:watch   # Terminal 1 : compilation continue de l'API
npm run dev:back         # Terminal 2 : émulateur Firebase Functions
npm run dev:front        # Terminal 3 : application Angular
```

Attendez la première compilation du terminal 1 avant de lancer le terminal 2. Ouvrez ensuite l'adresse locale affichée par Angular, généralement `http://localhost:4200`. Le client de développement appelle déjà l'émulateur Firebase sur `127.0.0.1:5001` ; les changements du backend sont recompilés et rechargés automatiquement. `Ctrl+C` arrête chaque processus.

`start:front` reste disponible pour lancer uniquement Angular. `start:back` conserve son démarrage ponctuel du backend avec compilation. La version Android native se lance séparément depuis Android Studio après synchronisation Capacitor ; ce workflow sert au développement web local.

## Sources des données

- [NOAA Space Weather Prediction Center](https://www.swpc.noaa.gov/) pour les prévisions spatiales.
- [OpenWeather](https://openweathermap.org/api) pour la météo.

Merci aux auteurs des autres contenus et illustrations présents dans l'application.
