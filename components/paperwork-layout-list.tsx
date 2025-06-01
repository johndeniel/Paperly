'use client'

import { cn } from '@/lib/utils'
import { PriorityBadge } from '@/components/priority-badge'
import { StatusBadge } from '@/components/status-badge'
import {
  isPaperworkCompleted,
  getFormattedPaperworkDate,
} from '@/lib/task-utils'
import type { Paperwork } from '@/lib/types'

interface PaperworkListProps {
  paperworks: Paperwork[]
  onPaperworkClick: (paperworkId: string) => void
}

export function PaperworkLayoutList({
  paperworks,
  onPaperworkClick,
}: PaperworkListProps) {
  return (
    // Container with vertical spacing and padding
    <div className="space-y-2 p-4">
      {paperworks.map(paperwork => {
        const isCompleted = isPaperworkCompleted(paperwork)

        return (
          // Paperwork card container with hover effects and conditional styling for completed paperwork
          <div
            key={paperwork.paperwork_id}
            className={cn(
              'group flex items-center gap-4 rounded-lg px-4 py-3 transition-all duration-200',
              'cursor-pointer',
              'hover:border-border/10 border border-transparent',
              isCompleted && 'bg-muted/5 opacity-80'
            )}
            onClick={() => onPaperworkClick(paperwork.paperwork_id)}
          >
            {/* Content container for paperwork details */}
            <div className="min-w-0 flex-grow space-y-1.5">
              {/* Header: Paperwork title and badges for status and priority */}
              <div className="flex items-start justify-between gap-4">
                <h3
                  className={cn(
                    'max-w-[280px] truncate text-sm font-medium tracking-tight',
                    isCompleted && 'text-muted-foreground line-through'
                  )}
                >
                  {paperwork.paper_title}
                </h3>
                {/* Badge container with status and priority icons */}
                <div className="flex items-center gap-2 opacity-80 transition-opacity group-hover:opacity-100">
                  <StatusBadge task={paperwork} />
                  <PriorityBadge priority={paperwork.processing_priority} />
                </div>
              </div>

              {/* Optional description section, truncated for layout */}
              {paperwork.paper_description && (
                <p
                  className={cn(
                    'text-muted-foreground max-w-full truncate text-xs',
                    isCompleted && 'line-through opacity-60'
                  )}
                >
                  {paperwork.paper_description}
                </p>
              )}

              {/* Footer: Display the due or completion date */}
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>{getFormattedPaperworkDate(paperwork)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
