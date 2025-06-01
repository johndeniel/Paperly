import { Badge } from '@/components/ui/badge'
import { cva, type VariantProps } from 'class-variance-authority'
import { Paperwork } from '@/lib/types'

import { getCompletionStatus } from '@/lib/task-utils'

const statusBadgeVariants = cva(
  'inline-flex items-center font-medium transition-colors',
  {
    variants: {
      status: {
        'completed on time':
          'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
        'completed late':
          'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
        active:
          'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
        overdue:
          'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15',
      },
    },
    defaultVariants: {
      status: 'active',
    },
  }
)

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  task: Paperwork
}

export const StatusBadge = ({ task }: StatusBadgeProps) => {
  const status = getCompletionStatus(task)

  const statusLabels = {
    'completed on time': 'Completed On Time',
    'completed late': 'Completed Late',
    active: 'Active',
    overdue: 'Overdue',
  }

  return (
    <Badge
      variant="outline"
      className={statusBadgeVariants({ status })}
      data-status={status}
    >
      {statusLabels[status]}
    </Badge>
  )
}

export { statusBadgeVariants }
