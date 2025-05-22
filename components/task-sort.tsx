import { SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TaskSortOption, SortState } from '@/lib/types'

interface TaskSortProps {
  sortState: SortState
  onToggleSort: (sortType: TaskSortOption) => void
}

/**
 * TaskSort component provides UI for sorting tasks by different criteria.
 * It manages the dropdown menu and indicates the selected sort direction.
 */
export function TaskSort({ sortState, onToggleSort }: TaskSortProps) {
  const { sortBy, sortDirection } = sortState

  return (
    <DropdownMenu>
      {/* Button to trigger sorting dropdown */}
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Sort
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown menu for sorting options */}
      <DropdownMenuContent
        align="end"
        className="w-56 border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
      >
        {/* Sorting by Due Date */}
        <DropdownMenuCheckboxItem
          checked={sortBy === 'date'}
          onCheckedChange={() => onToggleSort('date')}
        >
          <div className="flex w-full items-center justify-between">
            <span>Due Date</span>
            {sortBy === 'date' && (
              <ArrowUpDown
                className={cn(
                  'ml-2 h-3.5 w-3.5',
                  sortDirection === 'desc' && 'rotate-180'
                )}
              />
            )}
          </div>
        </DropdownMenuCheckboxItem>

        {/* Sorting by Title */}
        <DropdownMenuCheckboxItem
          checked={sortBy === 'title'}
          onCheckedChange={() => onToggleSort('title')}
        >
          <div className="flex w-full items-center justify-between">
            <span>Title</span>
            {sortBy === 'title' && (
              <ArrowUpDown
                className={cn(
                  'ml-2 h-3.5 w-3.5',
                  sortDirection === 'desc' && 'rotate-180'
                )}
              />
            )}
          </div>
        </DropdownMenuCheckboxItem>

        {/* Sorting by Priority */}
        <DropdownMenuCheckboxItem
          checked={sortBy === 'priority'}
          onCheckedChange={() => onToggleSort('priority')}
        >
          <div className="flex w-full items-center justify-between">
            <span>Priority</span>
            {sortBy === 'priority' && (
              <ArrowUpDown
                className={cn(
                  'ml-2 h-3.5 w-3.5',
                  sortDirection === 'desc' && 'rotate-180'
                )}
              />
            )}
          </div>
        </DropdownMenuCheckboxItem>

        {/* Sorting by Status */}
        <DropdownMenuCheckboxItem
          checked={sortBy === 'status'}
          onCheckedChange={() => onToggleSort('status')}
        >
          <div className="flex w-full items-center justify-between">
            <span>Status</span>
            {sortBy === 'status' && (
              <ArrowUpDown
                className={cn(
                  'ml-2 h-3.5 w-3.5',
                  sortDirection === 'desc' && 'rotate-180'
                )}
              />
            )}
          </div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
