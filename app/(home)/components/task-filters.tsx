'use client'

import React from 'react'
import { X, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import type { Priority, CompletionStatus, FilterState } from '@/lib/types'

interface TaskFiltersProps {
  filterState: FilterState
  onTogglePriorityFilter: (priority: Priority) => void
  onToggleStatusFilter: (status: CompletionStatus) => void
  onClearFilters: () => void
}

// Define filter options for priority and status
const PRIORITY_OPTIONS: Priority[] = ['High', 'Medium', 'Low']
const STATUS_OPTIONS: CompletionStatus[] = [
  'active',
  'overdue',
  'completed on time',
  'completed late',
]

export function TaskFilters({
  filterState,
  onTogglePriorityFilter,
  onToggleStatusFilter,
  onClearFilters,
}: TaskFiltersProps) {
  const { priorityFilter, statusFilter, searchQuery } = filterState

  // Calculate the number of active filters to display
  const activeFiltersCount = React.useMemo(
    () => priorityFilter.length + statusFilter.length + (searchQuery ? 1 : 0),
    [priorityFilter, statusFilter, searchQuery]
  )

  // Format filter labels for display
  const formatFilterLabel = (filter: string) => {
    switch (filter) {
      case 'completed on time':
        return 'Completed On Time'
      case 'completed late':
        return 'Completed Late'
      default:
        return filter.charAt(0).toUpperCase() + filter.slice(1)
    }
  }

  return (
    <DropdownMenu>
      {/* Filter Button */}
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Filter className="mr-2 h-4 w-4 opacity-70" />
          Filters
          {/* Display active filter count if filters are applied */}
          {activeFiltersCount > 0 && (
            <span
              className="bg-primary text-primary-foreground ml-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px]"
              aria-label={`${activeFiltersCount} active filters`}
            >
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown Menu Content */}
      <DropdownMenuContent
        align="end"
        className="w-56 border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div className="p-2">
          {/* Priority Filters */}
          <div className="mb-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            Priority
          </div>
          {PRIORITY_OPTIONS.map(priority => (
            <DropdownMenuCheckboxItem
              key={priority}
              checked={priorityFilter.includes(priority)}
              onCheckedChange={() => onTogglePriorityFilter(priority)}
              className="rounded-md"
            >
              {formatFilterLabel(priority)} Priority
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator className="my-2 bg-neutral-200 dark:bg-neutral-700" />

          {/* Status Filters */}
          <div className="mb-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            Status
          </div>
          {STATUS_OPTIONS.map(status => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={statusFilter.includes(status)}
              onCheckedChange={() => onToggleStatusFilter(status)}
              className="rounded-md"
            >
              {formatFilterLabel(status)}
            </DropdownMenuCheckboxItem>
          ))}

          {/* Clear Filters Button (Visible only if filters are active) */}
          {activeFiltersCount > 0 && (
            <>
              <DropdownMenuSeparator className="my-2 bg-neutral-200 dark:bg-neutral-700" />
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-8 w-full justify-start rounded-md text-xs"
                aria-label="Clear all filters"
              >
                <X className="mr-2 h-3.5 w-3.5 opacity-70" />
                Clear all filters
              </Button>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
