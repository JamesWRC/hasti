-- AlterTable
ALTER TABLE "Collaborator" ADD COLUMN     "gitHubID" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];
