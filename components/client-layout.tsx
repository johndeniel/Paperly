'use client'

import { Toaster } from '@/components/ui/sonner'
import { useRouter } from 'next/navigation'
import { FloatingDock } from '@/components/ui/floating-dock'
import { Home, Calendar } from 'lucide-react'

const links = [
  {
    title: 'Home',
    icon: (
      <Home className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: '/',
    view: 'home',
  },
  {
    title: 'Calendar',
    icon: (
      <Calendar className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: '/calendar',
    view: 'calendar',
  },
]

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <main className="flex-grow overflow-auto bg-white dark:bg-black">
        <div className="mx-auto h-full w-full px-4 md:px-8">{children}</div>
      </main>

      {/* Navigation dock */}
      <FloatingDock
        items={links.map(link => ({
          ...link,
          onClick: () => router.push(link.href),
        }))}
        desktopClassName="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
        mobileClassName="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
      />

      <Toaster
        toastOptions={{
          classNames: {
            toast: `
              group toast 
              bg-white dark:bg-black 
              text-black dark:text-white 
              border border-gray-200 dark:border-gray-800
              shadow-lg 
              pointer-events-auto
            `,
          },
        }}
      />
    </div>
  )
}
