/*
  Warnings:

  - You are about to alter the column `webhookId` on the `WebhookEvents` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "type" VARCHAR(255) NOT NULL DEFAULT 'user';

-- AlterTable
ALTER TABLE "WebhookEvents" ALTER COLUMN "webhookId" SET DATA TYPE VARCHAR(255);
