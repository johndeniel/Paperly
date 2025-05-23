'use client'

import type React from 'react'
import { format, parse } from 'date-fns'
import { cn } from '@/lib/utils'
import { PriorityBadge } from '@/components/priority-badge'
import { StatusBadge } from '@/components/status-badge'
import type { Task } from '@/lib/types'

interface TaskListProps {
  tasks: Task[]
  onTaskClick: (taskId: string) => void
  onToggleTaskCompletion: (taskId: string, event: React.MouseEvent) => void
}

export function TaskList({ tasks, onTaskClick }: TaskListProps) {
  // Function to parse a date string in "dd-MM-yyyy" format into a Date object
  const parseDate = (dateString: string): Date =>
    parse(dateString, 'dd-MM-yyyy', new Date())

  return (
    // Container with vertical spacing and padding
    <div className="space-y-2 p-4">
      {tasks.map(task => {
        // Determine if the task is completed by checking if dateCompleted exists
        const isCompleted = task.dateCompleted !== undefined

        return (
          // Task card container with hover effects and conditional styling for completed tasks
          <div
            key={task.id}
            className={cn(
              'group flex items-center gap-4 rounded-lg px-4 py-3 transition-all duration-200',
              'cursor-pointer',
              'hover:border-border/10 border border-transparent',
              isCompleted && 'bg-muted/5 opacity-80'
            )}
            onClick={() => onTaskClick(task.id)}
          >
            {/* Content container for task details */}
            <div className="min-w-0 flex-grow space-y-1.5">
              {/* Header: Task title and badges for status and priority */}
              <div className="flex items-start justify-between gap-4">
                <h3
                  className={cn(
                    'max-w-[280px] truncate text-sm font-medium tracking-tight',
                    isCompleted && 'text-muted-foreground line-through'
                  )}
                >
                  {task.title}
                </h3>
                {/* Badge container with status and priority icons */}
                <div className="flex items-center gap-2 opacity-80 transition-opacity group-hover:opacity-100">
                  <StatusBadge task={task} />
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>

              {/* Optional description section, truncated for layout */}
              {task.description && (
                <p
                  className={cn(
                    'text-muted-foreground max-w-full truncate text-xs',
                    isCompleted && 'line-through opacity-60'
                  )}
                >
                  {task.description}
                </p>
              )}

              {/* Footer: Display the due or completion date */}
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>
                  {isCompleted
                    ? `Completed on ${format(
                        parseDate(task.dateCompleted || task.dueDate),
                        'MMMM d, yyyy'
                      )}`
                    : `Due on ${format(parseDate(task.dueDate), 'MMMM d, yyyy')}`}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
