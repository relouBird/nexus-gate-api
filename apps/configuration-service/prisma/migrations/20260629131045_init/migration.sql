/*
  Warnings:

  - You are about to drop the column `scope` on the `gatewaytoken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `gatewaytoken` DROP COLUMN `scope`;

-- AlterTable
ALTER TABLE `server` ADD COLUMN `status` ENUM('ONLINE', 'OFFLINE') NOT NULL DEFAULT 'ONLINE';

-- CreateTable
CREATE TABLE `GatewayTokenServer` (
    `gatewayTokenId` VARCHAR(191) NOT NULL,
    `serverId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`gatewayTokenId`, `serverId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GatewayTokenServer` ADD CONSTRAINT `GatewayTokenServer_gatewayTokenId_fkey` FOREIGN KEY (`gatewayTokenId`) REFERENCES `GatewayToken`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GatewayTokenServer` ADD CONSTRAINT `GatewayTokenServer_serverId_fkey` FOREIGN KEY (`serverId`) REFERENCES `Server`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
