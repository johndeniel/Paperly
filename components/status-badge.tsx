import { Badge } from '@/components/ui/badge'
import { cva, type VariantProps } from 'class-variance-authority'
import { Paperwork } from '@/lib/types'

import { getCompletionStatus } from '@/lib/task-utils'

const statusBadgeVariants = cva(
  'inline-flex items-center font-medium transition-colors',
  {
    variants: {
      _status: {
        Punctual:
          'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
        Delayed:
          'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
        Active:
          'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
        Overdue:
          'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15',
      },
    },
    defaultVariants: {
      _status: 'Active',
    },
  }
)

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  status: Paperwork
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const _status = getCompletionStatus(status)

  const statusLabels = {
    Punctual: 'Punctual',
    Delayed: 'Delayed',
    Active: 'Active',
    Overdue: 'Overdue',
  }

  return (
    <Badge
      variant="outline"
      className={statusBadgeVariants({ _status })}
      data-status={status}
    >
      {statusLabels[_status]}
    </Badge>
  )
}

export { statusBadgeVariants }
