# État du projet et réserves techniques

Ce relevé décrit les fichiers présents dans le dépôt et les artefacts locaux ignorés par Git. Il ne prétend pas retrouver l’historique d’éléments qui n’ont jamais été versionnés.

## Package de base de données : constat

L’objectif exprimé est de ne plus dupliquer la gestion de l’accès à la base dans chaque service. Dans l’état actuel :

- Le dépôt contient quatre copies identiques de `schema.prisma`, dans `auth-service`, `user-service`, `configuration-service` et `forwarding-service`.
- Les trois services NestJS ont des implémentations très proches de `PrismaService`, qui construisent chacune un adaptateur MariaDB et gèrent la connexion.
- `forwarding-service` importe `@nexus/database/prisma-client`. Le code suivi ne définit ni ce package source ni un workspace npm correspondant.
- La racine `.gitignore` exclut tout le dossier `packages/`. Le dossier présent dans ce clone ne contient qu’un client Prisma généré localement (et des répertoires sources vides); il n’est pas livré avec un clone Git propre.
- Le `package.json` de ce client généré porte un nom automatique Prisma, pas `@nexus/database`. Les fichiers générés dans les dossiers `src/generated` sont eux aussi ignorés par Git.
- Dans ce clone uniquement, `node_modules/@nexus/database` est une jonction locale vers `packages/database`; elle explique pourquoi l’import et la compilation du forwarding réussissent ici. Ni `package.json` ni `package-lock.json` ne déclarent cette jonction comme workspace/dépendance, donc elle n’est pas reproductible par `npm ci` depuis un clone propre.
- Le script `db:forwarding:generate-copy` référence `apps/forwarding-service/prisma.copy.ts`, qui n’existe pas dans le dépôt.

**Conclusion :** la présence locale d’un client généré ne constitue pas un package réutilisable et l’origine de ce dossier ne peut pas être reconstituée à partir des fichiers suivis. Il faut d’abord décider ce que le package partagera :

1. **Infrastructure Prisma commune seulement** : factoriser l’adaptateur, la validation de configuration et le cycle de vie des connexions, tout en gardant un client, un schéma et des migrations par service.
2. **Schéma/client communs également** : définir une seule source de vérité et clarifier quels services possèdent les modèles et les migrations avant de déplacer ou supprimer quoi que ce soit.

La première option réduit la duplication d’initialisation sans changer implicitement la propriété des données. Dans les deux cas, le package devra être inclus dans Git, déclaré comme workspace/dépendance, généré de façon reproductible et vérifié par un build depuis un clone propre. Aucun changement de code ou de migration n’a été fait dans cette branche.

## Schémas et migrations

- Les quatre schémas source sont identiques, mais chacun possède son propre historique de migrations.
- Les historiques de `configuration-service` et `forwarding-service` comprennent des migrations qui ajoutent notamment l’état des serveurs, la relation de portée des jetons, les en-têtes et l’expiration des jetons.
- Les historiques de `auth-service` et `user-service` s’arrêtent à leur migration initiale. Celle-ci contient encore l’ancienne colonne `GatewayToken.scope` et ne reflète pas plusieurs éléments du schéma actuel, dont `GatewayTokenServer`, `Server.status`, `Server.headers` et `GatewayToken.expiresAt`.
- Les commandes de migration ne doivent donc pas être considérées comme interchangeables entre services. Comparer les bases et les historiques réels avant toute migration, réinitialisation ou centralisation; ne pas lancer `migrate reset` sur une base à préserver.

## Démarrage : cohérence à rétablir

- La gateway lit `process.env.port` (minuscule) pour son port HTTP, alors que le reste de la configuration utilise `PORT`. `Number(undefined)` donne `NaN`; l’expression de secours basée sur `??` ne remplace pas cette valeur.
- Les clients TCP de la gateway tentent d’utiliser `9003`, `9004` et `9005`, mais leur valeur par défaut est inefficace : `Number(undefined)` donne `NaN`, que `??` ne remplace pas. Les trois microservices NestJS utilisent chacun `5552` par défaut. Sans configuration explicite et cohérente, leurs connexions ne correspondent pas; les ports par défaut identiques des services peuvent aussi entrer en conflit.
- Les `.env` de service ne sont pas fournis. Pour les connexions applicatives, les `PrismaService` NestJS lisent les variables `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD` et `DATABASE_NAME`; les commandes Prisma utilisent aussi `DATABASE_URL`.
- Docker Compose démarre Redis uniquement; il ne fournit pas MariaDB.
- Le forwarding est une application TypeScript autonome et son import de `@nexus/database/prisma-client` ne peut pas être résolu à partir des fichiers suivis actuels.

Les scripts de lancement sont documentés dans [READCOMMAND.md](./READCOMMAND.md), mais un parcours de démarrage complet n’est pas garanti tant que ces points ne sont pas alignés. L’import du forwarding dépend de la jonction locale ignorée décrite plus haut; un clone propre ne dispose pas des éléments suivis nécessaires pour la recréer.

## Autres points à traiter avant un déploiement

- Une valeur de secret JWT est inscrite dans le code des services. La remplacer par une configuration d’environnement/secrets et renouveler la valeur avant toute exposition réelle; ne pas recopier cette valeur dans la documentation.
- Les fichiers `prisma.config.ts` affichent `DATABASE_URL` dans la sortie console. Éviter d’écrire une URL contenant des identifiants dans les journaux.
- `@prisma/adapter-mariadb` est utilisé par le code applicatif, mais déclaré en dépendance de développement. Vérifier les dépendances installées en production avant de déployer avec une installation qui omet les dépendances de développement.
- `npm run build` réussit dans ce clone, mais `nest build` cible le projet NestJS par défaut (la gateway), pas le service de forwarding.
- La compilation directe du forwarding (`tsc -p apps/forwarding-service/tsconfig.json --noEmit`) réussit ici grâce à la jonction locale ignorée décrite plus haut; ce résultat ne valide pas un clone propre.
- `npm test` et `npm run test:e2e` ne lancent aucun test : `ts-jest` échoue avant leur exécution avec `TS5103: Invalid value for '--ignoreDeprecations'` sur la valeur `"6.0"` de `tsconfig.json` (TypeScript installé : 5.9.3). Jest signale aussi une collision de nom de package entre deux clients Prisma générés localement.
- Aucun démarrage des services avec de vraies bases, Redis ou fichiers `.env` n’a été réalisé. Les commandes disponibles sont listées dans le README.

## Suite suggérée

1. Confirmer si le package doit partager uniquement la connexion Prisma ou aussi le schéma et les migrations.
2. Décider de la propriété des modèles et bases de chaque microservice; auditer l’état réel des bases avant de modifier les historiques divergents.
3. Rendre l’installation/génération du package déterministe et versionnée, puis corriger le câblage du forwarding.
4. Harmoniser les noms et ports d’environnement de la gateway et des services.
5. Valider `npm ci`, la génération Prisma, le build, les tests et le démarrage sur un clone propre.
