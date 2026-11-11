# État du projet et réserves techniques

## Configuration centralisée

- La librairie NestJS `@nexus/configuration` se trouve dans `libs/configuration`. Les quatre applications NestJS la chargent avec `ConfigurationModule.forRoot('<application>')` et utilisent `ServiceConfiguration`.
- `ServiceConfiguration` ne retourne que les clés préfixées pour l’application enregistrée, plus les clés partagées demandées explicitement via `getShared`. `ConfigService` n’est pas exporté comme service global.
- Les noms de services sont `api-gateway`, `auth-service`, `user-service` et `configuration-service`; leurs clés commencent respectivement par `API_GATEWAY_`, `AUTH_SERVICE_`, `USER_SERVICE_` et `CONFIGURATION_SERVICE_`.
- Les cinq fichiers locaux `apps/*/.env` ont été migrés vers `.env.global`, puis supprimés. Le fichier global réel est ignoré par Git et ne sera pas fourni dans un nouveau clone; les configurations Prisma utilisent ses URL namespacées. Le forwarding, qui n’est pas NestJS, lit aussi ce fichier directement avec `dotenv`.
- `.env.global.example` est un modèle sans secret réel. Copier vers `.env.global`, modifier les valeurs localement et ne jamais versionner le fichier réel; `.gitignore` l’exclut.
- Dans ce clone uniquement, un nouveau secret JWT aléatoire a été créé dans `.env.global`, car les anciens fichiers ne définissaient pas de secret. Le configurer de façon identique dans les processus qui signent et valident les JWT; les sessions signées avec l’ancienne valeur codée en dur ne sont plus valides.
- La séparation entre variables est une convention de code, pas une frontière de sécurité système. Un processus qui a accès à l’environnement complet ou au fichier `.env.global` peut lire les valeurs qu’il contient. En production, fournir à chaque processus ses secrets nécessaires séparément.
- Le secret JWT codé en dur a été retiré du code. Définir un nouveau `SHARED_JWT_SECRET` fort et identique dans la gateway et les services qui signent/valident les JWT. Les jetons existants signés avec l’ancienne valeur ne seront plus valides.
- Les services Nest démarrent maintenant aux ports par défaut distincts documentés dans le fichier d’exemple. Les valeurs sont configurables dans le namespace de chaque service.

## Limites de déploiement toujours présentes

- Le forwarding ne dépend pas de la librairie NestJS, comme souhaité, mais il dépend encore de `@nexus/database/prisma-client`. Le code source et le package database ne sont pas inclus/reproductibles dans un clone propre : `packages/` est exclu par `.gitignore`, et le `node_modules/@nexus/database` présent précédemment dans le clone était une jonction locale non déclarée par npm.
- Le script `db:forwarding:generate-copy` pointe vers `apps/forwarding-service/prisma.copy.ts`, qui n’existe pas.
- Les quatre schémas Prisma source sont identiques, mais les historiques de migration diffèrent. Les historiques d’auth et user s’arrêtent à une ancienne migration initiale; ceux de configuration et forwarding incluent des migrations ultérieures. Les bases réelles et leur historique doivent être audités avant de migrer, réinitialiser ou centraliser les modèles. Ne pas lancer `migrate reset` sur une base à préserver.
- Les implémentations Redis existent encore séparément dans plusieurs services. La librairie de configuration les alimente avec les mêmes variables `SHARED_REDIS_*`; la mutualisation du client Redis n’est pas comprise dans cette branche.
- Docker Compose démarre seulement Redis. MariaDB et les bases nommées dans `.env.global.example` doivent être fournies séparément.
- Les valeurs d’environnement du fichier sont lues depuis la racine du dépôt (`process.cwd()`). Lancer les scripts npm et Prisma depuis cette racine.
- Le chargement depuis `.env.global` ne remplace pas les variables déjà fournies par le système; les variables d’environnement de déploiement ont donc priorité.

## Validation

`npm run build` compile séquentiellement la librairie de configuration et les quatre applications NestJS. Pour compiler un seul projet NestJS :

```powershell
npx nest build <nom-du-projet>
```

Le forwarding reste volontairement hors de `npm run build` : il se compile séparément avec `npx tsc -p apps/forwarding-service/tsconfig.json` et dépend du package Prisma non versionné. Les tests doivent être lancés séparément. Les alias TypeScript reposent sur `baseUrl` à la racine; les applications Nest définissent `rootDir` sur la racine du dépôt pour inclure `libs/`. `ignoreDeprecations` vaut `5.0`, cohérent avec TypeScript 5.9.3 installé selon le lockfile; utiliser `6.0` nécessite d’abord une mise à niveau effective de TypeScript vers la version 6.
