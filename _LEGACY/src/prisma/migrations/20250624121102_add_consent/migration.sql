-- CreateTable
CREATE TABLE `user_consents` (
    `userId` INTEGER NOT NULL,
    `consentType` VARCHAR(191) NOT NULL,
    `consentedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `value` BOOLEAN NOT NULL,

    INDEX `user_consents_userId_idx`(`userId`),
    PRIMARY KEY (`userId`, `consentType`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_consents` ADD CONSTRAINT `user_consents_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
