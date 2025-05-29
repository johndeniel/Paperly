/**
 * Defines the structure of a token payload used for authentication.
 */
export interface AuthTokenPayload {
  user_id: string
  full_name: string
  user_name: string
  avatar_url: string
  division: string
  exp?: number
  iat?: number
}

/**
 * Represents the structure of a user record in the system.
 */
export interface UserEntity {
  user_id: string
  full_name: string
  user_name: string
  avatar_url: string
  password_hash: string
  department: string
}

// View mode options for task display
export type ViewMode = 'list' | 'grid'

// Task sort options
export type SortOption = 'date' | 'priority' | 'title' | 'status'

// Sort direction options
export type SortDirection = 'asc' | 'desc'

// Priority levels for tasks
export type Priority = 'High' | 'Medium' | 'Low'

// Task completion status types
export type Status =
  | 'active'
  | 'overdue'
  | 'completed on time'
  | 'completed late'

// Task interface
export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  dueDate: string
  dateCompleted?: string
}

// Filter state interface
export interface FilterState {
  priorityFilter: Priority[]
  statusFilter: Status[]
  searchQuery: string
}

// Sort state interface
export interface SortState {
  sortBy: SortOption
  sortDirection: SortDirection
}
