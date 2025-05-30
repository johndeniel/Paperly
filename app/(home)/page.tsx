'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { PaperworkList } from '@/components/paperwork-list'
import { PaperworkGrid } from '@/components/paperwork-grid'
import { PaperworkFilter } from '@/components/paperwork-filter'
import { PaperworkSorter } from '@/components/paperwork-sorter'
import { PaperworkSearcher } from '@/components/paperwork-searcher'
import { ViewToggle } from '@/components/view-toggle'
import { EmptyState } from '@/components/empty-state'
import { PaperworkSubmissionDialog } from '@/components/paperwork-submission-dialog'
import { paperworkRetrieval } from '@/server/queries/paperwork-retrieval'
import { filterPaperworks, sortPaperworks } from '@/lib/task-utils'
import type {
  Paperwork,
  Priority,
  Status,
  ViewMode,
  SortOption,
} from '@/lib/types'

// Helper function to toggle items in an array
const _toggleArrayItem = <T,>(array: T[], item: T): T[] =>
  array.includes(item) ? array.filter(i => i !== item) : [...array, item]

// Helper component for rendering filter pills
const FilterPillDisplay: React.FC<{
  label: string
  onRemove: () => void
}> = ({ label, onRemove }) => (
  <div className="bg-muted flex items-center gap-1 rounded-full px-2 py-1">
    <span>{label}</span>
    <Button size="icon" className="h-4 w-4" onClick={onRemove}>
      <X className="h-3 w-3" />
    </Button>
  </div>
)

export default function Home() {
  const router = useRouter()

  // State Hooks
  const [paper, setPaper] = useState<Paperwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [addPaperworkDialogOpen, setAddPaperworkDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([])
  const [statusFilter, setStatusFilter] = useState<Status[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Effect Hooks
  useEffect(() => {
    paperworkRetrieval()
      .then(setPaper)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  // Derived State/Computations
  const filteredPaperworks = filterPaperworks(
    paper,
    searchQuery,
    priorityFilter,
    statusFilter
  )

  const sortedPaperworks = sortPaperworks(
    filteredPaperworks,
    sortBy,
    sortDirection
  )

  const activeFiltersCount =
    priorityFilter.length + statusFilter.length + (searchQuery ? 1 : 0)

  // Event Handlers & Actions
  const togglePriorityFilter = (priority: Priority) => {
    setPriorityFilter(prev => _toggleArrayItem(prev, priority))
  }

  const toggleStatusFilter = (status: Status) => {
    setStatusFilter(prev => _toggleArrayItem(prev, status))
  }

  const clearFilters = () => {
    setSearchQuery('')
    setPriorityFilter([])
    setStatusFilter([])
  }

  const toggleSort = (sortType: SortOption) => {
    if (sortBy === sortType) {
      setSortDirection(prevDirection =>
        prevDirection === 'asc' ? 'desc' : 'asc'
      )
    } else {
      setSortBy(sortType)
      setSortDirection('asc')
    }
  }

  const handlePaperworkClick = (paperworkId: string) => {
    router.push(`/document/${paperworkId}`)
  }

  const addNewPaperwork = (newPaperwork: Paperwork) => {
    setPaper(prev => [...prev, newPaperwork])
  }

  // Loading State UI
  if (isLoading) {
    return (
      <div className="container mx-auto flex h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Loading documents...</div>
      </div>
    )
  }

  // Main Component Render
  return (
    <div className="container mx-auto flex h-screen flex-col px-4 py-12">
      <div className="flex flex-grow flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium">Paperworks</h1>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <PaperworkSearcher
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <PaperworkFilter
              filterState={{ searchQuery, priorityFilter, statusFilter }}
              onTogglePriorityFilter={togglePriorityFilter}
              onToggleStatusFilter={toggleStatusFilter}
              onClearFilters={clearFilters}
            />
            <PaperworkSorter
              sortState={{ sortBy, sortDirection }}
              onToggleSort={toggleSort}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setAddPaperworkDialogOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Paper
            </Button>
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
            <span>Filters:</span>
            {searchQuery && (
              <FilterPillDisplay
                label={`Title: ${searchQuery}`}
                onRemove={() => setSearchQuery('')}
              />
            )}
            {priorityFilter.map(priority => (
              <FilterPillDisplay
                key={priority}
                label={`${priority} Priority`}
                onRemove={() => togglePriorityFilter(priority)}
              />
            ))}
            {statusFilter.map(status => (
              <FilterPillDisplay
                key={status}
                label={status}
                onRemove={() => toggleStatusFilter(status)}
              />
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Paperworks Display */}
        <ScrollArea className="h-[calc(100vh-200px)]">
          {sortedPaperworks.length === 0 ? (
            <EmptyState
              hasActiveFilters={activeFiltersCount > 0}
              onClearFilters={clearFilters}
              onAddPaperwork={() => setAddPaperworkDialogOpen(true)}
            />
          ) : viewMode === 'list' ? (
            <PaperworkList
              paperworks={sortedPaperworks}
              onPaperworkClick={handlePaperworkClick}
            />
          ) : (
            <PaperworkGrid
              paperworks={sortedPaperworks}
              onPaperworkClick={handlePaperworkClick}
            />
          )}
        </ScrollArea>
      </div>

      <PaperworkSubmissionDialog
        open={addPaperworkDialogOpen}
        onOpenChange={setAddPaperworkDialogOpen}
        onPaperworkSubmit={addNewPaperwork}
        defaultCompletionDate={new Date(2026, 0, 1)}
      />
    </div>
  )
}
