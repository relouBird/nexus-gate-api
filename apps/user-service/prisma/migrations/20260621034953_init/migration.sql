-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_team_id_fkey`;

-- DropIndex
DROP INDEX `User_team_id_fkey` ON `user`;

-- AlterTable
ALTER TABLE `user` MODIFY `team_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
