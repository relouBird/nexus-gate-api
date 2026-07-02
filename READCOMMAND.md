# COMMAND LIST

## Présentation

**Nexus Gate API** est une architecture backend basée sur **NestJS Microservices**.

Le projet est composé de plusieurs services indépendants qui communiquent entre eux via le système de microservices NestJS.

---

# Architecture des services

| Service           | Description                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| `api-gateway`     | Point d'entrée principal de l'application. Toutes les requêtes HTTP transitent par ce service. |
| `auth-service`    | Gestion de l'authentification, des utilisateurs, des équipes, des sessions et des OTP.         |
| `network-service` | Gestion des serveurs enregistrés et de leur configuration réseau.                              |
| `forward-service` | Gestion du transfert des ressources et des communications entre services.                      |
| `redis`           | Cache partagé utilisé par les microservices.                                                   |

---

# Prérequis

Avant de démarrer le projet, assurez-vous d'avoir installé :

- Node.js 22+
- Docker Desktop
- MariaDB / MySQL
- NestJS CLI

Vérification :

```bash
node -v
npm -v
docker -v
nest --version
```

---

# Installation des dépendances

À la racine du projet :

```bash
npm install
```

---

# Génération du client Prisma

Service Auth :

```bash
npm run db:auth:generate
```

---

# Migrations Prisma

Créer ou appliquer les migrations :

```bash
npm run db:auth:migrate
```

Réinitialiser la base de données :

```bash
npm run db:auth:reset
```

Ouvrir Prisma Studio :

```bash
npm run db:auth:studio
```

---

# Démarrage de Redis

Le cache Redis est obligatoire pour certaines fonctionnalités du projet.

## Démarrer Redis avec Docker

Depuis la racine du projet :

```bash
docker compose up -d
```

Vérifier que Redis est bien démarré :

```bash
docker ps
```

Vous devriez obtenir quelque chose de similaire :

```text
nexus-redis
0.0.0.0:6379->6379/tcp
```

Tester Redis :

```bash
docker exec -it nexus-redis redis-cli ping
```

Résultat attendu :

```text
PONG
```

---

## Arret de Redis

Depuis la racine du projet :

```bash
docker compose down
```

---

# Variables d'environnement

Chaque microservice possède son propre fichier `.env`.

Exemple :

## api-gateway/.env

```env
PORT=9002
AUTH_SERVICE_PORT=9003
```

## auth-service/.env

```env
DATABASE_URL=mysql://root@localhost:3306/nexus_gate_database

DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=nexus_gate_database
DATABASE_USER=root
DATABASE_PASSWORD=

PORT=9003

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

---

# Démarrage des services

## 1. Démarrer le Gateway

Ouvrir un terminal :

```bash
npm run start:gateway
```

Le service sera accessible sur :

```text
http://localhost:9002
```

---

## 2. Démarrer le Service d'Authentification

Ouvrir un second terminal :

```bash
npm run start:auth-service
```

Le microservice démarrera sur :

```text
localhost:9003
```

---

# Démarrage manuel

Il est également possible d'utiliser les commandes NestJS standards :

```bash
nest start --watch api-gateway
```

```bash
nest start --watch auth-service
```

---

# Build de production

Compiler tous les services :

```bash
npm run build
```

---

# Lancement en production

```bash
npm run start:prod
```

---

# Tests

Exécuter tous les tests :

```bash
npm test
```

Mode watch :

```bash
npm run test:watch
```

Coverage :

```bash
npm run test:cov
```

Tests End-to-End :

```bash
npm run test:e2e
```

---

# Ordre de démarrage recommandé

Toujours démarrer les services dans l'ordre suivant :

1. MariaDB / MySQL
2. Redis
3. Auth Service
4. Network Service
5. Forward Service
6. API Gateway

---

# Vérification du fonctionnement

Une fois tous les services démarrés :

```bash
GET http://localhost:9002/api
```

ou toute autre route exposée par le Gateway.

Le Gateway se chargera automatiquement de communiquer avec les microservices concernés.
