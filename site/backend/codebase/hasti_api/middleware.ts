import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { NextRequest, NextResponse } from 'next/server'

interface PublicPaths {
  path: string | RegExp;
  methods: string[];
}


// Any path that is public and does not require a JWT token
const PUBLIC_PATHS:PublicPaths[] = [
  {path: '/api/auth/gitUserToken', methods: ["GET"]}, 
  {path: '/api/auth/jwt', methods: ["POST"]},
  {path: '/api/auth/*', methods: ["GET"]},
  {path: '^\/api\/.*\/user\/.*', methods: ["GET"]},
  {path: /^\/api\/webhook\/.*/, methods: ["POST"]},
  {path: '/api/project/add', methods: ["POST"]},
]

const allowedOrigins = [process.env.FRONTEND_URL]
const JWT_SECRET__KEY = process.env.JWT_SECRET_KEY as string

 
export async function middleware(request: NextRequest) {

  // Handle CORS
  const response = handleCORS(request);

  // Handle preflighted requests
  const isPreflight = request.method === 'OPTIONS'
  if(isPreflight){
    return response;
  }

  // Handle secure routes
  const unauthorized = await handleSecureRoutes(request);
  if(unauthorized){
    return unauthorized;
  }

  return response
}
 
export const config = {
  matcher: '/api/:path*',
}

// Handle CORS
// If the request is a preflighted request, then return the appropriate headers
// If the request is a simple request, then return the appropriate headers
function handleCORS(request: NextRequest){
    // Check the origin from the request
    const origin = request.headers.get('origin') ?? ''
    const isAllowedOrigin = allowedOrigins.includes(origin)
   
    // Handle preflighted requests
    const isPreflight = request.method === 'OPTIONS'
   
    const corsOptions = {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  
    if (isPreflight) {
      const preflightHeaders = {
        ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
        ...corsOptions,
      }
      return NextResponse.json({}, { headers: preflightHeaders })
    }
   
    // Handle simple requests
    const response = NextResponse.next()
   
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
   
    Object.entries(corsOptions).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }


// We can use this function to handle secure routes
// Returns a response if the route is secured by a JWT token else returns undefined
async function handleSecureRoutes(request: NextRequest) {
  // Get the path from the request
  const reqPath = request.nextUrl.pathname as string
  const method = request.method as string

  // Handle JWT token. 
  const isPublic = PUBLIC_PATHS.find(route => {
    let matchedPath = false
    const currentPath = route.path as any
    console.log(currentPath as any instanceof RegExp)
    if (currentPath as any instanceof RegExp) {
      matchedPath = currentPath.test(reqPath);
    } else {
      matchedPath = currentPath === reqPath;
    }

    return matchedPath && route.methods.includes(method)

  });  

  // If the path is not public, then check for JWT token
  if(!isPublic){
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') as string
    if(!token){
      return NextResponse.json({message: 'Unauthorized. No Authorization header provided to middleware.'}, {status: 401})
    }

    try{
      const payload = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET__KEY));
    }catch(error){
        return NextResponse.json({message: 'Unauthorized. JWT rejected by middleware.'}, {status: 401})
    }
  }
}