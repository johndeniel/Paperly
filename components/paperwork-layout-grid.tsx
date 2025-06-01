'use client'

import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { PriorityBadge } from '@/components/priority-badge'
import { StatusBadge } from '@/components/status-badge'
import {
  isPaperworkCompleted,
  getFormattedPaperworkDate,
} from '@/lib/task-utils'
import type { Paperwork } from '@/lib/types'

interface PaperworkGridProps {
  paperworks: Paperwork[]
  onPaperworkClick: (paperworkId: string) => void
}

export function PaperworkLayoutGrid({
  paperworks,
  onPaperworkClick,
}: PaperworkGridProps) {
  return (
    // Grid container with responsive columns and gap between cards
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {paperworks.map(paperwork => {
        const isCompleted = isPaperworkCompleted(paperwork)

        return (
          <div
            key={paperwork.paperwork_id}
            className={cn(
              'bg-background border-border/40 cursor-pointer overflow-hidden rounded-md border transition-colors',
              isCompleted && 'bg-muted/5' // Apply muted background if paperwork is completed
            )}
            onClick={() => onPaperworkClick(paperwork.paperwork_id)}
          >
            {/* Card content container with fixed height */}
            <div className="flex h-[170px] flex-col p-3.5">
              {/* Header section: Paperwork title and PriorityBadge */}
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3
                  className={cn(
                    'h-10 flex-1 text-sm font-medium',
                    isCompleted && 'text-muted-foreground'
                  )}
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textDecoration: isCompleted ? 'line-through' : 'none',
                  }}
                >
                  {paperwork.paper_title}
                </h3>
                {/* Priority Badge */}
                <PriorityBadge priority={paperwork.processing_priority} />
              </div>

              {/* Optional description section */}
              {paperwork.paper_description && (
                <p
                  className={cn(
                    'text-muted-foreground mb-auto h-9 text-xs',
                    isCompleted && 'text-muted-foreground/70'
                  )}
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: '1.5',
                    textDecoration: isCompleted ? 'line-through' : 'none',
                  }}
                >
                  {paperwork.paper_description}
                </p>
              )}

              {/* Footer section: Separator, formatted date, and StatusBadge */}
              <div className="mt-auto pt-2.5">
                <Separator className="mb-2.5 opacity-60" />
                <div className="text-muted-foreground flex items-center justify-between text-[0.7rem]">
                  {/* Display completion date if completed; otherwise, show due date */}
                  <span>
                    {getFormattedPaperworkDate(paperwork, 'MMM d, yyyy')}
                  </span>
                  {/* Status Badge */}
                  <StatusBadge task={paperwork} />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
