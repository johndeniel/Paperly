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
import { generateInitials, extractAuthTokenPayload } from '@/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { logoutUser } from '@/server/action/logout-user'
import { useRouter } from 'next/navigation'
import { AuthTokenPayload } from '@/lib/types'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { push } = useRouter()

  const [profile, setProfile] = React.useState<AuthTokenPayload | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [authError, setAuthError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const loadUserProfile = () => {
      setIsLoading(true)
      setAuthError(null)
      try {
        const tokenPayload = extractAuthTokenPayload()
        if (tokenPayload) {
          setProfile(tokenPayload)
        } else {
          setAuthError('Invalid or missing authentication token.')
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
        setAuthError('Failed to load user profile.')
      } finally {
        setIsLoading(false)
      }
    }
    loadUserProfile()
  }, [])

  const handleLogout = async () => {
    try {
      const message = await logoutUser()
      toast.success(message || 'Logged out successfully')
      push('/login')
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Logout failed'
      toast.error(errorMessage)
      console.error('Logout error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-screen items-center justify-center">
        <div className="animate-pulse text-base">Loading your settings...</div>
      </div>
    )
  }

  if (authError || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="bg-card dark:bg-card/80 rounded-lg border p-5 text-center shadow-lg sm:p-6">
          <h2 className="text-destructive mb-2 text-lg font-semibold">
            Authentication Error
          </h2>
          <p className="text-muted-foreground mb-5 text-sm">
            {authError ||
              'Unable to load user profile. Please try logging in again.'}
          </p>
          <Button onClick={() => push('/login')} variant="ghost">
            Return to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-3 py-6 sm:px-4 lg:px-6">
      <div className="mx-auto w-full max-w-xl space-y-6">
        <header>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your account settings and preferences.
          </p>
        </header>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Profile</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center">
                <Avatar className="h-16 w-16 text-base">
                  <AvatarImage
                    src={profile.avatar_url || undefined}
                    alt={`${profile.full_name}'s avatar`}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {generateInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <h3 className="text-foreground text-lg font-semibold">
                    {profile.full_name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    @{profile.user_name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    ID: {profile.user_id}
                  </p>
                </div>
              </div>
              <div className="sm:flex-shrink-0">
                <div className="bg-primary/10 text-primary dark:bg-primary/20 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
                  {profile.division}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Password</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <form className="space-y-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="currentPassword"
                  className="text-sm font-medium"
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
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-sm font-medium">
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
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs font-medium"
                  disabled
                >
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-foreground text-sm font-medium">
                Theme Preference
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    {theme === 'light' ? (
                      <Sun className="h-4 w-4" />
                    ) : theme === 'dark' ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Laptop className="h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setTheme('light')}
                    className="cursor-pointer text-sm"
                  >
                    <Sun className="mr-2 h-3.5 w-3.5" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme('dark')}
                    className="cursor-pointer text-sm"
                  >
                    <Moon className="mr-2 h-3.5 w-3.5" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme('system')}
                    className="cursor-pointer text-sm"
                  >
                    <Laptop className="mr-2 h-3.5 w-3.5" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Logout */}
        <div className="flex justify-end pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:border-destructive/80 hover:bg-destructive/10 hover:text-destructive text-sm font-medium transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  )
}
