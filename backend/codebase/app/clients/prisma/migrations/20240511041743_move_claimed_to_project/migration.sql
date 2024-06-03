/*
  Warnings:

  - You are about to drop the column `claimed` on the `Repo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "claimed" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "Repo" DROP COLUMN "claimed";
