# Nexus Gate API

Nexus Gate est un backend en cours de développement pour gérer des équipes, des utilisateurs et des serveurs, puis acheminer des requêtes vers ces serveurs. Le dépôt regroupe une API HTTP, des microservices NestJS et un service de forwarding autonome.

> **État du projet :** la documentation décrit l’état du code présent dans ce dépôt. La configuration de démarrage et le package de base de données doivent encore être consolidés avant de considérer le projet prêt pour un lancement reproductible. Voir [PROJECT-STATUS.md](./PROJECT-STATUS.md).

## Architecture

| Composant | Rôle observé |
| --- | --- |
| `api-gateway` | API HTTP NestJS, documentation Swagger, authentification et routage des requêtes vers les microservices TCP. |
| `auth-service` | Authentification, équipes, sessions, OTP et notifications par courriel. |
| `user-service` | Gestion des utilisateurs et du profil courant. |
| `configuration-service` | Gestion des serveurs, règles, jetons de gateway et journaux de requêtes. |
| `forwarding-service` | Serveur autonome basé sur `uWebSockets.js` : résolution du serveur, authentification par jeton, évaluation des règles, proxy et tunnels WebSocket. |
| Redis | Cache utilisé par certains composants. Le fichier Docker Compose ne démarre que Redis. |
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

Chaque service de données contient actuellement son propre schéma Prisma et son répertoire de migrations. Les quatre schémas suivis dans Git sont identiques; cela ne signifie pas que leurs historiques de migration ou leurs bases sont synchronisés.

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

Créer les fichiers `.env` locaux attendus par les services sous `apps/<service>/.env`. Ils ne sont pas suivis par Git. Les services Prisma utilisent `DATABASE_HOST`, `DATABASE_NAME`, `DATABASE_USER` et `DATABASE_PASSWORD` à l’exécution; les commandes Prisma lisent également `DATABASE_URL`. Configurer aussi les ports des services, les variables Redis et les paramètres de courriel selon les composants utilisés.

> La configuration actuelle des ports n’est pas cohérente entre la gateway et les microservices. Consulter [PROJECT-STATUS.md](./PROJECT-STATUS.md) avant de tenter un démarrage complet.

## Redis et base de données

Démarrer Redis :

```bash
docker compose up -d
```

Arrêter Redis :

```bash
docker compose down
```

`docker-compose.yaml` ne fournit ni MariaDB ni les bases de données du projet. Les bases doivent être créées/configurées séparément. Ne pas lancer une commande de réinitialisation Prisma sur une base contenant des données à conserver.

## Prisma

Exemple de commandes Prisma pour `auth-service` :

```bash
npm run db:auth:generate
npm run db:auth:format
npm run db:auth:migrate
npm run db:auth:studio
```

Les mêmes familles de scripts existent pour `user`, `configuration` et `forwarding`. Les commandes `db:<service>:reset` réinitialisent la base concernée et peuvent supprimer ses données.

Les clients Prisma sont générés dans les dossiers `src/generated` des services, lesquels sont ignorés par Git. Il faut donc générer le client après l’installation et après toute modification de schéma. L’intégration du client centralisé attendu par le forwarding n’est pas encore présente dans les fichiers versionnés; détails et précautions dans [PROJECT-STATUS.md](./PROJECT-STATUS.md).

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

Le script `test:e2e` utilise la configuration du gateway uniquement.

## API

La gateway applique le préfixe global `/api` et configure Swagger à l’adresse prévue `/api/docs`. Les contrôleurs exposent notamment des routes d’authentification, de gestion des équipes et utilisateurs, ainsi que de configuration des serveurs, règles, jetons et journaux. Le port HTTP effectivement utilisé dépend toutefois de la configuration actuelle de `apps/api-gateway/src/main.ts`; voir les points à corriger dans [PROJECT-STATUS.md](./PROJECT-STATUS.md).

## Documentation complémentaire

- [READCOMMAND.md](./READCOMMAND.md) — aide-mémoire des commandes présentes dans `package.json`.
- [READNOTE.md](./READNOTE.md) — origine des notes de travail et état du projet de package de base de données.
- [PROJECT-STATUS.md](./PROJECT-STATUS.md) — constats vérifiés, limites et décisions restant à prendre.
