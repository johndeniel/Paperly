import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { AuthTokenPayload } from '@/lib/types'

// Environment variables validation
const JWT_SECRET_KEY = process.env.NEXT_PUBLIC_JWT_SECRET_KEY
if (!JWT_SECRET_KEY || JWT_SECRET_KEY.length < 32) {
  throw new Error(
    'JWT_SECRET_KEY must be defined and at least 32 characters long'
  )
}

// Authentication token lifetime (1 day in seconds)
const AUTH_TOKEN_LIFETIME = 60 * 60 * 24

// Security configuration constants
const SECURE_COOKIE_CONFIG = {
  httpOnly: false,
  secure: false,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: AUTH_TOKEN_LIFETIME,
}

/**
 * Generate a signed JWT authentication token with user information
 *
 * @param userInfo User data to include in token
 * @returns Promise containing the signed JWT token string
 * @throws Error if required user information is missing
 */
export async function generateSecureAuthToken(
  userInfo: Omit<AuthTokenPayload, 'exp' | 'iat'>
): Promise<string> {
  // Validate required fields
  if (!userInfo.user_id || !userInfo.user_name || !userInfo.division) {
    throw new Error(
      'Authentication token requires id, username, and division fields'
    )
  }

  // Create and sign the JWT token with security best practices
  return new SignJWT({ ...userInfo })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt() // When the token was issued
    .setExpirationTime(Math.floor(Date.now() / 1000) + AUTH_TOKEN_LIFETIME) // When the token expires
    .setNotBefore(Math.floor(Date.now() / 1000)) // Prevents token use before current time
    .sign(new TextEncoder().encode(JWT_SECRET_KEY))
}

/**
 * Validates a JWT token and returns the contained user information
 *
 * @param authToken JWT token string to verify
 * @returns User information if token is valid, null otherwise
 */
export async function validateAuthToken(
  authToken: string
): Promise<AuthTokenPayload | null> {
  if (!authToken) return null

  try {
    const { payload } = await jwtVerify(
      authToken,
      new TextEncoder().encode(JWT_SECRET_KEY),
      {
        maxTokenAge: AUTH_TOKEN_LIFETIME,
      }
    )
    return payload as unknown as AuthTokenPayload
  } catch (error) {
    console.error(
      'Authentication token validation failed:',
      error instanceof Error ? error.message : error
    )
    return null
  }
}

/**
 * Stores the authentication token in a secure HTTP-only cookie
 *
 * @param authToken JWT token to store in cookie
 * @throws Error if token is empty or invalid
 */
export async function storeAuthCookie(authToken: string): Promise<void> {
  if (!authToken) throw new Error('Cannot store empty authentication token')

  const cookieStore = await cookies()
  cookieStore.set('authToken', authToken, SECURE_COOKIE_CONFIG)
}

/**
 * Clears the authentication cookie, effectively logging the user out
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('authToken')
}

/**
 * Retrieves the authentication token from cookies
 *
 * @returns Authentication token if present, null otherwise
 */
export async function retrieveAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('authToken')?.value || null
}

/**
 * Retrieves and validates the current user from the authentication cookie
 * Comprehensive authentication check for protected routes
 *
 * @returns Authenticated user information or null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<AuthTokenPayload | null> {
  const authToken = await retrieveAuthToken()
  if (!authToken) return null

  return validateAuthToken(authToken)
}
