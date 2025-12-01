/*
  Warnings:

  - Added the required column `platform` to the `FcmToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `FcmToken` ADD COLUMN `platform` VARCHAR(191) NOT NULL;
