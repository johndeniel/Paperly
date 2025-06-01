'use client'

import { format, parse } from 'date-fns'
import { Calendar, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PriorityBadge } from '@/components/priority-badge'
import { StatusBadge } from '@/components/status-badge'
import type { Paperwork } from '@/lib/types'

/**
 * Props for the TaskDialog component.
 */
interface TaskDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | null
  tasks: Paperwork[]
  onAddTaskClick: () => void
  onTaskClick: (taskId: string) => void
  isCurrentOrFuture: (date: Date) => boolean
}

const parseDate = (dateString: string): Date => {
  return parse(dateString, 'dd-MM-yyyy', new Date())
}

export const TaskDialog = ({
  isOpen,
  onOpenChange,
  selectedDate,
  tasks,
  onAddTaskClick,
  onTaskClick,
  isCurrentOrFuture,
}: TaskDialogProps) => {
  // Filters tasks to only those scheduled for the specified day.
  const getTasksForDay = (day: Date): Paperwork[] => {
    return tasks.filter(task => {
      const taskDate = parseDate(task.target_completion_date)
      return (
        taskDate.getDate() === day.getDate() &&
        taskDate.getMonth() === day.getMonth() &&
        taskDate.getFullYear() === day.getFullYear()
      )
    })
  }

  // Retrieve tasks for the currently selected date.
  const currentDateTasks = selectedDate ? getTasksForDay(selectedDate) : []

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-content overflow-hidden p-0 sm:max-w-[450px]">
        {/* Dialog header: displays the formatted date and the number of tasks */}
        <DialogHeader className="px-6 pt-5 pb-4">
          <div className="space-y-1">
            <DialogTitle className="text-base font-normal tracking-tight">
              {selectedDate
                ? format(selectedDate, 'EEEE, MMMM d, yyyy')
                : 'Tasks'}
            </DialogTitle>
            <p className="text-muted-foreground flex items-center text-[10px]">
              <Calendar className="mr-1.5 h-3 w-3 opacity-70" />
              {currentDateTasks.length}{' '}
              {currentDateTasks.length === 1 ? 'task' : 'tasks'} scheduled
            </p>
          </div>
        </DialogHeader>

        <div>
          {/* Display an empty state if no tasks are scheduled for the selected date */}
          {selectedDate && currentDateTasks.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-3 py-10 text-center">
              <div className="bg-muted/10 rounded-full p-3">
                <Calendar className="h-5 w-5 opacity-50" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium">No tasks for this day</p>
                <p className="text-muted-foreground max-w-[200px] text-[10px]">
                  Document you add for this date will appear here
                </p>
              </div>
            </div>
          ) : (
            // Render a scrollable list of tasks for the selected date.
            <div className="scroll-area-container">
              <ScrollArea className="h-[360px]">
                <div className="space-y-3 px-6 py-2">
                  {selectedDate &&
                    currentDateTasks.map(task => {
                      // Determine if the task is completed by checking if dateCompleted is not undefined
                      const isCompleted =
                        task.actual_completion_date !== undefined

                      return (
                        <Card
                          key={task.paperwork_id}
                          className={cn(
                            'h-auto cursor-pointer border-transparent transition-all dark:border-white/10'
                          )}
                          onClick={() => onTaskClick(task.paperwork_id)}
                        >
                          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                            {/* Task title with truncation and styling for completed tasks */}
                            <h3
                              className={cn(
                                'flex-grow truncate pr-2 text-xs font-semibold',
                                isCompleted &&
                                  'text-muted-foreground line-through'
                              )}
                              title={task.paper_title}
                            >
                              {task.paper_title}
                            </h3>
                            {/* Displays the task's priority badge */}
                            <div>
                              <PriorityBadge
                                priority={task.processing_priority}
                              />
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-2 px-3 pt-1 pb-3">
                            {/* Optional task description with truncation */}
                            {task.paper_description && (
                              <p
                                className={cn(
                                  'text-muted-foreground overflow-hidden text-[10px] text-ellipsis whitespace-nowrap',
                                  isCompleted && 'line-through'
                                )}
                                title={task.paper_description}
                              >
                                {task.paper_description}
                              </p>
                            )}
                            <div className="px-0">
                              <Separator className="my-2 w-full" />
                            </div>
                            {/* Task metadata: due date or completion date */}
                            <div className="flex items-center justify-between">
                              <div>
                                {isCompleted ? (
                                  <p className="text-muted-foreground text-[10px]">
                                    Completed{' '}
                                    <span className="font-medium">
                                      {format(
                                        parseDate(
                                          task.actual_completion_date ||
                                            task.target_completion_date
                                        ),
                                        'MMMM d, yyyy'
                                      )}
                                    </span>
                                  </p>
                                ) : (
                                  <p className="text-muted-foreground text-[10px]">
                                    Due{' '}
                                    <span className="font-medium">
                                      {format(
                                        parseDate(task.target_completion_date),
                                        'MMMM d, yyyy'
                                      )}
                                    </span>
                                  </p>
                                )}
                              </div>
                              {/* Displays the task completion status badge */}
                              <StatusBadge task={task} />
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Dialog footer: provides action buttons to close the dialog or add a new task */}
        <DialogFooter className="flex justify-between px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs font-normal"
          >
            Close
          </Button>
          {selectedDate && isCurrentOrFuture(selectedDate) && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddTaskClick}
              className="h-8 px-3 text-xs font-normal"
            >
              <Plus className="mr-1.5 h-3 w-3" /> Add Document
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
