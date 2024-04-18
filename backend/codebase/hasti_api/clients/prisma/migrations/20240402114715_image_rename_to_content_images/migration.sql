/*
  Warnings:

  - You are about to drop the column `images` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "images",
ADD COLUMN     "contentImages" VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR(255)[];
