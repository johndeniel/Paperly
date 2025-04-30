import { NextRequest, NextResponse } from 'next/server'
import { Query } from '@/lib/db/postgresql-connection-helper'
import { UserEntity } from '@/lib/types'
import { generateSecureAuthToken, storeAuthCookie } from '@/lib/jwt'
import * as argon2 from 'argon2'

/**
 * Interface representing the expected login request body
 */
interface AuthenticationRequest {
  username: string
  password: string
}

/**
 * HTTP POST handler for user authentication
 * Validates credentials and issues JWT token on success
 */
export async function POST(request: NextRequest) {
  try {
    // Extract and validate authentication credentials
    const { username, password } =
      (await request.json()) as AuthenticationRequest

    // Retrieve user record by username
    const userEntity = await fetchUserByUsername(username)
    if (!userEntity) {
      // Return generic message to prevent username enumeration
      return NextResponse.json(
        {
          code: 'INVALID_CREDENTIALS',
          message:
            'Authentication failed. We could not find an account with the provided username.',
        },
        { status: 401 }
      )
    }

    // Verify password using secure argon2 algorithm
    const isPasswordValid = await argon2.verify(
      userEntity.password_hash,
      password
    )
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          code: 'INVALID_CREDENTIALS',
          message:
            'Authentication failed. The password you entered does not match our records. Please verify your credentials and try again.',
        },
        { status: 401 }
      )
    }

    // Generate secure JWT token containing user information
    const authToken = await generateSecureAuthToken({
      user_id: userEntity.user_id,
      full_name: userEntity.full_name,
      user_name: userEntity.user_name,
      avatar_url: userEntity.avatar_url,
      division: userEntity.department,
    })

    // Set HTTP-only secure cookie with the token
    await storeAuthCookie(authToken)

    // Return successful authentication response with user profile data
    return NextResponse.json({
      code: 'AUTHENTICATION_SUCCESS',
      message: 'Authentication successful',
      user: {
        user_id: userEntity.user_id,
        full_name: userEntity.full_name,
        user_name: userEntity.user_name,
        avatar_url: userEntity.avatar_url,
        division_designation: userEntity.department,
      },
    })
  } catch (error) {
    // Log error but don't expose details to client
    console.error('Authentication process error:', error)

    return NextResponse.json(
      {
        code: 'AUTHENTICATION_ERROR',
        message:
          'Authentication failed due to an unexpected system error. Please try again later or contact support if the issue persists.',
      },
      { status: 500 }
    )
  }
}

/**
 * Fetches user data from the database by username
 * Uses transaction to ensure data consistency
 *
 * @param username - The username to search for
 * @returns User entity if found, null otherwise
 */
async function fetchUserByUsername(
  username: string
): Promise<UserEntity | null> {
  try {
    // Begin transaction
    await Query({ query: 'BEGIN' })

    // Execute parameterized query to prevent SQL injection
    const userResults = await Query({
      query: `
       SELECT user_id, full_name, user_name, avatar_url, password_hash, department 
       FROM user_account 
       WHERE user_name = $1
     `,
      values: [username],
    })

    // Handle case when no user is found
    if (!userResults?.length) {
      await Query({ query: 'ROLLBACK' })
      return null
    }

    // Commit transaction and return user data
    await Query({ query: 'COMMIT' })
    return userResults[0] as UserEntity
  } catch (error) {
    // Rollback transaction on error
    await Query({ query: 'ROLLBACK' })
    throw error
  }
}
