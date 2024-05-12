-- AlterTable
ALTER TABLE "Collaborator" ALTER COLUMN "gitHubID" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "Repo" ALTER COLUMN "ownerGithubID" DROP DEFAULT,
ALTER COLUMN "addedByGithubID" DROP DEFAULT;
