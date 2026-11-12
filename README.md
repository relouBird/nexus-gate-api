# Nexus Gate API

Nexus Gate est un backend en cours de développement pour gérer des équipes, des utilisateurs et des serveurs, puis acheminer des requêtes vers ces serveurs. Le dépôt regroupe une API HTTP, des microservices NestJS et un service de forwarding autonome.

> **État du projet :** la configuration NestJS est centralisée dans `@nexus/configuration`; les services Nest partagent les clients Redis et SMTP de `@nexus/redis-cache` et `@nexus/mailer`. Le forwarding reste autonome. Les réserves de déploiement, notamment autour du forwarding et de Prisma, sont listées dans [PROJECT-STATUS.md](./PROJECT-STATUS.md).

## Architecture

| Composant | Rôle observé |
| --- | --- |
| `api-gateway` | API HTTP NestJS, documentation Swagger, authentification et routage des requêtes vers les microservices TCP. |
| `auth-service` | Authentification, équipes, sessions, OTP et notifications par courriel via `@nexus/mailer`. |
| `user-service` | Gestion des utilisateurs et du profil courant; notifications par courriel via `@nexus/mailer`. |
| `configuration-service` | Gestion des serveurs, règles, jetons de gateway et journaux de requêtes; le transport mail partagé est disponible. |
| `forwarding-service` | Serveur autonome basé sur `uWebSockets.js` : résolution du serveur, authentification par jeton, évaluation des règles, proxy et tunnels WebSocket; il n’utilise pas `@nexus/mailer`. |
| Redis | Cache des applications NestJS via `@nexus/redis-cache`; le forwarding conserve son client autonome. Le fichier Docker Compose ne démarre que Redis. |
| MariaDB | Base utilisée par Prisma et son adaptateur MariaDB. Elle doit être fournie séparément. |

Les quatre services NestJS et le service de forwarding ne suivent pas tous le même mode de démarrage. Le forwarding est compilé avec son propre `tsconfig.json` et ne figure pas comme projet dans [nest-cli.json](./nest-cli.json).

## Structure

```text
apps/
  api-gateway/
  auth-service/
  user-service/
  configuration-service/
  forwarding-service/
docker-compose.yaml
package.json
```

Les applications NestJS partagent le schéma et les migrations Prisma de `libs/database`. Le forwarding reste autonome et conserve son propre `apps/forwarding-service/prisma/schema.prisma`; son intégration à la librairie partagée n’est pas encore reproductible depuis un clone propre.

## Prérequis

- Node.js et npm compatibles avec les versions des dépendances déclarées dans [package.json](./package.json).
- MariaDB accessible depuis les services qui utilisent Prisma.
- Docker Desktop si Redis est lancé avec Docker Compose.

Le NestJS CLI est installé comme dépendance du projet; une installation globale n’est pas nécessaire.

## Installation

Depuis la racine du dépôt :

```bash
npm ci
```

Créer le fichier commun d’environnement à partir du modèle :

```powershell
if (-not (Test-Path .env.global)) { Copy-Item .env.global.example .env.global }
```

Modifier `.env.global` et remplacer les valeurs d’exemple, notamment les identifiants MariaDB, les paramètres `SHARED_SMTP_*` et `SHARED_JWT_SECRET`. Ne pas recopier le modèle par-dessus un fichier existant : les fichiers d’environnement contiennent des secrets et sont ignorés par Git. En développement, la configuration charge `.env.global` (ou `.env` si ce fichier n’existe pas); pour les tests, elle sélectionne `.env.global.test` ou `.env.test`; en production, `.env.global.production`, `.env.prod` ou `.env.production`. La première option existante de chaque liste est choisie. `APP_ENV`, fourni au processus de l’extérieur du fichier chargé, prend priorité sur `NODE_ENV` pour le choix du mode. `.env.global.example` est un modèle, jamais chargé automatiquement. Les chemins sont résolus depuis la racine du dépôt (`process.cwd()`); lancer les commandes npm depuis cette racine.

