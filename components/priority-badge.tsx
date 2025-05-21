import { cn } from '@/lib/utils'
import type { Priority } from '@/lib/types'

/**
 * PriorityBadge component renders a badge indicating task priority.
 *
 * @param priority - The priority level ("High", "Medium", or "Low").
 */
export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  // Define styling and labels for each priority level using standard Tailwind classes
  const priorityConfig = {
    High: {
      label: 'High',
      className: 'text-red-700 bg-red-50 border-red-200',
    },
    Medium: {
      label: 'Medium',
      className: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    Low: {
      label: 'Low',
      className: 'text-green-700 bg-green-50 border-green-200',
    },
  }

  const { label, className } = priorityConfig[priority]

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium',
        'whitespace-nowrap shadow-sm',
        className
      )}
    >
      {label}
    </div>
  )
}
