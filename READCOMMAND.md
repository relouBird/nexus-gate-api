# Aide-mémoire des commandes

Toutes les commandes npm s’exécutent depuis la racine du dépôt. Voir le [README](./README.md) et [PROJECT-STATUS.md](./PROJECT-STATUS.md) pour l’architecture et les limites connues.

## Installation et environnement

```powershell
npm ci
if (-not (Test-Path .env.global)) { Copy-Item .env.global.example .env.global }
```

Modifier le fichier d’environnement correspondant au mode avec les ports, les accès MariaDB, Redis, SMTP et un secret JWT fort. En développement, `@nexus/configuration` charge `.env.global` (ou `.env`); en test, `.env.global.test` ou `.env.test`; en production, `.env.global.production`, `.env.prod` ou `.env.production`. La première option présente est choisie. `APP_ENV`, fourni au processus en dehors du fichier chargé, prime sur `NODE_ENV`. Tous ces fichiers réels sont ignorés par Git; ne jamais y mettre de secret dans un commit. `.env.global.example` sert de modèle, n’est pas chargé automatiquement, et ne doit pas être recopié par-dessus un fichier existant.

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

La librairie `@nexus/configuration` choisit le fichier selon l’environnement et fournit aux services Nest leurs variables de namespace (`API_GATEWAY_*`, `AUTH_SERVICE_*`, `USER_SERVICE_*` ou `CONFIGURATION_SERVICE_*`) ainsi que les clés `SHARED_*`. `@nexus/redis-cache` ne lit que les paramètres partagés Redis; `@nexus/mailer` ne lit que `SHARED_SMTP_*`. Les notifications et templates auth/user demeurent propres à chaque service dans `src/mail/notifications`. Le service de forwarding reste en Node.js autonome et applique séparément la même sélection de fichier, sans dépendre des librairies Nest.

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

`npm run build` compile séquentiellement les librairies `configuration`, `redis-cache`, `database` et `mailer`, puis les quatre applications NestJS, avec leurs sorties sous `dist/libs` et `dist/apps`. Il lance `prisma generate` avant le build Database. Le forwarding reste hors de cette commande et utilise son `tsconfig` autonome; son build peut nécessiter le package Prisma local décrit dans [PROJECT-STATUS.md](./PROJECT-STATUS.md). Pour compiler une seule application ou librairie Nest, utiliser `npx nest build <nom>`; `test:e2e` ne couvre que l’API gateway.
