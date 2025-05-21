import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateAuthToken } from '@/lib/jwt'

// Define public paths that don't require authentication
const publicPaths = ['/login', '/api/authentication/login']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Get the token from cookies - FIXED: using 'authToken' instead of 'token'
  const token = request.cookies.get('authToken')?.value

  // Check if current path is in the public paths list
  const isPublicPath = publicPaths.some(publicPath =>
    path.startsWith(publicPath)
  )

  // If user has a valid token and is trying to access login page, redirect to home
  if (isPublicPath && token) {
    try {
      const verifiedToken = await validateAuthToken(token)
      if (verifiedToken) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch {
      // Token verification failed, continue with normal flow
    }
  }

  // Allow access to public paths without token verification
  if (isPublicPath) {
    return NextResponse.next()
  }

  // No token exists and trying to access protected route
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verify the token
    const verifiedToken = await validateAuthToken(token)

    // Invalid or expired token
    if (!verifiedToken) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('authToken') // FIXED: using 'authToken' instead of 'token'
      return response
    }

    // Valid token - allow access to protected route
    return NextResponse.next()
  } catch (error) {
    console.error('Authentication middleware error:', error)

    // On error, redirect to login page
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('authToken') // FIXED: using 'authToken' instead of 'token'
    return response
  }
}

// Apply middleware to all routes except static assets
export const config = {
  matcher: [
    // Apply to all routes except public assets
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
