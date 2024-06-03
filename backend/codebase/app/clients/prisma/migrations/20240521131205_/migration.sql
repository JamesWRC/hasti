/*
  Warnings:

  - You are about to drop the column `useingHastiMD` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "useingHastiMD",
ADD COLUMN     "usingHastiMD" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];
