'use client'

import React from 'react'
import { useState, useEffect, useCallback, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TasksContext } from '@/lib/task-context'
import { Separator } from '@/components/ui/separator'
import { Paperwork } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PriorityBadge } from '@/components/priority-badge'
import { StatusBadge } from '@/components/status-badge'
import { PaperworkDialog } from '@/components/paperwork-dialog'
import { PaperworkSubmissionDialog } from '@/components/paperwork-submission-dialog'
import { paperworkRetrieval } from '@/server/queries/paperwork-retrieval'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  isCurrentOrFuture,
  groupPaperworksByDate,
  getPaperworksForDay,
  getDayBackgroundColor,
  getPriorityBorderColor,
  getPriorityIndicatorColor,
  getVisiblePaperworks,
  formatPaperworkCountText,
  isPaperworkCompleted,
  getFormattedPaperworkDate,
} from '@/lib/task-utils'

// Updated calendar generation function to ensure exactly 6 weeks (42 days)
const generateCalendarDays = (currentDate: Date): Date[] => {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday
  let calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 }) // Sunday

  // Ensure we always have exactly 5 weeks (35 days)
  const daysBetween = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  // If we have less than 35 days, extend to complete 5 weeks
  while (daysBetween.length < 35) {
    calendarEnd = addDays(calendarEnd, 1)
    daysBetween.push(calendarEnd)
  }

  // If we have more than 35 days, trim to exactly 35
  return daysBetween.slice(0, 35)
}

