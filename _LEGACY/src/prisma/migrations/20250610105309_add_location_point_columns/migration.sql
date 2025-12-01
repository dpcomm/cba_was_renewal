-- AlterTable
ALTER TABLE `CarpoolRoom` ADD COLUMN `destLat` DECIMAL(10, 6) NULL,
    ADD COLUMN `destLng` DECIMAL(10, 6) NULL,
    ADD COLUMN `originLat` DECIMAL(10, 6) NULL,
    ADD COLUMN `originLng` DECIMAL(10, 6) NULL;
