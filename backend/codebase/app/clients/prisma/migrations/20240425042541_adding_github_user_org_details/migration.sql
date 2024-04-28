-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "Repo" ADD COLUMN     "addedByGithubID" INTEGER NOT NULL DEFAULT 0;