export default function Calendar(): React.ReactElement {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [paperworks, setPaperworks] = useState<Paperwork[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isViewPaperworksOpen, setIsViewPaperworksOpen] = useState(false)
  const [isAddPaperworkOpen, setIsAddPaperworkOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    paperworkRetrieval()
      .then(fetchedPaperworks => {
        setPaperworks(Array.isArray(fetchedPaperworks) ? fetchedPaperworks : [])
      })
      .catch(err => {
        console.error('Failed to fetch paperwork:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to load paperwork'
        )
        setPaperworks([])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // Updated to use the new calendar generation function
  const calendarDays = useMemo(
    () => generateCalendarDays(currentDate),
    [currentDate]
  )
  const paperworksByDate = useMemo(
    () => groupPaperworksByDate(paperworks),
    [paperworks]
  )

  const handlePreviousMonth = useCallback(
    () => setCurrentDate(prevDate => subMonths(prevDate, 1)),
    []
  )
  const handleNextMonth = useCallback(
    () => setCurrentDate(prevDate => addMonths(prevDate, 1)),
    []
  )
  const handleDayClick = useCallback((day: Date) => {
    setSelectedDate(day)
    setIsViewPaperworksOpen(true)
  }, [])
  const handleAddPaperworkClick = useCallback(() => {
    setIsViewPaperworksOpen(false)
    setIsAddPaperworkOpen(true)
  }, [])
  const handlePaperworkClick = useCallback(
    (paperworkId: string) =>
      startTransition(() => router.push(`/paperwork/${paperworkId}`)),
    [router]
  )

  const handleAddPaperwork = useCallback(
    (newPaperwork: Paperwork) => {
      if (selectedDate && newPaperwork.paper_title.trim()) {
        setPaperworks(currentPaperworks => [...currentPaperworks, newPaperwork])
        setIsAddPaperworkOpen(false)
        setIsViewPaperworksOpen(true)
      }
    },
    [selectedDate]
  )

  const tooltipStyles = useMemo(
    () => ({
      content: 'bg-background text-foreground border border-border shadow-sm',
      paperworkTooltip:
        'max-w-[300px] p-0 overflow-hidden bg-background text-foreground border border-border shadow-sm',
    }),
    []
  )

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Loading Paperworks...</div>
      </div>
    )
  }

  return (
    <TasksContext.Provider
      value={{ papers: paperworks, setPapers: setPaperworks }}
    >
      <TooltipProvider>
        <div className="container mx-auto flex h-screen flex-col px-4 py-12">
          <div className="flex flex-grow flex-col space-y-4">
            {/* Header - matches home page structure */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-medium">Calendar</h1>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  View your Documents by date
                </p>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePreviousMonth}
                  className="h-8 w-8"
                  disabled={isPending}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="min-w-[140px] px-3 text-center text-sm font-medium">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextMonth}
                  className="h-8 w-8"
                  disabled={isPending}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar - uses flexible height like home page */}
            <div className="flex-grow">
              <Card className="h-full overflow-hidden border-none bg-white shadow-none dark:bg-black">
                <CardContent className="flex h-full flex-col p-0">
                  {/* Calendar Header */}
                  <div className="border-border/40 grid grid-cols-7 border-b">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                      day => (
                        <div
                          key={day}
                          className="text-muted-foreground py-3 text-center text-sm font-medium"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  {/* Calendar Grid - fixed 6 rows with equal height */}
                  {/* Calendar Grid - fixed 5 rows with equal height */}
                  <div className="grid flex-grow grid-cols-7 grid-rows-5 gap-0">
                    {calendarDays.map((day, index) => {
                      const dayPaperworks = getPaperworksForDay(
                        day,
                        paperworksByDate
                      )
                      const {
                        visible: visiblePaperworks,
                        remaining: remainingCount,
                      } = getVisiblePaperworks(dayPaperworks, 3) // Limit to 3 visible items per day
                      const isCurrentMonth = isSameMonth(day, currentDate)

                      return (
                        <div
                          key={index}
                          className={cn(
                            'border-border/40 hover:bg-muted/5 relative border-r border-b',
                            // Fixed height and width for each cell - maintains dimensions regardless of content
                            'h-full min-h-[120px] w-full',
                            index % 7 === 0 && 'border-l',
                            'cursor-pointer transition-colors',
                            isCurrentOrFuture(day) &&
                              'hover:ring-primary/10 hover:ring-1'
                          )}
                          onClick={() => handleDayClick(day)}
                          role="button"
                          aria-label={format(day, 'EEEE, MMMM d, yyyy')}
                        >
                          <div
                            className={cn(
                              'flex h-full w-full flex-col overflow-hidden p-2 transition-colors', // Added overflow-hidden to prevent content overflow
                              getDayBackgroundColor(day, paperworksByDate),
                              !isCurrentMonth && 'opacity-40'
                            )}
                          >
                            <div className="mb-2 flex shrink-0 items-center justify-between">
                              <span
                                className={cn(
                                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-medium', // Added shrink-0
                                  isToday(day) &&
                                    'bg-primary text-primary-foreground',
                                  !isCurrentMonth && 'text-muted-foreground'
                                )}
                              >
                                {format(day, 'd')}
                              </span>
                              {dayPaperworks.length > 0 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-muted-foreground bg-muted/30 hover:bg-muted/50 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium transition-colors">
                                      {dayPaperworks.length}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className={tooltipStyles.content}
                                  >
                                    <div className="p-2 text-xs">
                                      {formatPaperworkCountText(
                                        dayPaperworks.length
                                      )}{' '}
                                      on this day
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>

                            {/* Fixed height container for paperwork items with strict overflow control */}
                            <div className="max-h-[80px] min-h-0 flex-grow space-y-1 overflow-hidden">
                              {visiblePaperworks.map(paperwork => {
                                const isCompleted =
                                  isPaperworkCompleted(paperwork)
                                return (
                                  <Tooltip key={paperwork.paperwork_id}>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={cn(
                                          'bg-background/90 hover:bg-muted/60 flex cursor-pointer items-center gap-1 rounded-sm px-1.5 py-1 text-xs',
                                          'max-w-full min-w-0 shrink-0 truncate', // Added min-w-0 and shrink-0 for better text truncation
                                          isCompleted &&
                                            'text-muted-foreground line-through',
                                          `border-l-2 ${getPriorityBorderColor(paperwork.processing_priority)}`,
                                          !isCurrentMonth && 'opacity-70'
                                        )}
                                      >
                                        <div className="min-w-0 flex-1 truncate">
                                          {' '}
                                          {/* Added flex-1 for proper text truncation */}
                                          {paperwork.paper_title}
                                        </div>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="right"
                                      className={tooltipStyles.paperworkTooltip}
                                    >
                                      <div className="p-3">
                                        <div className="mb-2 flex items-start justify-between gap-2">
                                          <div className="flex items-center gap-2">
                                            <div
                                              className={cn(
                                                'h-4 w-1 shrink-0 rounded-sm',
                                                getPriorityIndicatorColor(
                                                  paperwork.processing_priority
                                                )
                                              )}
                                            />
                                            <h4
                                              className={cn(
                                                'text-xs leading-tight font-bold',
                                                isCompleted &&
                                                  'text-muted-foreground line-through'
                                              )}
                                              title={paperwork.paper_title}
                                            >
                                              {paperwork.paper_title}
                                            </h4>
                                          </div>
                                          <PriorityBadge
                                            priority={
                                              paperwork.processing_priority
                                            }
                                          />
                                        </div>

                                        {paperwork.paper_description && (
                                          <>
                                            <p
                                              className={cn(
                                                'text-muted-foreground mb-2 text-[10px] leading-normal',
                                                isCompleted && 'line-through'
                                              )}
                                              title={
                                                paperwork.paper_description
                                              }
                                            >
                                              {paperwork.paper_description}
                                            </p>
                                            <Separator className="from-border/10 via-border/80 to-border/10 my-2.5 w-full bg-gradient-to-r" />
                                          </>
                                        )}

                                        <div className="flex items-center justify-between text-[10px]">
                                          <p className="text-muted-foreground font-medium">
                                            {getFormattedPaperworkDate(
                                              paperwork,
                                              'MMMM d, yyyy'
                                            )}
                                          </p>
                                          <StatusBadge task={paperwork} />
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )
                              })}

                              {remainingCount > 0 && (
                                <div className="text-muted-foreground flex shrink-0 items-center gap-0.5 px-1.5 text-xs">
                                  <span>+{remainingCount} more</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <PaperworkDialog
            isOpen={isViewPaperworksOpen}
            onOpenChange={setIsViewPaperworksOpen}
            selectedDate={selectedDate}
            paperworks={paperworks}
            onAddPaperworkClick={handleAddPaperworkClick}
            onPaperworkClick={handlePaperworkClick}
            isCurrentOrFuture={isCurrentOrFuture}
          />

          <PaperworkSubmissionDialog
            key={selectedDate?.getTime()}
            open={isAddPaperworkOpen}
            onOpenChange={setIsAddPaperworkOpen}
            onPaperworkSubmit={handleAddPaperwork}
            defaultCompletionDate={selectedDate ?? undefined}
          />
        </div>
      </TooltipProvider>
    </TasksContext.Provider>
  )
}
