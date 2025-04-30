/**
 * Defines the structure of a token payload used for authentication.
 */
export interface AuthTokenPayload {
  user_id: string
  full_name: string
  user_name: string
  avatar_url: string
  division: string
  exp?: number
  iat?: number
}

/**
 * Represents the structure of a user record in the system.
 */
export interface UserEntity {
  user_id: string
  full_name: string
  user_name: string
  avatar_url: string
  password_hash: string
  department: string
}
