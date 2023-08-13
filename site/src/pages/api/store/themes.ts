// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  themes: any[]
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    let responseBody = []
    for(let i = 0; i < 999; i++) {
        responseBody.push({
            id: i,
            title: 'John Doe',
            description: 'John Doe',
            author: 'John Doe',
        })
    }
  res.status(200).json({ themes: responseBody })
}
