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

export type ViewMode = 'list' | 'grid'

export type SortOption = 'date' | 'priority' | 'title' | 'status'

export type SortDirection = 'asc' | 'desc'

export type Priority = 'High' | 'Medium' | 'Low'

export type Status = 'Active' | 'Overdue' | 'Punctual' | 'Delayed'

export interface Paperwork {
  paperwork_id: string
  paper_title: string
  paper_description: string
  processing_priority: Priority
  target_completion_date: string
  actual_completion_date?: string
}

export interface FilterState {
  priorityFilter: Priority[]
  statusFilter: Status[]
  searchQuery: string
}

export interface SortState {
  sortBy: SortOption
  sortDirection: SortDirection
}
