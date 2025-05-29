'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { TaskList } from '@/components/task-list'
import { TaskGrid } from '@/components/task-grid'
import { TaskFilters } from '@/components/task-filters'
import { TaskSort } from '@/components/task-sort'
import { TaskSearch } from '@/components/task-search'
import { ViewToggle } from '@/components/view-toggle'
import { EmptyState } from '@/components/empty-state'
import { PaperSubmissionDialog } from '@/components/paper-submission-dialog'

import { paperRetrieval } from '@/server/queries/paper-retrieval'
import { filterTasks, sortTasks, formatDateToString } from '@/lib/task-utils'
import type { Task, Priority, Status, ViewMode, SortOption } from '@/lib/types'

export default function Home() {
  const router = useRouter()

  const [paper, setPaper] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([])
  const [statusFilter, setStatusFilter] = useState<Status[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    paperRetrieval()
      .then(setPaper)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  const filteredTasks = filterTasks(
    paper,
    searchQuery,
    priorityFilter,
    statusFilter
  )

  const sortedTasks = sortTasks(filteredTasks, sortBy, sortDirection)
  const activeFiltersCount =
    priorityFilter.length + statusFilter.length + (searchQuery ? 1 : 0)

  const togglePriorityFilter = (priority: Priority) => {
    setPriorityFilter(prev =>
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    )
  }

  const toggleStatusFilter = (status: Status) => {
    setStatusFilter(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setPriorityFilter([])
    setStatusFilter([])
  }

  const toggleSort = (sortType: SortOption) => {
    if (sortBy === sortType) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(sortType)
      setSortDirection('asc')
    }
  }

  const handleTaskClick = (taskId: string) => {
    router.push(`/document/${taskId}`)
  }

  const toggleTaskCompletion = (taskId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setPaper(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              dateCompleted: task.dateCompleted
                ? undefined
                : formatDateToString(new Date()),
            }
          : task
      )
    )
  }

  const addNewTask = (newTask: Task) => {
    setPaper(prev => [...prev, newTask])
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Loading documents...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex h-screen flex-col px-4 py-12">
      <div className="flex flex-grow flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium">Documents</h1>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <TaskSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <TaskFilters
              filterState={{ searchQuery, priorityFilter, statusFilter }}
              onTogglePriorityFilter={togglePriorityFilter}
              onToggleStatusFilter={toggleStatusFilter}
              onClearFilters={clearFilters}
            />
            <TaskSort
              sortState={{ sortBy, sortDirection }}
              onToggleSort={toggleSort}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setAddTaskDialogOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Paper
            </Button>
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <span>Filters:</span>
            {searchQuery && (
              <div className="bg-muted flex items-center gap-1 rounded-full px-2 py-1">
                <span>Title: {searchQuery}</span>
                <Button
                  size="icon"
                  className="h-4 w-4"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {priorityFilter.map(priority => (
              <div
                key={priority}
                className="bg-muted flex items-center gap-1 rounded-full px-2 py-1"
              >
                <span>{priority} Priority</span>
                <Button
                  size="icon"
                  className="h-4 w-4"
                  onClick={() => togglePriorityFilter(priority)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {statusFilter.map(status => (
              <div
                key={status}
                className="bg-muted flex items-center gap-1 rounded-full px-2 py-1"
              >
                <span>{status}</span>
                <Button
                  size="icon"
                  className="h-4 w-4"
                  onClick={() => toggleStatusFilter(status)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}

        {/* Tasks Display */}
        <ScrollArea className="h-[670px]">
          {sortedTasks.length === 0 ? (
            <EmptyState
              hasActiveFilters={activeFiltersCount > 0}
              onClearFilters={clearFilters}
              onAddTask={() => setAddTaskDialogOpen(true)}
            />
          ) : viewMode === 'list' ? (
            <TaskList
              tasks={sortedTasks}
              onTaskClick={handleTaskClick}
              onToggleTaskCompletion={toggleTaskCompletion}
            />
          ) : (
            <TaskGrid
              tasks={sortedTasks}
              onTaskClick={handleTaskClick}
              onToggleTaskCompletion={toggleTaskCompletion}
            />
          )}
        </ScrollArea>
      </div>

      <PaperSubmissionDialog
        open={addTaskDialogOpen}
        onOpenChange={setAddTaskDialogOpen}
        onPaperSubmit={addNewTask}
        defaultCompletionDate={new Date(2026, 0, 1)}
      />
    </div>
  )
}
