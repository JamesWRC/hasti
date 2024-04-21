// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/backend/clients/prisma/client'
import fs from 'fs'
import path from 'path'

import checkHost, { badHost } from '@/backend/pages_old/helpers/requestRules'

type Data = {
  content: string,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    // Read and get the text of the text.md file
    const filePath = path.join(process.cwd(), 'test-readme.md');
    const fileContents = fs.readFileSync(filePath, 'utf8');

    const host = checkHost(req)

    if(!host){
      return badHost(res)
    }

    // Add cors headers
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Origin', host)
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
    res.setHeader('Content-Type', 'text/plain')


    // Return the text of the text.md file
    // Set headers as text/plain
    return res.status(200).json({content: fileContents})

}
