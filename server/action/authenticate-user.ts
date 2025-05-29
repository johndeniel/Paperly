import { LoginCredentials } from '@/lib/schemas'

export async function authenticateUser(
  credentials: LoginCredentials
): Promise<string> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_APP_URL
  const loginPath = '/api/authentication/login'

  const response = await fetch(`${apiBaseUrl}${loginPath}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message)
  }

  return result.message
}
