import { cn } from '@/lib/utils'
import type { Paperwork, Status } from '@/lib/types'
import { isPast, isToday, isBefore, isSameDay, parse } from 'date-fns'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

/**
 * Parses a date string in "dd-MM-yyyy" format into a JavaScript Date object.
 * @param dateString - The date string in MySQL format (dd-MM-yyyy).
 * @returns A Date object.
 */
const parseDate = (dateString: string): Date => {
  return parse(dateString, 'dd-MM-yyyy', new Date())
}

/**
 * Determines the completion status of a task.
 * Uses the existence of dateCompleted to decide if a task is complete.
 *
 * @param task - The task object.
 * @returns A CompletionStatus value ("active", "overdue", "completed on time", or "completed late").
 */
export const getCompletionStatus = (task: Paperwork): Status => {
  // Determine if the task is completed by checking if dateCompleted exists
  const isCompleted = task.actual_completion_date !== undefined

  // If the task is not completed, check if it's overdue.
  if (!isCompleted) {
    const dueDate = parseDate(task.target_completion_date)
    return isPast(dueDate) && !isToday(dueDate) ? 'overdue' : 'active'
  }

  // If the task is completed, compare the completion date with the due date.
  const dueDate = parseDate(task.target_completion_date)
  const completedDate = parseDate(task.actual_completion_date!)

  return isBefore(completedDate, dueDate) || isSameDay(completedDate, dueDate)
    ? 'completed on time'
    : 'completed late'
}

/**
 * StatusBadge component renders a badge showing the task's completion status.
 *
 * @param task - The task object.
 */
export const StatusBadge = ({ task }: { task: Paperwork }) => {
  const status = getCompletionStatus(task)

  const statusConfig = {
    'completed on time': {
      label: 'Completed On Time',
      className: 'text-green-700 bg-green-50 border-green-200',
      icon: <CheckCircle className="mr-1 h-2.5 w-2.5" />,
    },
    'completed late': {
      label: 'Completed Late',
      className: 'text-amber-700 bg-amber-50 border-amber-200',
      icon: <Clock className="mr-1 h-2.5 w-2.5" />,
    },
    active: {
      label: 'Active',
      className: 'text-blue-700 bg-blue-50 border-blue-200',
      icon: null,
    },
    overdue: {
      label: 'Overdue',
      className: 'text-red-700 bg-red-50 border-red-200',
      icon: <AlertCircle className="mr-1 h-2.5 w-2.5" />,
    },
  }

  const { label, className, icon } = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium',
        'shadow-sm',
        className
      )}
    >
      {icon}
      {label}
    </span>
  )
}
