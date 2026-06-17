### le fichier READNOTE de mon projet tutoré SIGL 2025/2026


### commander pour supprimer eslint de son projet
npm uninstall @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier eslint-plugin-prettier



### installer nestjs dans le dossier backend global et le cli (facultatif mais recommande)
npm install -g @nestjs/cli --save-dev  

### initiaiser git dans le dossier global de l'application qui contient backend, frontend, ...

### creer le workspace nest dans le dossier backend
nest new . " . pour creer le projet dans le dossier actuel"

### Transformer en monorepo NestJS, Nest possède un support natif du monorepo.
nest generate app api-gateway / nest g app api-gateway
nest g app auth-service
Chaque app devient un microservice indépendant.

###  installe le paquet officiel de NestJS permettant de créer et de connecter des 
### architectures de microservices
npm install @nestjs/microservices

### installer le paquet officiel de NestJS pour gérer les variables d'environnement 
### et la configuration de votre application .env .dotenv
npm install @nestjs/config

### lancer un microservice
npm run start api-gateway
npm run start auth-service
...

### migration meme service
npx prisma migrate dev \
--schema=apps/meme-service/prisma/schema.prisma
### npm run db:auth:migrate avec l'automatisation de la migration pour le service auth-service

### generer les clients prisma pour chaque service
npx prisma generate \
--schema=apps/auth-service/prisma/schema.prisma

### commande pour supprimer eslint definitivement de son projet
npm uninstall eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier eslint-plugin-prettier --save-dev


### placer le script de swagger dans le fichier main.ts de l'api gateway
http://localhost:3000/api/

### installer jwt pour l'authentification
$ npm install --save @nestjs/jwt

### installer passport
$ npm install --save @nestjs/passport passport passport-local
npm install @nestjs/passport  passport passport-local bcrypt passport-jwt



### installer swagger
npm install --save @nestjs/swagger

### installer nestjs
npm i -g @nestjs/cli

### creer app nest
nest new app-name

### creer module
nest g mo nom-module

### installer prisma
npm install prisma --save-dev
npx prisma init
npm install @prisma/client
npx prisma

### migrer son schema vers la base de donnees
npx prisma generate
nox prisma studio
npx prisma format
npx prisma migrate dev --name init

### class validator
npm install class-validator class-transformer

### installer l'adaptateur mariadb
npm install --save-dev @prisma/adapter-mariadb

### paquets pour gerer la config typescript de prisma
npm install @prisma/config dotenv --save-dev

### installer nestjs axios
npm install @nestjs/axios axios
