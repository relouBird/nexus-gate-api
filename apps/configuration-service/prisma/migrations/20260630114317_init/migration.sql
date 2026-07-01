-- AlterTable
ALTER TABLE `gatewaytoken` ADD COLUMN `expiresAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `server` ADD COLUMN `headers` JSON NOT NULL;
