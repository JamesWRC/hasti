/*
  Warnings:

  - You are about to drop the column `haInstallTypes` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "haInstallTypes",
ADD COLUMN     "worksWithContainer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "worksWithCore" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "worksWithOS" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "worksWithSupervised" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];
