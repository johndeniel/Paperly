// helper.ts - Updated with additional functions
import {
  format,
  parse,
  isPast,
  isToday,
  isBefore,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from 'date-fns'
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
 * Check if paperwork is completed based on actual_completion_date
 * @param paperwork Paperwork object
 * @returns Boolean indicating if paperwork is completed
 */
export const isPaperworkCompleted = (paperwork: Paperwork): boolean => {
  return paperwork.actual_completion_date !== undefined
}

/**
 * Get formatted completion or due date string for paperwork
 * @param paperwork Paperwork object
 * @param dateFormat Date format string (default: 'MMMM d, yyyy')
 * @returns Formatted date string with prefix
 */
export const getFormattedPaperworkDate = (
  paperwork: Paperwork,
  dateFormat: string = 'MMMM d, yyyy'
): string => {
  const isCompleted = isPaperworkCompleted(paperwork)

  if (isCompleted) {
    const completionDate =
      paperwork.actual_completion_date || paperwork.target_completion_date
    return `Completed on ${format(parseDate(completionDate), dateFormat)}`
  }

  return `Due on ${format(parseDate(paperwork.target_completion_date), dateFormat)}`
}

/**
 * Get the completion status of a task based on its dates.
 * Uses the existence of actual_completion_date to decide if a task is completed.
 *
 * @param task Paperwork object
 * @returns Status (active, overdue, completed on time, or completed late)
 */
export const getCompletionStatus = (task: Paperwork): Status => {
  if (!task.target_completion_date) {
    return 'Active'
  }

  const isCompleted =
    task.actual_completion_date !== undefined &&
    task.actual_completion_date !== null &&
    task.actual_completion_date.trim() !== ''

  if (!isCompleted) {
    const targetDate = parseDate(task.target_completion_date)
    return isPast(targetDate) && !isToday(targetDate) ? 'Overdue' : 'Active'
  }

  const dueDate = parseDate(task.target_completion_date)
  const completedDate = parseDate(task.actual_completion_date!)

  return isBefore(completedDate, dueDate) || isSameDay(completedDate, dueDate)
    ? 'Punctual'
    : 'Delayed'
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
    if (!task || typeof task !== 'object') {
      return false
    }

    const searchTerm = searchQuery.toLowerCase().trim()
    const matchesSearch =
      searchQuery === '' ||
      searchTerm === '' ||
      task.paperwork_id?.toLowerCase().includes(searchTerm) ||
      task.paper_title?.toLowerCase().includes(searchTerm) ||
      task.paper_description?.toLowerCase().includes(searchTerm)

    const matchesPriority =
      priorityFilter.length === 0 ||
      (task.processing_priority &&
        priorityFilter.includes(task.processing_priority))

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
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
      return 0
    }

    if (sortBy === 'date') {
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
      const statusOrder: Record<Status, number> = {
        Overdue: 4,
        Active: 3,
        Delayed: 2,
        Punctual: 1,
      }

      const statusA = statusOrder[getCompletionStatus(a)] || 0
      const statusB = statusOrder[getCompletionStatus(b)] || 0

      return sortDirection === 'asc' ? statusA - statusB : statusB - statusA
    } else {
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

// NEW HELPER FUNCTIONS ADDED BELOW

/**
 * Generate calendar weeks for a given month
 * @param currentDate The current date to generate calendar for
 * @returns Array of weeks, each containing 7 days (some may be null for empty cells)
 */
export const generateCalendarWeeks = (currentDate: Date): (Date | null)[][] => {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const startDay = monthStart.getDay()
  const endDay = 6 - monthEnd.getDay()

  const calendarDays = [
    ...Array(startDay).fill(null),
    ...eachDayOfInterval({ start: monthStart, end: monthEnd }),
    ...Array(endDay).fill(null),
  ]

  const weeks = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  return weeks
}

/**
 * Group paperworks by their target completion date
 * @param paperworks Array of paperwork items
 * @returns Map with date strings as keys and arrays of paperworks as values
 */
export const groupPaperworksByDate = (
  paperworks: Paperwork[]
): Map<string, Paperwork[]> => {
  const map = new Map<string, Paperwork[]>()
  paperworks.forEach(paperwork => {
    const dueDate = paperwork.target_completion_date.slice(0, 10)
    map.set(dueDate, [...(map.get(dueDate) || []), paperwork])
  })
  return map
}

/**
 * Get paperworks for a specific day
 * @param day The date to get paperworks for
 * @param paperworksByDate Map of paperworks grouped by date
 * @returns Array of paperworks for the given day
 */
export const getPaperworksForDay = (
  day: Date,
  paperworksByDate: Map<string, Paperwork[]>
): Paperwork[] => {
  return paperworksByDate.get(formatDateToString(day).slice(0, 10)) || []
}

/**
 * Determine the background color class for a calendar day based on paperwork status
 * @param day The date to check
 * @param paperworksByDate Map of paperworks grouped by date
 * @returns CSS class string for background color
 */
export const getDayBackgroundColor = (
  day: Date,
  paperworksByDate: Map<string, Paperwork[]>
): string => {
  if (!day) return ''

  const dayPaperworks = getPaperworksForDay(day, paperworksByDate)

  const hasOverdue = dayPaperworks.some(
    paperwork => getCompletionStatus(paperwork) === 'Overdue'
  )

  if (hasOverdue) {
    return 'bg-[hsl(var(--status-overdue-bg))] calendar-day-highlight'
  }

  if (dayPaperworks.length > 0) {
    return 'bg-[hsl(var(--status-active-bg))] calendar-day-highlight'
  }

  return ''
}

/**
 * Get priority border color class for paperwork
 * @param priority The priority level
 * @returns CSS class string for border color
 */
export const getPriorityBorderColor = (priority: Priority): string => {
  switch (priority) {
    case 'High':
      return 'border-l-red-400'
    case 'Medium':
      return 'border-l-amber-400'
    case 'Low':
      return 'border-l-blue-400'
    default:
      return 'border-l-gray-400'
  }
}

/**
 * Get priority indicator color class for paperwork
 * @param priority The priority level
 * @returns CSS class string for background color
 */
export const getPriorityIndicatorColor = (priority: Priority): string => {
  switch (priority) {
    case 'High':
      return 'bg-red-400'
    case 'Medium':
      return 'bg-amber-400'
    case 'Low':
      return 'bg-blue-400'
    default:
      return 'bg-gray-400'
  }
}

/**
 * Get visible and remaining paperworks for a day (used for calendar display)
 * @param dayPaperworks Array of paperworks for a specific day
 * @param maxVisible Maximum number of paperworks to show (default: 3)
 * @returns Object with visible paperworks and remaining count
 */
export const getVisiblePaperworks = (
  dayPaperworks: Paperwork[],
  maxVisible: number = 3
): { visible: Paperwork[]; remaining: number } => {
  const visible = dayPaperworks.slice(0, maxVisible)
  const remaining = dayPaperworks.length - visible.length

  return { visible, remaining }
}

/**
 * Format paperwork count text for display
 * @param count Number of paperworks
 * @returns Formatted string (e.g., "1 document", "3 documents")
 */
export const formatPaperworkCountText = (count: number): string => {
  return `${count} ${count === 1 ? 'document' : 'documents'}`
}
