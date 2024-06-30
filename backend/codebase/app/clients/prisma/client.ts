import { Prisma, PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  omit: {
    user: { 
	    ghuToken: true,
	  },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


// Hacky way to create type for what a find many query WITH the user relation is included.
async function getProjectWithUser() {
  return await prisma.project.findFirst({
    where: {id: 'null'}, 
    include: { 
      user: {
        omit: {
          ghuToken: true
        },
      }, 
    } 
  })
}

async function getProjectAllInfo() {
  return await prisma.project.findFirst({
    where: {id: 'null'}, 
    include: { 
      user: {
        omit: {
          ghuToken: true
        },
      }, 
      tags: true, 
      repo: {
        include: { repoAnalytics: { take: 1 } }
        } 
      } 
    })
}

// Extract `ProjectWithUser` type with
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T
export type ProjectWithUser = ThenArg<ReturnType<typeof getProjectWithUser>>
export type ProjectAllInfo = ThenArg<ReturnType<typeof getProjectAllInfo>>

export default prisma