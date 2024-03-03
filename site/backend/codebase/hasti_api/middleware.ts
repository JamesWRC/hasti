import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  {path: '/api/auth/gitUserToken', methods: ["GET"]}, 
  {path: '/api/auth/jwt', methods: ["POST", "GET"]},
  {path: '/api/auth/*', methods: ["GET"]},
  {path: '/api/**/user/*', methods: ["GET"]},
]
const allowedOrigins = [process.env.FRONTEND_URL]
 
const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const JWT_SECRET__KEY = process.env.JWT_SECRET_KEY as string



 
export async function middleware(request: NextRequest) {
  // Check the origin from the request
  const origin = request.headers.get('origin') ?? ''
  const isAllowedOrigin = allowedOrigins.includes(origin)
 
  // Handle preflighted requests
  const isPreflight = request.method === 'OPTIONS'
 
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


  // Get the path from the request
  const reqPath = request.nextUrl.pathname as string
  const method = request.method as string

  // Handle JWT token
  const isPublic = PUBLIC_PATHS.find(route => {
    let matchedPath = false
    const currentPath = route.path as any
    if (currentPath as any instanceof RegExp) {
      matchedPath = currentPath.test(reqPath);
    } else {
      matchedPath = currentPath === reqPath;
    }

    console.log('matchedPath', currentPath,  matchedPath)
    console.log('route.methods', route.methods)
    return matchedPath && route.methods.includes(method)

  });  
  
  if(!isPublic){
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') as string
    if(!token){
      return NextResponse.json({message: 'Unauthorized. No Authorization header provided.'}, {status: 401})
    }

    try{
      const payload = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET__KEY));
    }catch(error){
        return NextResponse.json({message: 'Unauthorized. JWT rejected by middleware.'}, {status: 401})
    }
  }

 
  return response
}
 
export const config = {
  matcher: '/api/:path*',
}