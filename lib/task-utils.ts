import { format, parse, isPast, isToday, isBefore, isSameDay } from 'date-fns'
import type { Paperwork, Status, Priority } from '@/lib/types'

/**
 * Parse date string from dd-MM-yyyy format to JavaScript Date
 * @param dateString Date string in dd-MM-yyyy format
 * @returns JavaScript Date object
 */
export const parseDate = (dateString: string): Date => {
  try {
    return parse(dateString, 'dd-MM-yyyy', new Date())
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.warn('Failed to parse date:', dateString)
    return new Date() // Return current date as fallback
  }
}

/**
 * Format JavaScript Date to dd-MM-yyyy string
 * @param date JavaScript Date object
 * @returns Date string in dd-MM-yyyy format
 */
export const formatDateToString = (date: Date): string => {
  try {
    return format(date, 'dd-MM-yyyy')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.warn('Failed to format date:', date)
    return format(new Date(), 'dd-MM-yyyy') // Return current date as fallback
  }
}

/**
 * Get the completion status of a task based on its dates.
 * Uses the existence of actual_completion_date to decide if a task is completed.
 *
 * @param task Paperwork object
 * @returns Status (active, overdue, completed on time, or completed late)
 */
export const getCompletionStatus = (task: Paperwork): Status => {
  // Check if task has valid target completion date
  if (!task.target_completion_date) {
    return 'active' // Default status if no target date
  }

  // Determine if the task is completed by checking if actual_completion_date exists and is not null/empty
  const isCompleted =
    task.actual_completion_date !== undefined &&
    task.actual_completion_date !== null &&
    task.actual_completion_date.trim() !== ''

  if (!isCompleted) {
    // If task is not completed and due date is in the past (and not today), it's overdue; otherwise, it's active.
    const targetDate = parseDate(task.target_completion_date)
    return isPast(targetDate) && !isToday(targetDate) ? 'overdue' : 'active'
  }

  // If task is completed, compare the completion date with the due date.
  const dueDate = parseDate(task.target_completion_date)
  // Type assertion is safe here because we've already checked that actual_completion_date exists and is not empty
  const completedDate = parseDate(task.actual_completion_date!)

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
export const filterPaperworks = (
  tasks: Paperwork[],
  searchQuery: string,
  priorityFilter: Priority[],
  statusFilter: Status[]
): Paperwork[] => {
  if (!Array.isArray(tasks)) {
    console.warn('filterPaperworks: tasks is not an array', tasks)
    return []
  }

  return tasks.filter(task => {
    // Ensure task object has required properties
    if (!task || typeof task !== 'object') {
      return false
    }

    // Search filter - search in multiple fields for better UX
    const searchTerm = searchQuery.toLowerCase().trim()
    const matchesSearch =
      searchQuery === '' ||
      searchTerm === '' ||
      task.paperwork_id?.toLowerCase().includes(searchTerm) ||
      task.paper_title?.toLowerCase().includes(searchTerm) ||
      task.paper_description?.toLowerCase().includes(searchTerm)

    // Priority filter
    const matchesPriority =
      priorityFilter.length === 0 ||
      (task.processing_priority &&
        priorityFilter.includes(task.processing_priority))

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
export const sortPaperworks = (
  tasks: Paperwork[],
  sortBy: 'date' | 'priority' | 'title' | 'status',
  sortDirection: 'asc' | 'desc'
): Paperwork[] => {
  if (!Array.isArray(tasks)) {
    console.warn('sortPaperworks: tasks is not an array', tasks)
    return []
  }

  return [...tasks].sort((a, b) => {
    // Ensure both tasks are valid objects
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
      return 0
    }

    // Sort by selected criteria
    if (sortBy === 'date') {
      // Handle cases where dates might be missing
      if (!a.target_completion_date && !b.target_completion_date) return 0
      if (!a.target_completion_date) return sortDirection === 'asc' ? 1 : -1
      if (!b.target_completion_date) return sortDirection === 'asc' ? -1 : 1

      const dateA = parseDate(a.target_completion_date).getTime()
      const dateB = parseDate(b.target_completion_date).getTime()
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
    } else if (sortBy === 'priority') {
      const priorityOrder: Record<Priority, number> = {
        High: 3,
        Medium: 2,
        Low: 1,
      }

      // Handle cases where priority might be missing
      const priorityA = a.processing_priority
        ? priorityOrder[a.processing_priority] || 0
        : 0
      const priorityB = b.processing_priority
        ? priorityOrder[b.processing_priority] || 0
        : 0

      return sortDirection === 'asc'
        ? priorityA - priorityB
        : priorityB - priorityA
    } else if (sortBy === 'status') {
      // Updated mapping to match Status values
      const statusOrder: Record<Status, number> = {
        overdue: 4,
        active: 3,
        'completed late': 2,
        'completed on time': 1,
      }

      const statusA = statusOrder[getCompletionStatus(a)] || 0
      const statusB = statusOrder[getCompletionStatus(b)] || 0

      return sortDirection === 'asc' ? statusA - statusB : statusB - statusA
    } else {
      // Sort by title (default)
      const titleA = a.paper_title || ''
      const titleB = b.paper_title || ''

      return sortDirection === 'asc'
        ? titleA.localeCompare(titleB)
        : titleB.localeCompare(titleA)
    }
  })
}

/**
 * Checks if a task's due date is the same as the given day.
 *
 * @param task - The task to check.
 * @param day - The day to compare against.
 * @returns Boolean indicating if the task is on the given day.
 */
export const isTaskOnDay = (task: Paperwork, day: Date): boolean => {
  if (!task.target_completion_date || !day) {
    return false
  }

  try {
    const taskDate = parseDate(task.target_completion_date)
    return (
      taskDate.getDate() === day.getDate() &&
      taskDate.getMonth() === day.getMonth() &&
      taskDate.getFullYear() === day.getFullYear()
    )
  } catch (error) {
    console.warn('Error comparing task date with day:', error)
    return false
  }
}

/**
 * Checks if a date is today or in the future.
 *
 * @param day - The date to check.
 * @returns Boolean indicating if the date is today or in the future.
 */
export const isCurrentOrFuture = (day: Date): boolean => {
  if (!day || !(day instanceof Date)) {
    return false
  }

  try {
    return isToday(day) || day > new Date()
  } catch (error) {
    console.warn('Error checking if date is current or future:', error)
    return false
  }
}
