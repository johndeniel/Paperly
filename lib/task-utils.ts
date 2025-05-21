import { format, parse, isPast, isToday, isBefore, isSameDay } from 'date-fns'
import type { Task, CompletionStatus, Priority } from '@/lib/types'

/**
 * Parse date string from dd-MM-yyyy format to JavaScript Date
 * @param dateString Date string in dd-MM-yyyy format
 * @returns JavaScript Date object
 */
export const parseDate = (dateString: string): Date => {
  return parse(dateString, 'dd-MM-yyyy', new Date())
}

/**
 * Format JavaScript Date to dd-MM-yyyy string
 * @param date JavaScript Date object
 * @returns Date string in dd-MM-yyyy format
 */
export const formatDateToString = (date: Date): string => {
  return format(date, 'dd-MM-yyyy')
}

/**
 * Get the completion status of a task based on its dates.
 * Uses the existence of dateCompleted to decide if a task is completed.
 *
 * @param task Task object
 * @returns CompletionStatus (active, overdue, completed on time, or completed late)
 */
export const getCompletionStatus = (task: Task): CompletionStatus => {
  // Determine if the task is completed by checking if dateCompleted exists
  const isCompleted = task.dateCompleted !== undefined

  if (!isCompleted) {
    // If task is not completed and due date is in the past (and not today), it's overdue; otherwise, it's active.
    return isPast(parseDate(task.dueDate)) && !isToday(parseDate(task.dueDate))
      ? 'overdue'
      : 'active'
  }

  // If task is completed, compare the completion date with the due date.
  const dueDate = parseDate(task.dueDate)
  const completedDate = parseDate(task.dateCompleted!)

  // If completed on or before due date, it's on time; otherwise, it's completed late.
  return isBefore(completedDate, dueDate) || isSameDay(completedDate, dueDate)
    ? 'completed on time'
    : 'completed late'
}

/**
 * Filter tasks based on search query, priority, and status filters.
 * @param tasks Array of tasks to filter
 * @param searchQuery Search query string
 * @param priorityFilter Array of priority filters
 * @param statusFilter Array of status filters
 * @returns Filtered array of tasks
 */
export const filterTasks = (
  tasks: Task[],
  searchQuery: string,
  priorityFilter: Priority[],
  statusFilter: CompletionStatus[]
): Task[] => {
  return tasks.filter(task => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase())

    // Priority filter
    const matchesPriority =
      priorityFilter.length === 0 || priorityFilter.includes(task.priority)

    // Status filter
    const taskStatus = getCompletionStatus(task)
    const matchesStatus =
      statusFilter.length === 0 || statusFilter.includes(taskStatus)

    return matchesSearch && matchesPriority && matchesStatus
  })
}

/**
 * Sort tasks based on sort criteria and direction.
 * @param tasks Array of tasks to sort
 * @param sortBy Sort criteria ("date" | "priority" | "title" | "status")
 * @param sortDirection Sort direction ("asc" | "desc")
 * @returns Sorted array of tasks
 */
export const sortTasks = (
  tasks: Task[],
  sortBy: 'date' | 'priority' | 'title' | 'status',
  sortDirection: 'asc' | 'desc'
): Task[] => {
  return [...tasks].sort((a, b) => {
    // Sort by selected criteria
    if (sortBy === 'date') {
      const dateA = parseDate(a.dueDate).getTime()
      const dateB = parseDate(b.dueDate).getTime()
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
    } else if (sortBy === 'priority') {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 }
      const priorityA = priorityOrder[a.priority]
      const priorityB = priorityOrder[b.priority]
      return sortDirection === 'asc'
        ? priorityA - priorityB
        : priorityB - priorityA
    } else if (sortBy === 'status') {
      // Updated mapping to match CompletionStatus values
      const statusOrder = {
        overdue: 4,
        active: 3,
        'completed late': 2,
        'completed on time': 1,
      }
      const statusA = statusOrder[getCompletionStatus(a)]
      const statusB = statusOrder[getCompletionStatus(b)]
      return sortDirection === 'asc' ? statusA - statusB : statusB - statusA
    } else {
      // Sort by title (default)
      return sortDirection === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title)
    }
  })
}
