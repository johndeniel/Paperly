'use client'

import { cn } from '@/lib/utils'
import {
  Card,
  CardHeader,
  CardFooter,
  CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
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
    <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {paperworks.map(paperwork => {
        const isCompleted = isPaperworkCompleted(paperwork)

        return (
          <Card
            key={paperwork.paperwork_id}
            className={cn(
              'group flex min-h-48 cursor-pointer flex-col justify-between transition-all duration-200',
              'hover:border-border/60 hover:bg-muted/20',
              isCompleted && 'opacity-60'
            )}
            onClick={() => onPaperworkClick(paperwork.paperwork_id)}
          >
            <CardHeader className="pb-3">
              <div className="min-h-12">
                <h3
                  className={cn(
                    'text-sm leading-snug font-medium tracking-tight',
                    isCompleted && 'text-muted-foreground line-through'
                  )}
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {paperwork.paper_title}
                </h3>
              </div>

              {paperwork.paper_description ? (
                <CardDescription
                  className={cn(
                    'text-muted-foreground mt-2 text-xs leading-relaxed',
                    isCompleted && 'line-through opacity-70'
                  )}
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {paperwork.paper_description}
                </CardDescription>
              ) : (
                <div className="mt-2 min-h-16" />
              )}
            </CardHeader>

            <CardFooter className="pt-3">
              <div className="w-full">
                <Separator className="mb-3" />
                <div className="flex min-h-6 items-center justify-between">
                  <Badge variant="outline" className="text-xs font-medium">
                    {getFormattedPaperworkDate(paperwork, 'MMM d, yyyy')}
                  </Badge>
                  <div className="ml-6 flex flex-shrink-0 items-center justify-center gap-3 opacity-70 transition-opacity group-hover:opacity-100">
                    <StatusBadge task={paperwork} />
                    <PriorityBadge priority={paperwork.processing_priority} />
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
