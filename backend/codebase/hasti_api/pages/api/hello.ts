// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/prisma/client'

type Data = {
  name: string,
  time: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const startTime = new Date().getTime()
  const last = await prisma.user.findMany({
    orderBy: {
        id: 'desc',
    },
    take: 1,
})
const total = await prisma.user.count()
  await prisma.user.create({
    data: {
      name: `Alice ${total}`,
      email: `${Math.random() * (99999999 - 1) + 1}a@a.com ${last[0].name} `,
      posts: {
        create: { title: 'Hello World' },
      },
      profile: {
        create: { bio: 'I like turtles' },
      },
    },
  })

  return res.status(200).json({ name: last[0].name || 'John Doe', time: new Date().getTime() - startTime})

}
