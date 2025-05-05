export async function logoutUser() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_APP_URL
  const loginPath = '/api/authentication/logout'

  const response = await fetch(`${apiBaseUrl}${loginPath}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message)
  }

  return result.message
}
