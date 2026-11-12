# Aide-mémoire des commandes

Toutes les commandes npm s’exécutent depuis la racine du dépôt. Voir le [README](./README.md) et [PROJECT-STATUS.md](./PROJECT-STATUS.md) pour l’architecture et les limites connues.

## Installation et environnement

```powershell
npm ci
if (-not (Test-Path .env.global)) { Copy-Item .env.global.example .env.global }
```

Modifier `.env.global` avec les ports, les accès MariaDB, Redis, SMTP et un secret JWT fort. Ne pas recopier le modèle par-dessus un fichier existant. `.env.global` est ignoré par Git; ne jamais y mettre de secret dans un commit. Les cinq fichiers locaux `apps/*/.env` ont été supprimés après migration de leurs réglages dans le `.env.global` local de ce clone. Un nouveau clone doit créer son propre fichier à partir du modèle.

## Redis

```powershell
docker compose up -d
docker compose down
```

Le fichier Compose démarre Redis, pas MariaDB.

## Services en développement

Ouvrir un terminal par processus :

```powershell
npm run start:gateway
npm run start:auth-service
npm run start:user-service
npm run start:configuration-service
npm run start:forwarding-service
```

La librairie `@nexus/configuration` charge `.env.global` pour les services NestJS et leur fournit les variables de leur namespace (`API_GATEWAY_*`, `AUTH_SERVICE_*`, `USER_SERVICE_*` ou `CONFIGURATION_SERVICE_*`) ainsi que les variables partagées `SHARED_*`. `@nexus/redis-cache` réutilise `ServiceConfiguration` et ne lit que les paramètres partagés Redis. Le service de forwarding reste en Node.js autonome et lit le même fichier avec `dotenv`, sans dépendre des librairies Nest.

## Génération d’une librairie NestJS

Le Nest CLI est local au projet. Pour générer une nouvelle librairie depuis un terminal interactif :

```powershell
npx nest g library <nom>
```

Choisir le préfixe `@nexus` lorsque le CLI le demande. Les commandes de build correspondantes sont `npx nest build <nom-du-projet>`.

## Base de données Prisma

Base partagée des applications NestJS :

```powershell
npm run db:services:generate
npm run db:services:format
npm run db:services:migrate
npm run db:services:studio
```

Commandes séparées pour la base du forwarding :

```powershell
npm run db:forwarding:generate
npm run db:forwarding:format
npm run db:forwarding:migrate
npm run db:forwarding:studio
```

Les services NestJS utilisent `SHARED_SERVICE_DATABASE_*` et `libs/database/prisma/schema.prisma`. Le build de la librairie Database régénère le client Prisma ignoré par Git. `db:services:reset` et `db:forwarding:reset` sont destructives; vérifier les bases ciblées avant de les lancer. Le script `db:forwarding:generate-copy` référence `apps/forwarding-service/prisma.copy.ts`, absent du dépôt.

## Build et tests

```powershell
npm run build
npx tsc -p apps/forwarding-service/tsconfig.json
npx nest build configuration
npx jest libs/configuration/src/configuration.service.spec.ts --runInBand
npm test
npm run test:e2e
```

`npm run build` compile séquentiellement les librairies `configuration`, `redis-cache` et `database`, puis les quatre applications NestJS, avec leurs sorties sous `dist/libs` et `dist/apps`. Il lance `prisma generate` avant le build Database. Le forwarding reste hors de cette commande et utilise son `tsconfig` autonome; son build peut nécessiter le package Prisma local décrit dans [PROJECT-STATUS.md](./PROJECT-STATUS.md). Pour compiler une seule application ou librairie Nest, utiliser `npx nest build <nom>`; `test:e2e` ne couvre que l’API gateway.
