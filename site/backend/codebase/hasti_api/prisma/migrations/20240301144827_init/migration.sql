-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "tags" VARCHAR(255)[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "userID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repo" (
    "id" TEXT NOT NULL,
    "repoID" INTEGER NOT NULL,
    "noedID" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "fullName" VARCHAR(255) NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "userID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "githubID" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repo_repoID_key" ON "Repo"("repoID");

-- CreateIndex
CREATE UNIQUE INDEX "User_githubID_key" ON "User"("githubID");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Repo" ADD CONSTRAINT "Repo_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
