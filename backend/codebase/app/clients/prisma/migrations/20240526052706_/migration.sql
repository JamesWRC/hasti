/*
  Warnings:

  - You are about to drop the column `gitHubStars` on the `Repo` table. All the data in the column will be lost.
  - You are about to drop the column `gitHubWatchers` on the `Repo` table. All the data in the column will be lost.
  - You are about to drop the column `openIssues` on the `Repo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "Repo" DROP COLUMN "gitHubStars",
DROP COLUMN "gitHubWatchers",
DROP COLUMN "openIssues";

-- AlterTable
ALTER TABLE "RepoAnalytics" ALTER COLUMN "lastCommit" DROP NOT NULL;
