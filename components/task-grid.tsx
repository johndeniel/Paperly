'use client'

import type React from 'react'
import { format, parse } from 'date-fns'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { PriorityBadge } from '@/components/priority-badge'
import { StatusBadge } from '@/components/status-badge'
import type { Paperwork } from '@/lib/types'

/**
 * Props for TaskGrid component.
 */
interface TaskGridProps {
  tasks: Paperwork[]
  onTaskClick: (taskId: string) => void
  onToggleTaskCompletion: (taskId: string, event: React.MouseEvent) => void
}

/**
 * Parses a date string in "dd-MM-yyyy" format to a JavaScript Date object.
 *
 * @param dateString - The date string in dd-MM-yyyy format.
 * @returns A JavaScript Date object.
 */
const parseDate = (dateString: string): Date => {
  return parse(dateString, 'dd-MM-yyyy', new Date())
}

/**
 * TaskGrid component displays tasks in a responsive grid layout.
 * Each task is rendered as a card with its title, description, badges, and formatted dates.
 *
 * @param tasks - Array of tasks to display.
 * @param onTaskClick - Callback function when a task card is clicked.
 */
export function TaskGrid({ tasks, onTaskClick }: TaskGridProps) {
  return (
    // Grid container with responsive columns and gap between cards
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {tasks.map(task => {
        // Determine if the task is completed
        const isCompleted = task.actual_completion_date !== undefined

        return (
          <div
            key={task.paperwork_id}
            className={cn(
              'bg-background border-border/40 cursor-pointer overflow-hidden rounded-md border transition-colors',
              isCompleted && 'bg-muted/5' // Apply muted background if task is completed
            )}
            onClick={() => onTaskClick(task.paperwork_id)}
          >
            {/* Card content container with fixed height */}
            <div className="flex h-[170px] flex-col p-3.5">
              {/* Header section: Task title and PriorityBadge */}
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3
                  className={cn(
                    'h-10 flex-1 text-sm font-medium',
                    isCompleted && 'text-muted-foreground'
                  )}
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textDecoration: isCompleted ? 'line-through' : 'none',
                  }}
                >
                  {task.paper_title}
                </h3>
                {/* Priority Badge */}
                <PriorityBadge priority={task.processing_priority} />
              </div>

              {/* Optional description section */}
              {task.paper_description && (
                <p
                  className={cn(
                    'text-muted-foreground mb-auto h-9 text-xs',
                    isCompleted && 'text-muted-foreground/70'
                  )}
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: '1.5',
                    textDecoration: isCompleted ? 'line-through' : 'none',
                  }}
                >
                  {task.paper_description}
                </p>
              )}

              {/* Footer section: Separator, formatted date, and StatusBadge */}
              <div className="mt-auto pt-2.5">
                <Separator className="mb-2.5 opacity-60" />
                <div className="text-muted-foreground flex items-center justify-between text-[0.7rem]">
                  {/* Display completion date if completed; otherwise, show due date */}
                  <span>
                    {isCompleted
                      ? `Completed on ${format(parseDate(task.actual_completion_date || task.target_completion_date), 'MMM d, yyyy')}`
                      : `Due on ${format(parseDate(task.target_completion_date), 'MMM d, yyyy')}`}
                  </span>
                  {/* Status Badge */}
                  <StatusBadge task={task} />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