La librairie NestJS `@nexus/configuration` fournit `ConfigurationModule.forRoot('<service>')` et `ServiceConfiguration`. Elle ne permet à chaque service Nest d’accéder qu’aux clés de son propre préfixe et aux clés partagées `SHARED_*`. Le service de forwarding reste indépendant de NestJS et applique séparément la même sélection de fichier.

Les librairies `@nexus/redis-cache` et `@nexus/mailer` sont enregistrées par les applications Nest et utilisent le `ServiceConfiguration` fourni par `@nexus/configuration`. Le client Redis ne lit que `SHARED_REDIS_*`; le transport SMTP ne lit que `SHARED_SMTP_*`. Les notifications et templates propres à auth et user restent dans leurs applications, sous `src/mail/notifications`; seul le transport Nodemailer est partagé. Le service configuration dispose du transport, sans nouveau flux de notification métier. Le forwarding garde ses implémentations indépendantes.

Cette séparation est logique dans le code, pas une frontière de sécurité entre processus : tous les processus ayant accès au même fichier d’environnement peuvent lire les secrets qu’il contient. En production, injecter à chaque processus uniquement les secrets dont il a besoin.

## Redis et base de données

Démarrer Redis :

```bash
docker compose up -d
```

Arrêter Redis :

```bash
docker compose down
```

`docker-compose.yaml` ne fournit ni MariaDB ni la base de données du projet. Configurer `SHARED_SERVICE_DATABASE_*` dans le fichier d’environnement actif pour les services NestJS, ou adapter ces valeurs à votre installation. Ne pas lancer une commande de réinitialisation ou de migration sur une base contenant des données à conserver sans avoir d’abord vérifié son historique.

## Prisma

Les services NestJS utilisent le schéma centralisé de `libs/database` :

```bash
npm run db:services:generate
npm run db:services:format
npm run db:services:migrate
npm run db:services:studio
```

`npm run build` génère d’abord le client Prisma partagé puis compile la librairie. Les commandes `db:services:reset` réinitialisent la base partagée et peuvent supprimer ses données. Les commandes `db:forwarding:*` restent séparées.

Le client Prisma partagé est généré dans `libs/database/src/generated`, dossier ignoré par Git. Il est régénéré par le build; après une modification manuelle du schéma, il peut aussi être généré avec `npm run db:services:generate`. L’import utilisé par le forwarding dépend encore d’un package local non versionné; voir [PROJECT-STATUS.md](./PROJECT-STATUS.md).

## Démarrage et scripts utiles

Scripts de développement déclarés dans `package.json` :

```bash
npm run start:gateway
npm run start:auth-service
npm run start:user-service
npm run start:configuration-service
npm run start:forwarding-service
```

Chaque processus se lance séparément. Les scripts ne garantissent pas à eux seuls une configuration fonctionnelle : vérifier les variables d’environnement et les réserves de démarrage avant de les lancer.

Autres commandes :

```bash
npm run build
npm test
npm run test:e2e
npm run test:cov
```

`npm run build` génère le client partagé, compile les librairies de configuration, Redis, base de données et mail, puis les quatre applications NestJS. Le service de forwarding reste volontairement indépendant : il n’est pas inclus dans ce build et se compile avec `npx tsc -p apps/forwarding-service/tsconfig.json`. Son build peut nécessiter le package Prisma local décrit dans [PROJECT-STATUS.md](./PROJECT-STATUS.md). Le script `test:e2e` utilise la configuration du gateway uniquement.

## API

La gateway applique le préfixe global `/api` et configure Swagger à l’adresse prévue `/api/docs`. Les contrôleurs exposent notamment des routes d’authentification, de gestion des équipes et utilisateurs, ainsi que de configuration des serveurs, règles, jetons et journaux. Le port HTTP effectivement utilisé dépend toutefois de la configuration actuelle de `apps/api-gateway/src/main.ts`; voir les points à corriger dans [PROJECT-STATUS.md](./PROJECT-STATUS.md).

## Documentation complémentaire

- [READCOMMAND.md](./READCOMMAND.md) — aide-mémoire des commandes présentes dans `package.json`.
- [PROJECT-STATUS.md](./PROJECT-STATUS.md) — constats vérifiés et réserves techniques restantes.
