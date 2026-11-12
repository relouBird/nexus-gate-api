# État du projet et réserves techniques

## Configuration centralisée

- La librairie NestJS `@nexus/configuration` se trouve dans `libs/configuration`. Les quatre applications NestJS la chargent avec `ConfigurationModule.forRoot('<application>')` et utilisent `ServiceConfiguration`.
- La librairie NestJS `@nexus/redis-cache` centralise le client Redis partagé des quatre applications NestJS. Elle injecte `ServiceConfiguration` et n’accède qu’aux méthodes `getShared*` (`SHARED_REDIS_*`); elle ne dépend donc pas des clés namespacées de l’application importatrice.
- La librairie NestJS `@nexus/mailer` centralise le transport SMTP des services Nest. Elle lit uniquement `SHARED_SMTP_*`; les notifications et templates personnalisés restent dans auth et user sous `src/mail/notifications`. Configuration-service importe le transport, sans notification métier actuellement définie. Forwarding reste indépendant.
- `ServiceConfiguration` ne retourne que les clés préfixées pour l’application enregistrée, plus les clés partagées demandées explicitement via `getShared`. `ConfigService` n’est pas exporté comme service global.
- Les noms de services sont `api-gateway`, `auth-service`, `user-service` et `configuration-service`; leurs clés commencent respectivement par `API_GATEWAY_`, `AUTH_SERVICE_`, `USER_SERVICE_` et `CONFIGURATION_SERVICE_`.
- Les fichiers locaux des services ont été centralisés. Le fichier global réel est ignoré par Git et ne sera pas fourni dans un nouveau clone; les configurations Prisma sélectionnent un fichier selon `APP_ENV` (prioritaire) ou `NODE_ENV`: `.env.global`/`.env` en développement, `.env.global.test`/`.env.test` en test, `.env.global.production`/`.env.prod`/`.env.production` en production. Le forwarding reste autonome et utilise le même choix de fichier.
- `.env.global.example` est un modèle sans secret réel. Copier vers `.env.global`, modifier les valeurs localement et ne jamais versionner le fichier réel; `.gitignore` exclut les fichiers globaux réels et leur variante test.
- Dans ce clone uniquement, un nouveau secret JWT aléatoire a été créé dans `.env.global`, car les anciens fichiers ne définissaient pas de secret. Le configurer de façon identique dans les processus qui signent et valident les JWT; les sessions signées avec l’ancienne valeur codée en dur ne sont plus valides.
- La séparation entre variables est une convention de code, pas une frontière de sécurité système. Un processus qui a accès à l’environnement complet ou au fichier `.env.global` peut lire les valeurs qu’il contient. En production, fournir à chaque processus ses secrets nécessaires séparément.
- Le secret JWT codé en dur a été retiré du code. Définir un nouveau `SHARED_JWT_SECRET` fort et identique dans la gateway et les services qui signent/valident les JWT. Les jetons existants signés avec l’ancienne valeur ne seront plus valides.
- Les services Nest démarrent maintenant aux ports par défaut distincts documentés dans le fichier d’exemple. Les valeurs sont configurables dans le namespace de chaque service.

## Limites de déploiement toujours présentes

- `@nexus/database` centralise le client NestJS, son schéma Prisma et ses migrations dans `libs/database`. Le client généré dans `libs/database/src/generated` est ignoré par Git; `npm run build:lib:database` le régénère avant d’émettre `dist/libs/database/index.js`.
- Les anciennes migrations Prisma par service Nest ont été retirées et remplacées par une migration initiale partagée. Ne pas lancer `db:services:migrate` ou `db:services:reset` sur une base existante avant d’avoir audité son contenu et établi la stratégie de baseline; la migration initiale tente de créer les tables du schéma partagé.
- Le forwarding reste hors de cette librairie NestJS, mais son `PrismaService` importe toujours `@nexus/database/prisma-client`. Le dépôt ne fournit pas encore un package/workspace Node résolvable proprement pour ce sous-chemin depuis un clone neuf; sa génération et son build restent donc indépendants et non reproductibles.
- Le script `db:forwarding:generate-copy` pointe vers `apps/forwarding-service/prisma.copy.ts`, qui n’existe pas.
- Le forwarding conserve son schéma et sa configuration Prisma propres, alors que les applications Nest utilisent `libs/database`. Vérifier que les URL utilisées par sa commande de migration et par son `PrismaService` désignent bien la même base avant toute migration.
- Le forwarding conserve sa propre implémentation Redis, hors des librairies NestJS, comme convenu. Il lit lui aussi `SHARED_REDIS_*` directement depuis l’environnement après chargement du fichier actif.
- Docker Compose démarre seulement Redis. MariaDB et les bases nommées dans `.env.global.example` doivent être fournies séparément.
- Les valeurs d’environnement du fichier sont lues depuis la racine du dépôt (`process.cwd()`). Lancer les scripts npm et Prisma depuis cette racine.
- Le chargement depuis le fichier correspondant au mode ne remplace pas les variables déjà fournies par le système; les variables d’environnement du déploiement ont priorité.

## Validation

`npm run build` génère le client Prisma, compile les quatre librairies puis les quatre applications NestJS. La sortie de la librairie Database est `dist/libs/database/index.js`; son projet Nest est enregistré sous le nom `database`. Pour compiler un seul projet NestJS :

```powershell
npx nest build <nom-du-projet>
```

Le forwarding reste volontairement hors de `npm run build` : il se compile séparément avec `npx tsc -p apps/forwarding-service/tsconfig.json` et dépend du package Prisma non versionné. Les tests doivent être lancés séparément. Les alias TypeScript reposent sur `baseUrl` à la racine; les applications Nest définissent `rootDir` sur la racine du dépôt pour inclure `libs/`. `ignoreDeprecations` vaut `5.0`, cohérent avec TypeScript 5.9.3 installé selon le lockfile; utiliser `6.0` nécessite d’abord une mise à niveau effective de TypeScript vers la version 6.
