import { Badge } from '@/components/ui/badge'
import { cva, type VariantProps } from 'class-variance-authority'
import { Priority } from '@/lib/types'

const priorityBadgeVariants = cva(
  'inline-flex items-center font-medium transition-colors',
  {
    variants: {
      priority: {
        High: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15',
        Medium:
          'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
        Low: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
      },
    },
    defaultVariants: {
      priority: 'Medium',
    },
  }
)

interface PriorityBadgeProps
  extends VariantProps<typeof priorityBadgeVariants> {
  priority: Priority
  size?: 'sm' | 'default'
}

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={priorityBadgeVariants({ priority })}
      data-priority={priority.toLowerCase()}
    >
      {priority}
    </Badge>
  )
}

export { priorityBadgeVariants }
