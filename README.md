# Nexus Gate API

Nexus Gate est un backend en cours de développement pour gérer des équipes, des utilisateurs et des serveurs, puis acheminer des requêtes vers ces serveurs. Le dépôt regroupe une API HTTP, des microservices NestJS et un service de forwarding autonome.

> **État du projet :** la configuration NestJS est centralisée dans la librairie `@nexus/configuration` et les services lisent un fichier commun `.env.global`. Les réserves de déploiement restantes, notamment autour du forwarding et de Prisma, sont listées dans [PROJECT-STATUS.md](./PROJECT-STATUS.md).

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

Créer le fichier commun d’environnement à partir du modèle :

```powershell
if (-not (Test-Path .env.global)) { Copy-Item .env.global.example .env.global }
```

Modifier `.env.global` et remplacer les valeurs d’exemple, notamment les identifiants MariaDB et `SHARED_JWT_SECRET`. Ne pas recopier le modèle par-dessus un fichier existant : `.env.global` contient les secrets locaux et est ignoré par Git. Sa configuration est lue depuis la racine du dépôt (`process.cwd()`); lancer les commandes npm depuis cette racine. Dans le clone de travail actuel, les réglages des cinq anciens fichiers `apps/*/.env` ont été transférés dans `.env.global`; ils ne sont pas inclus dans le dépôt. Sur un nouveau clone, créer le fichier à partir du modèle.

La librairie NestJS `@nexus/configuration` fournit `ConfigurationModule.forRoot('<service>')` et `ServiceConfiguration`. Elle ne permet à chaque service Nest d’accéder qu’aux clés de son propre préfixe et aux clés partagées `SHARED_*`. Le service de forwarding reste indépendant de NestJS et lit directement le même fichier avec `dotenv`.

Cette séparation est logique dans le code, pas une frontière de sécurité entre processus : tous les processus ayant accès au même `.env.global` peuvent lire les secrets qu’il contient. En production, injecter à chaque processus uniquement les secrets dont il a besoin.

## Redis et base de données

Démarrer Redis :

```bash
docker compose up -d
```

Arrêter Redis :

```bash
docker compose down
```

`docker-compose.yaml` ne fournit ni MariaDB ni les bases de données du projet. Créer/configurer séparément les quatre bases dont les URL sont illustrées dans `.env.global.example`, ou adapter ces URL à votre installation. Ne pas lancer une commande de réinitialisation Prisma sur une base contenant des données à conserver.

## Prisma

Exemple de commandes Prisma pour `auth-service` :

```bash
npm run db:auth:generate
npm run db:auth:format
npm run db:auth:migrate
npm run db:auth:studio
```

Les mêmes familles de scripts existent pour `user`, `configuration` et `forwarding`. Les commandes `db:<service>:reset` réinitialisent la base concernée et peuvent supprimer ses données.

Les clients Prisma sont générés dans les dossiers `src/generated` des services, lesquels sont ignorés par Git. Il faut donc générer le client après l’installation et après toute modification de schéma. L’import du client utilisé par le forwarding n’est pas encore reproductible depuis un clone propre; détails et précautions dans [PROJECT-STATUS.md](./PROJECT-STATUS.md).

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
- [PROJECT-STATUS.md](./PROJECT-STATUS.md) — constats vérifiés et réserves techniques restantes.
