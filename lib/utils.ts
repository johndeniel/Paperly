import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates user initials from full name for avatar fallback
 */
export function generateInitials(name: string = ''): string {
  if (!name || typeof name !== 'string') return '??'
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}
