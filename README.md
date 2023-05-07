# Projet 6

Servveur Node.JS d'API REST pour le site "Piquante".

## Comment faire fonctionner le projet ?

Ce projet nécessite un fichier configuration disponible par défaut sous le nom de `example.config.json`, veuillez copier ce fichier en 2 exemplaires :
- `dev.config.json` correspondant à la configuration de développement de l'api.
- `config.json` correspondant à la configuration de production de l'api.

Ce projet dépend de packages nodes, il nécessite donc l'installation d'un gestionnaire de paquets tel que `npm` ou `yarn`, une fois l'un d'eux installé vous devez suivres ces instructions en fonction de votre gestionnaire.

##### Npm :
```
npm install

npm run dev # pour lancer avec la configuration dev.config.json
npm run start # pour lancer avec la configuration config.json
```
##### Yarn :
```
yarn install

yarn run dev # pour lancer avec la configuration dev.config.json
yarn run start # pour lancer avec la configuration config.json
```