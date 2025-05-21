import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/jwt'

export async function POST() {
  try {
    // Create response object
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )

    // Clear the token cookie by setting it to expire immediately
    await clearAuthCookie()

    return response
  } catch (error) {
    console.error('Logout error:', error)
  }
}
