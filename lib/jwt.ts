import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'

interface TokenPayload {
  id: string
  username: string
  division: string
  exp?: number
  iat?: number
}

// Ensure JWT_SECRET is properly validated
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET_KEY
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be defined and at least 32 characters long')
}

// Token configuration constants with enhanced security
const TOKEN_EXPIRES_IN = 60 * 60 * 24 // 1 day in seconds
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: TOKEN_EXPIRES_IN,
}

/**
 * Generates a JWT token with the provided payload
 * @param payload User data to include in token
 * @returns Promise containing the signed JWT token
 */
export async function generateToken(
  payload: Omit<TokenPayload, 'exp' | 'iat'>
): Promise<string> {
  if (!payload.id || !payload.username || !payload.division) {
    throw new Error('Token payload missing required fields')
  }

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt() // Add issuedAt claim
    .setExpirationTime(Math.floor(Date.now() / 1000) + TOKEN_EXPIRES_IN)
    .setNotBefore(Math.floor(Date.now() / 1000)) // Prevent use before current time
    .sign(new TextEncoder().encode(JWT_SECRET))
}

/**
 * Verifies the provided JWT token
 * @param token JWT token to verify
 * @returns Promise containing the decoded payload or null if invalid
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  if (!token) return null

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
      {
        maxTokenAge: TOKEN_EXPIRES_IN, // Additional time validation
      }
    )
    return payload as unknown as TokenPayload
  } catch (error) {
    console.error(
      'JWT verification failed:',
      error instanceof Error ? error.message : error
    )
    return null
  }
}

/**
 * Sets the authentication token as an HTTP-only cookie
 * @param token JWT token to set in cookie
 */
export async function setTokenCookie(token: string): Promise<void> {
  if (!token) throw new Error('Cannot set empty token')

  const cookieStore = await cookies()
  cookieStore.set('token', token, COOKIE_OPTIONS)
}

/**
 * Removes the authentication token cookie
 */
export async function removeTokenCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('token')
}

/**
 * Retrieves the token from cookies
 * @returns Promise containing the token string or null if not found
 */
export async function getTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('token')?.value || null
}

/**
 * Complete authentication check - validates token from cookie
 * @returns Promise containing the decoded user data or null if unauthorized
 */
export async function getCurrentUser(): Promise<TokenPayload | null> {
  const token = await getTokenFromCookie()
  if (!token) return null

  return verifyToken(token)
}
