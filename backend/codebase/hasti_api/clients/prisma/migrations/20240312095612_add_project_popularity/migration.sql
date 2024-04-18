-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "haInstallType" VARCHAR(255) NOT NULL DEFAULT 'core',
ADD COLUMN     "projectType" VARCHAR(255) NOT NULL DEFAULT 'integration';

-- AlterTable
ALTER TABLE "Repo" ADD COLUMN     "gitHubStars" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gitHubWatchers" INTEGER NOT NULL DEFAULT 0;
