'use client'

import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  hasActiveFilters: boolean
  onClearFilters: () => void
  onAddPaperwork: () => void
}

export function EmptyState({
  hasActiveFilters,
  onClearFilters,
  onAddPaperwork,
}: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-12">
      <div className="bg-muted/20 mb-4 rounded-full p-4">
        <Search className="text-muted-foreground h-6 w-6" />
      </div>
      <h3 className="mb-1 text-lg font-medium">No paper found</h3>
      <p className="text-muted-foreground mb-4 text-sm">
        {hasActiveFilters
          ? 'Try adjusting your filters or search query'
          : 'Submit a paper to get started'}
      </p>
      {hasActiveFilters ? (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          Clear all filters
        </Button>
      ) : (
        <Button variant="default" size="sm" onClick={onAddPaperwork}>
          <Plus className="mr-2 h-4 w-4" />
          New Paper
        </Button>
      )}
    </div>
  )
}
