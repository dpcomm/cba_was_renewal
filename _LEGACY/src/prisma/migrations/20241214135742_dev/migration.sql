/*
  Warnings:

  - A unique constraint covering the columns `[userId,retreatId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Application_userId_retreatId_key` ON `Application`(`userId`, `retreatId`);
