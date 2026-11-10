# Notes d’origine et objectif du package de base de données

Ce fichier remplace les anciennes notes d’installation NestJS/Prisma, qui mélangeaient des commandes déjà obsolètes et des noms de services qui n’existent plus dans la configuration actuelle.

Les notes initiales mentionnaient un projet tutoré SIGL 2025/2026 et des expérimentations avec NestJS, Prisma, MariaDB, Redis, JWT et Swagger. Elles ne permettent pas de reconstituer précisément la création du package de base de données.

L’objectif à conserver pour la suite est de centraliser les éléments répétitifs liés à l’accès à la base — notamment l’initialisation Prisma, l’adaptateur MariaDB et le cycle de vie des connexions — afin de ne pas recopier puis modifier les mêmes éléments dans plusieurs services.

À la date de cette mise à jour, aucun package source de base de données n’est versionné. Le dossier local `packages/` est ignoré par Git et contient un client Prisma généré, mais pas de code source de package ni de configuration de workspace permettant de reconstruire son origine. Les détails vérifiés et les choix à faire sont consignés dans [PROJECT-STATUS.md](./PROJECT-STATUS.md).

Ne pas confondre la génération d’un client Prisma avec la création d’un package réutilisable : le client généré est un artefact, tandis que le package attendu doit avoir des sources, une interface et une intégration reproductibles depuis un clone propre.
