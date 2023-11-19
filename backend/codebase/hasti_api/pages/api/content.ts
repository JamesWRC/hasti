// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/prisma/client'
import fs from 'fs'
import path from 'path'

type Data = {
  content: string,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    // Read and get the text of the text.md file
    const filePath = path.join(process.cwd(), 'text.md');
    const fileContents = fs.readFileSync(filePath, 'utf8');

    // Return the text of the text.md file
    // Set headers as text/plain
    return res.status(200).json({content: fileContents})

}
