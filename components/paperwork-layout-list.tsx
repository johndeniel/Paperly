'use client'

import { cn } from '@/lib/utils'
import { PriorityBadge } from '@/components/priority-badge'
import { StatusBadge } from '@/components/status-badge'
import {
  isPaperworkCompleted,
  getFormattedPaperworkDate,
} from '@/lib/task-utils'
import type { Paperwork } from '@/lib/types'

interface PaperworkLayoutListProps {
  paperworks: Paperwork[]
  onPaperworkClick: (paperworkId: string) => void
}

export function PaperworkLayoutList({
  paperworks,
  onPaperworkClick,
}: PaperworkLayoutListProps) {
  return (
    <div className="space-y-0">
      {paperworks.map(paperwork => {
        const isCompleted = isPaperworkCompleted(paperwork)

        return (
          <div
            key={paperwork.paperwork_id}
            className={cn(
              'group flex items-center px-6 py-5 transition-all duration-150',
              'border-border/20 cursor-pointer border-b',
              'hover:bg-muted/30',
              isCompleted && 'opacity-50'
            )}
            onClick={() => onPaperworkClick(paperwork.paperwork_id)}
          >
            {/* Left content */}
            <div className="min-w-0 flex-1 space-y-3">
              <div className="space-y-1">
                <h3
                  className={cn(
                    'truncate text-base leading-tight font-medium tracking-tight',
                    isCompleted && 'text-muted-foreground line-through'
                  )}
                >
                  {paperwork.paper_title}
                </h3>
                {paperwork.paper_description && (
                  <p
                    className={cn(
                      'text-muted-foreground line-clamp-2 max-w-full text-sm leading-relaxed',
                      isCompleted && 'line-through opacity-70'
                    )}
                  >
                    {paperwork.paper_description}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <span className="text-muted-foreground text-xs font-medium tracking-wide">
                  {getFormattedPaperworkDate(paperwork)}
                </span>
              </div>
            </div>

            {/* Right badges - perfectly centered */}
            <div className="ml-6 flex flex-shrink-0 items-center justify-center gap-3 opacity-70 transition-opacity group-hover:opacity-100">
              <StatusBadge status={paperwork} />
              <PriorityBadge priority={paperwork.processing_priority} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
