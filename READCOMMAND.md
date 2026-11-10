# Aide-mémoire des commandes

Les scripts ci-dessous sont définis dans [package.json](./package.json). Pour l’architecture, la configuration et les réserves de démarrage, voir le [README](./README.md) et [PROJECT-STATUS.md](./PROJECT-STATUS.md).

## Installation

```bash
npm ci
```

## Redis

```bash
docker compose up -d
docker compose down
```

Le compose ne démarre que Redis; MariaDB doit être configurée séparément.

## Services en développement

Lancer chaque service dans un terminal séparé :

```bash
npm run start:gateway
npm run start:auth-service
npm run start:user-service
npm run start:configuration-service
npm run start:forwarding-service
```

Le script du forwarding compile le projet TypeScript puis lance le résultat avec Nodemon. Son import de `@nexus/database` ne fonctionne dans ce clone que grâce à une jonction locale ignorée par Git; un clone propre ne la recrée pas. Voir les réserves du projet.

## Base de données Prisma

Les scripts existent pour `auth`, `user`, `configuration` et `forwarding` :

```bash
npm run db:<service>:generate
npm run db:<service>:format
npm run db:<service>:migrate
npm run db:<service>:studio
```

Exemple :

```bash
npm run db:auth:generate
npm run db:auth:format
npm run db:auth:migrate
npm run db:auth:studio
```

Chaque service doit avoir son fichier `.env` local. Les commandes Prisma utilisent `DATABASE_URL`; les connexions applicatives NestJS lisent aussi `DATABASE_HOST`, `DATABASE_NAME`, `DATABASE_USER` et `DATABASE_PASSWORD`.

> **Attention :** `npm run db:<service>:reset` lance `prisma migrate reset` et peut supprimer les données de la base ciblée. Le script `db:forwarding:generate-copy` pointe vers un fichier `apps/forwarding-service/prisma.copy.ts` absent du dépôt.

## Build et tests

```bash
npm run build
npm test
npm run test:e2e
npm run test:cov
```

La commande `test:e2e` est configurée pour `api-gateway`.
