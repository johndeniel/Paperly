'use client'

import { Laptop, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen px-3 py-6 sm:px-4 lg:px-6">
      <div className="mx-auto w-full max-w-xl space-y-6">
        <header>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your preferences.
          </p>
        </header>

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
      </div>
    </div>
  )
}
