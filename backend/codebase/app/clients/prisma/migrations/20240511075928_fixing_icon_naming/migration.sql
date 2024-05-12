/*
  Warnings:

  - You are about to drop the column `profileImage` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "profileImage",
ADD COLUMN     "iconImage" VARCHAR(255) DEFAULT '',
ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];
