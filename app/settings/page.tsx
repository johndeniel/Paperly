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
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { logoutUser } from '@/server/action/logout-user'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  const profile = {
    avatarUrl: '/vercel.svg',
    name: 'Alex Johnson',
    username: 'alexj',
    division: 'Engineering',
  }
  const { push } = useRouter()

  const handleLogout = async () => {
    try {
      const message = await logoutUser()
      toast.success(message)
      push('/login')
    } catch (error: unknown) {
      toast.error((error as Error).message)
    }
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
                  </Avatar>
                  <div className="ml-4">
                    <h3 className="text-base leading-tight font-medium">
                      {profile.name}
                    </h3>
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      @{profile.username}
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
