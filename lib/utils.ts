import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { AuthTokenPayload } from '@/lib/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates user initials from full name for avatar fallback
 */
export function generateInitials(name: string = ''): string {
  if (!name || typeof name !== 'string') return '??'
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

/**
 * Extracts and validates authentication token from browser cookies
 * @returns Decoded token payload or null if invalid/missing
 */
export function extractAuthTokenPayload(): AuthTokenPayload | null {
  try {
    const cookieString = document.cookie
    if (!cookieString) {
      console.warn('No cookies found.')
      return null
    }

    const authTokenCookie = cookieString
      .split('; ')
      .find(row => row.startsWith('authToken='))

    if (!authTokenCookie) {
      console.warn('Authentication token not found in cookies')
      return null
    }

    const authToken = decodeURIComponent(authTokenCookie.split('=')[1])
    if (!authToken) {
      console.warn('Authentication token value is empty')
      return null
    }

    const tokenParts = authToken.split('.')
    if (tokenParts.length !== 3) {
      console.error('Invalid JWT token format')
      return null
    }

    const payload = JSON.parse(atob(tokenParts[1]))

    if (
      !payload.user_id ||
      !payload.user_name ||
      !payload.division ||
      !payload.full_name
    ) {
      console.error(
        'Invalid token payload: missing required fields (user_id, user_name, full_name, division)'
      )
      return null
    }
    // Ensure avatar_url is present, even if null/undefined, to match AuthTokenPayload type
    if (typeof payload.avatar_url === 'undefined') {
      payload.avatar_url = null
    }

    return payload as AuthTokenPayload
  } catch (error) {
    console.error('Error extracting auth token payload:', error)
    return null
  }
}
