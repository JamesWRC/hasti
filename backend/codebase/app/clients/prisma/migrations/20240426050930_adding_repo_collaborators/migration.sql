-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- CreateTable
CREATE TABLE "Collaborator" (
    "id" TEXT NOT NULL,
    "repoID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "type" VARCHAR(255) NOT NULL DEFAULT 'user',
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "maintain" BOOLEAN NOT NULL DEFAULT false,
    "push" BOOLEAN NOT NULL DEFAULT false,
    "triage" BOOLEAN NOT NULL DEFAULT false,
    "pull" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collaborator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "repoID_index" ON "Repo"("repoID");

-- CreateIndex
CREATE INDEX "githubID_index" ON "User"("githubID");

-- AddForeignKey
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_repoID_fkey" FOREIGN KEY ("repoID") REFERENCES "Repo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
