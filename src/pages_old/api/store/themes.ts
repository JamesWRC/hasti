// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { LoremIpsum } from "lorem-ipsum";

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});
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
            title: 'John Doe' + i,
            description: lorem.generateSentences(5),
            author: 'John Doe',
        })
    }
  res.status(200).json({ themes: responseBody })
}
