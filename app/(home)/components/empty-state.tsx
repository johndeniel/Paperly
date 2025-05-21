'use client'

import { Search, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  hasActiveFilters: boolean
  onClearFilters: () => void
  onAddTask: () => void
  isLoading?: boolean
}

/**
 * EmptyState component displays a message when no tasks are found.
 * - If loading, shows a loading indicator
 * - If filters are active, it provides an option to clear them
 * - If no filters are active, it suggests adding a new task
 */
export function EmptyState({
  hasActiveFilters,
  onClearFilters,
  onAddTask,
  isLoading = false,
}: EmptyStateProps) {
  // Show loading state if isLoading is true
  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-12">
        <div className="bg-muted/20 mb-4 rounded-full p-4">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
        <h3 className="mb-1 text-lg font-medium">Loading documents</h3>
        <p className="text-muted-foreground text-sm">Please wait...</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center py-12">
      {/* Icon container with subtle background styling */}
      <div className="bg-muted/20 mb-4 rounded-full p-4">
        <Search className="text-muted-foreground h-6 w-6" />
      </div>

      {/* Main heading */}
      <h3 className="mb-1 text-lg font-medium">No documents found</h3>

      {/* Description based on whether filters are applied */}
      <p className="text-muted-foreground mb-4 text-sm">
        {hasActiveFilters
          ? 'Try adjusting your filters or search query'
          : 'Add a new document to get started'}
      </p>

      {/* Conditional rendering for action buttons */}
      {hasActiveFilters ? (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          Clear all filters
        </Button>
      ) : (
        <Button variant="default" size="sm" onClick={onAddTask}>
          <Plus className="mr-2 h-4 w-4" />
          Add Document
        </Button>
      )}
    </div>
  )
}
