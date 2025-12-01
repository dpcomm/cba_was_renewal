-- CreateTable
CREATE TABLE `ChatReport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reporterId` INTEGER NOT NULL,
    `reportedUserId` INTEGER NOT NULL,
    `roomId` INTEGER NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ChatReport_reporterId_idx`(`reporterId`),
    INDEX `ChatReport_reportedUserId_idx`(`reportedUserId`),
    INDEX `ChatReport_roomId_idx`(`roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChatReport` ADD CONSTRAINT `ChatReport_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatReport` ADD CONSTRAINT `ChatReport_reportedUserId_fkey` FOREIGN KEY (`reportedUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatReport` ADD CONSTRAINT `ChatReport_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `CarpoolRoom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
