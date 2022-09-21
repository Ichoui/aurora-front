### ionic build 
```
// arguments
--prod
```
pour builder le côté applicatif dans le dossier /www
### npx cap add android 
Créer le dossier natif Android (android\app\src\main\assets\public), avec pour base le dossier compilé /www


### ionic cap sync
```
// arguments  
--prod pour effectuer un build prod
--watch pour recompiler à chaque fois le dossier /www
--source-map source maps en sortie pour debug
```

Va créer le dossier /www et 
- Joue la commande ionic build (qui va compiler les web assets)
- Copie les assets vers un dossier natif Capacitor (Android / iOS)
- Update Android / iOS et les dépendances
- Installe les nouveaux plugins Capacitor / Cordova




