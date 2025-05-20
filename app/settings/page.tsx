'use client'

import * as React from 'react'
import { LogOut, Laptop, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { logoutUser } from '@/server/action/logout-user'
import { useRouter } from 'next/navigation'
import { AuthTokenPayload } from '@/lib/types'

interface UserProfile {
  avatarUrl: string
  name: string
  username: string
  division: string
  userId: string
}

/**
 * Extracts and validates authentication token from browser cookies
 * @returns Decoded token payload or null if invalid/missing
 */
function extractAuthTokenPayload(): AuthTokenPayload | null {
  try {
    const cookies = document.cookie.split(';').reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        if (key && value) {
          acc[key] = decodeURIComponent(value)
        }
        return acc
      },
      {} as Record<string, string>
    )

    const authToken = cookies.authToken
    if (!authToken) {
      console.warn('Authentication token not found in cookies')
      return null
    }

    // Decode JWT payload (base64 decode the middle section)
    const tokenParts = authToken.split('.')
    if (tokenParts.length !== 3) {
      console.error('Invalid JWT token format')
      return null
    }

    const payload = JSON.parse(atob(tokenParts[1]))

    // Validate required fields
    if (!payload.user_id || !payload.user_name || !payload.division) {
      console.error('Invalid token payload: missing required fields')
      return null
    }

    return payload as AuthTokenPayload
  } catch (error) {
    console.error('Error extracting auth token payload:', error)
    return null
  }
}

/**
 * Generates user initials from full name for avatar fallback
 */
function generateInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { push } = useRouter()

  // State for user profile data
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [authError, setAuthError] = React.useState<string | null>(null)

  // Load user profile from auth token on component mount
  React.useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true)
        setAuthError(null)

        const tokenPayload = extractAuthTokenPayload()

        if (!tokenPayload) {
          setAuthError('No valid authentication found')
          // Redirect to login if no valid token
          push('/login')
          return
        }

        // Check token expiration
        if (tokenPayload.exp && tokenPayload.exp * 1000 < Date.now()) {
          setAuthError('Authentication token has expired')
          push('/login')
          return
        }

        // Set profile data from token
        setProfile({
          userId: tokenPayload.user_id,
          name: tokenPayload.full_name,
          username: tokenPayload.user_name,
          division: tokenPayload.division,
          avatarUrl: tokenPayload.avatar_url,
        })
      } catch (error) {
        console.error('Error loading user profile:', error)
        setAuthError('Failed to load user profile')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [push])

  const handleLogout = async () => {
    try {
      const message = await logoutUser()
      toast.success(message)
      push('/login')
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Logout failed'
      toast.error(errorMessage)
      console.error('Logout error:', error)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground text-sm">
            Loading your settings...
          </p>
        </div>
      </div>
    )
  }

  // Show error state
  if (authError || !profile) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <h2 className="text-destructive text-lg font-semibold">
            Authentication Error
          </h2>
          <p className="text-muted-foreground text-sm">
            {authError || 'Unable to load user profile'}
          </p>
          <Button onClick={() => push('/login')} variant="outline" size="sm">
            Return to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background flex min-h-screen items-start justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-xl space-y-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="dark:border-muted border shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Profile</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={profile.avatarUrl}
                      alt={`${profile.name}'s avatar`}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {generateInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <h3 className="text-base leading-tight font-medium">
                      {profile.name}
                    </h3>
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      @{profile.username}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      ID: {profile.userId}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-primary/5 text-primary dark:bg-primary/15 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
                    {profile.division}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Password</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="currentPassword"
                    className="text-xs font-medium"
                  >
                    Current password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    className="focus:ring-primary h-9 focus:ring-1"
                    placeholder="••••••••"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs font-medium">
                    New password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    className="focus:ring-primary h-9 focus:ring-1"
                    placeholder="••••••••"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-xs font-medium"
                  >
                    Confirm password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="focus:ring-primary h-9 focus:ring-1"
                    placeholder="••••••••"
                    disabled
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs font-medium"
                    disabled
                  >
                    Update password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Appearance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Theme preference</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="dark:border-muted hover:bg-muted/50 h-8 w-8 p-0"
                    >
                      {theme === 'light' ? (
                        <Sun className="h-3.5 w-3.5" />
                      ) : theme === 'dark' ? (
                        <Moon className="h-3.5 w-3.5" />
                      ) : (
                        <Laptop className="h-3.5 w-3.5" />
                      )}
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="dark:border-muted w-32"
                  >
                    <DropdownMenuItem
                      onClick={() => setTheme('light')}
                      className="cursor-pointer text-xs"
                    >
                      <Sun className="mr-2 h-3.5 w-3.5" />
                      <span>Light</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme('dark')}
                      className="cursor-pointer text-xs"
                    >
                      <Moon className="mr-2 h-3.5 w-3.5" />
                      <span>Dark</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme('system')}
                      className="cursor-pointer text-xs"
                    >
                      <Laptop className="mr-2 h-3.5 w-3.5" />
                      <span>System</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          <Separator className="dark:bg-muted my-6" />

          <div className="flex justify-end pb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 dark:border-muted h-8 px-3 text-xs font-medium transition-colors"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Log out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
