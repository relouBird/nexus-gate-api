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

La librairie `@nexus/configuration` charge `.env.global` pour les services NestJS et leur fournit les variables de leur namespace (`API_GATEWAY_*`, `AUTH_SERVICE_*`, `USER_SERVICE_*` ou `CONFIGURATION_SERVICE_*`) ainsi que les variables partagées `SHARED_*`. Le service de forwarding reste en Node.js autonome et lit le même fichier avec `dotenv`, sans dépendre de Nest.

## Génération d’une librairie NestJS

Le Nest CLI est local au projet. Pour générer une nouvelle librairie depuis un terminal interactif :

```powershell
npx nest g library <nom>
```

Choisir le préfixe `@nexus` lorsque le CLI le demande. Les commandes de build correspondantes sont `npx nest build <nom-du-projet>`.

## Base de données Prisma

Remplacer `<service>` par `auth`, `user`, `configuration` ou `forwarding` :

```powershell
npm run db:<service>:generate
npm run db:<service>:format
npm run db:<service>:migrate
npm run db:<service>:studio
```

Exemple :

```powershell
npm run db:auth:generate
npm run db:auth:format
npm run db:auth:migrate
npm run db:auth:studio
```

Les scripts Prisma utilisent `<SERVICE>_DATABASE_URL` dans `.env.global`; les connexions applicatives NestJS utilisent les clés de base de données du même namespace. Les commandes `db:<service>:reset` peuvent supprimer les données de la base ciblée. Le script `db:forwarding:generate-copy` référence toujours `apps/forwarding-service/prisma.copy.ts`, absent du dépôt.

## Build et tests

```powershell
npm run build
npx nest build configuration
npx jest libs/configuration/src/configuration.service.spec.ts --runInBand
npm test
npm run test:e2e
```

`npm run build` compile le projet NestJS par défaut (la gateway); compiler explicitement les autres apps avec `npx nest build <nom>`. `test:e2e` ne couvre que l’API gateway.
