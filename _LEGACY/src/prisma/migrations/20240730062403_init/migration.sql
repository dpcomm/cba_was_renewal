/*
  Warnings:

  - Added the required column `retreatId` to the `Youtube` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Youtube` ADD COLUMN `retreatId` INTEGER NOT NULL,
    MODIFY `link` VARCHAR(255) NOT NULL;

-- AddForeignKey
ALTER TABLE `Youtube` ADD CONSTRAINT `Youtube_retreatId_fkey` FOREIGN KEY (`retreatId`) REFERENCES `Retreat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Youtube` ADD COLUMN `title` VARCHAR(255) NOT NULL DEFAULT 'Untitled';
