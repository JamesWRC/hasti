/*
  Warnings:

  - You are about to drop the column `content` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "content",
ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];
