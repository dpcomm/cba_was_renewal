-- AlterTable
ALTER TABLE `CarpoolRoom` ADD COLUMN `departureTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `destinationDetailed` VARCHAR(191) NULL,
    MODIFY `originDetailed` VARCHAR(191) NULL;
