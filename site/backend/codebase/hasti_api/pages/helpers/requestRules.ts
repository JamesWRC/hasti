import { NextApiRequest, NextApiResponse } from "next/types"

// Rules of hosts that are allowed to request to the server. 
export const ALLOWED_HOSTS = ['localhost', 'vercel.app', 'hasti.app']



export default function checkHost(req: NextApiRequest) {
    const reqHost: string | undefined = req?.headers?.host?.split(':')[0]

    // Check if the host is allowed to request to the server
    // If not, return 403
    let host: string = ''
    console.log("reqHost", reqHost)
    if(!reqHost) {
        return host
    }

    // Check if the host is allowed to request to the server
    for (const currHost of ALLOWED_HOSTS) {

        if(reqHost.endsWith(currHost)) {
            host = currHost
            break
        }
    }
    
    // If the host is localhost, allow it to request to the server
    if(host === 'localhost') {
        host = '*'
    }

    return host
}

// Respond with 400 Bad Request if no host found in the request headers.
export function badHost(res: NextApiResponse) {
    return res.status(400).json({content: 'Bad Request. No host found in the request headers or the host is not allowed to request to the server.'})
}

