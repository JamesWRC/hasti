-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "Repo" ADD COLUMN     "gitAppHasAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownerGithubID" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ownerType" VARCHAR(255) NOT NULL DEFAULT 'user';
