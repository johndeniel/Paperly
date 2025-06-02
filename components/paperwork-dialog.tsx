'use client'

import { format, parse } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { PriorityBadge } from '@/components/priority-badge'
import { StatusBadge } from '@/components/status-badge'
import { Paperwork } from '@/lib/types'
import { getFormattedPaperworkDate } from '@/lib/task-utils'
import { Plus } from 'lucide-react'

interface PaperworkDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | null
  paperworks: Paperwork[]
  onAddPaperworkClick: () => void
  onPaperworkClick: (paperworkId: string) => void
  isCurrentOrFuture: (date: Date) => boolean
}

const parseDate = (dateString: string): Date => {
  return parse(dateString, 'dd-MM-yyyy', new Date())
}

export const PaperworkDialog = ({
  isOpen,
  onOpenChange,
  selectedDate,
  paperworks,
  onAddPaperworkClick,
  onPaperworkClick,
  isCurrentOrFuture,
}: PaperworkDialogProps) => {
  const getPaperworksForDay = (day: Date): Paperwork[] => {
    return paperworks.filter(paperwork => {
      const paperworkDate = parseDate(paperwork.target_completion_date)
      return (
        paperworkDate.getDate() === day.getDate() &&
        paperworkDate.getMonth() === day.getMonth() &&
        paperworkDate.getFullYear() === day.getFullYear()
      )
    })
  }

  const currentDatePaperworks = selectedDate
    ? getPaperworksForDay(selectedDate)
    : []

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[70vh] max-w-2xl flex-col">
        <DialogHeader>
          <div className="space-y-1">
            <DialogTitle className="text-lg font-semibold">
              {selectedDate
                ? format(selectedDate, 'EEEE, MMMM d, yyyy')
                : 'Paperwork Schedule'}
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              {selectedDate
                ? 'View and manage paperwork for this date'
                : 'Select a date to view paperwork'}
            </p>
          </div>
          <Separator />
        </DialogHeader>

        <div className="min-h-0 flex-1">
          {selectedDate && currentDatePaperworks.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-10">
              <div className="relative mb-4">
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-xl">
                  <div className="bg-muted-foreground/20 h-4 w-4 rounded" />
                </div>
                <div className="bg-primary absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full">
                  <span className="text-primary-foreground text-xs font-medium">
                    +
                  </span>
                </div>
              </div>
              <div className="max-w-xs space-y-1 text-center">
                <h3 className="text-base font-medium">
                  No paperwork scheduled
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Add your first paperwork for this date to start organizing
                  your workflow and track progress.
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-2 px-3">
                {currentDatePaperworks.map(paperwork => {
                  const isCompleted =
                    paperwork.actual_completion_date !== undefined
                  return (
                    <Card
                      key={paperwork.paperwork_id}
                      className={cn(
                        'group cursor-pointer rounded-md border-l-4 p-2 transition-all duration-200 hover:shadow-sm',
                        isCompleted
                          ? 'border-l-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/60 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20'
                          : paperwork.processing_priority === 'High'
                            ? 'border-l-red-500 hover:bg-red-50/40 dark:hover:bg-red-950/10'
                            : paperwork.processing_priority === 'Medium'
                              ? 'border-l-amber-500 hover:bg-amber-50/40 dark:hover:bg-amber-950/10'
                              : 'border-l-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/10'
                      )}
                      onClick={() => onPaperworkClick(paperwork.paperwork_id)}
                    >
                      <CardHeader className="px-2 pb-1">
                        <h3
                          className={cn(
                            'truncate text-sm font-semibold',
                            isCompleted && 'text-muted-foreground line-through'
                          )}
                          title={paperwork.paper_title}
                        >
                          {paperwork.paper_title}
                        </h3>
                      </CardHeader>

                      {paperwork.paper_description && (
                        <CardDescription className="px-2 py-1">
                          <p
                            className={cn(
                              'text-muted-foreground line-clamp-2 text-xs',
                              isCompleted && 'line-through'
                            )}
                            title={paperwork.paper_description}
                          >
                            {paperwork.paper_description}
                          </p>
                        </CardDescription>
                      )}

                      <CardFooter className="px-2 pt-1">
                        <div className="w-full">
                          <Separator className="mb-2" />
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className="px-2 py-0.5 text-[10px] font-medium"
                            >
                              {getFormattedPaperworkDate(
                                paperwork,
                                'MMM d, yyyy'
                              )}
                            </Badge>
                            <div className="ml-2 flex items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                              <StatusBadge task={paperwork} />
                              <PriorityBadge
                                priority={paperwork.processing_priority}
                              />
                            </div>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>
        <Separator />

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 min-w-[90px] text-sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {selectedDate && isCurrentOrFuture(selectedDate) && (
            <Button
              onClick={onAddPaperworkClick}
              size="sm"
              className="h-8 min-w-[90px] text-sm"
            >
              <Plus className="mr-1 h-4 w-4" />
              New Paper
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
