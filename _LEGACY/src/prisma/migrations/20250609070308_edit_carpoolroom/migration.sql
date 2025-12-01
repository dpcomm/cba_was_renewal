/*
  Warnings:

  - You are about to drop the column `departureTime` on the `CarpoolRoom` table. All the data in the column will be lost.
  - Added the required column `originDetailed` to the `CarpoolRoom` table without a default value. This is not possible if the table is not empty.
  - Made the column `note` on table `CarpoolRoom` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `CarpoolRoom` DROP COLUMN `departureTime`,
    ADD COLUMN `originDetailed` VARCHAR(191) NOT NULL,
    MODIFY `note` VARCHAR(191) NOT NULL;
