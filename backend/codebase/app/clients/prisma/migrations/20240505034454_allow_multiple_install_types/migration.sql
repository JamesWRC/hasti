/*
  Warnings:

  - You are about to drop the column `haInstallType` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "haInstallType",
ADD COLUMN     "haInstallTypes" VARCHAR(255)[] DEFAULT ARRAY['any']::VARCHAR(255)[],
ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];
