'use client'

import type React from 'react'
import { useState, useEffect, useCallback, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PriorityBadge } from '@/components/priority-badge'
import { StatusBadge } from '@/components/status-badge'
import { TaskDialog } from '@/components/task-dialog' // This might need a rename on your end to PaperworkDialog
import { PaperworkSubmissionDialog } from '@/components/paperwork-submission-dialog'
import { TasksContext } from '@/lib/task-context' // This might need a rename on your end to PaperworkContext
import { Separator } from '@/components/ui/separator'
import type { Paperwork } from '@/lib/types'
import {
  parseDate,
  formatDateToString,
  getCompletionStatus,
  isCurrentOrFuture,
} from '@/lib/task-utils' // This might need a rename on your end to paperwork-utils
import { paperworkRetrieval } from '@/server/queries/paperwork-retrieval'

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

  const { weeks } = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDay = monthStart.getDay()
    const endDay = 6 - monthEnd.getDay()
    const calendarDays = [
      ...Array(startDay).fill(null),
      ...eachDayOfInterval({ start: monthStart, end: monthEnd }),
      ...Array(endDay).fill(null),
    ]
    const weeksArr = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeksArr.push(calendarDays.slice(i, i + 7))
    }
    return { weeks: weeksArr }
  }, [currentDate])

  const paperworksByDate = useMemo(() => {
    const map = new Map<string, Paperwork[]>()
    paperworks.forEach(paperwork => {
      const dueDate = paperwork.target_completion_date.slice(0, 10)
      map.set(dueDate, [...(map.get(dueDate) || []), paperwork])
    })
    return map
  }, [paperworks])

  const handlePreviousMonth = useCallback(
    () => setCurrentDate(prevDate => subMonths(prevDate, 1)),
    []
  )
  const handleNextMonth = useCallback(
    () => setCurrentDate(prevDate => addMonths(prevDate, 1)),
    []
  )
  const handleDayClick = useCallback((day: Date | null) => {
    if (day) {
      setSelectedDate(day)
      setIsViewPaperworksOpen(true)
    }
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

  const getPaperworksForDay = useCallback(
    (day: Date) =>
      paperworksByDate.get(formatDateToString(day).slice(0, 10)) || [],
    [paperworksByDate]
  )

  const getDayColor = useCallback(
    (day: Date) => {
      if (!day) return ''
      const dayPaperworks = getPaperworksForDay(day)
      return dayPaperworks.some(
        paperwork => getCompletionStatus(paperwork) === 'overdue'
      )
        ? 'bg-[hsl(var(--status-overdue-bg))] calendar-day-highlight'
        : dayPaperworks.length > 0
          ? 'bg-[hsl(var(--status-active-bg))] calendar-day-highlight'
          : ''
    },
    [getPaperworksForDay]
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

  // Loading State UI
  if (isLoading) {
    return (
      <div className="container mx-auto flex h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Loading Paperworks...</div>
      </div>
    )
  }

  return (
    <TasksContext.Provider
      value={{ tasks: paperworks, setTasks: setPaperworks }}
    >
      <TooltipProvider>
        <div className="container mx-auto flex h-screen flex-col px-4 py-12">
          <div className="flex flex-grow flex-col space-y-4">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="text-xl font-medium tracking-tight">Calendar</h1>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  View your Documents by date
                </p>
                {error && (
                  <p className="mt-0.5 text-xs text-red-500">{error}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePreviousMonth}
                  className="h-7 w-7"
                  disabled={isPending}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="min-w-[120px] px-2 text-center text-sm font-medium">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextMonth}
                  className="h-7 w-7"
                  disabled={isPending}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Card className="h-[690px] overflow-hidden border-none bg-white shadow-none dark:bg-black">
              <CardContent className="flex h-[690px] flex-col p-0">
                <div className="border-border/40 grid grid-cols-7 border-b">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                    day => (
                      <div
                        key={day}
                        className="text-muted-foreground py-2 text-center text-xs font-medium"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                <div className="grid flex-grow grid-cols-7">
                  {weeks.flat().map((day, index) => {
                    const dayPaperworks = day ? getPaperworksForDay(day) : []
                    const visiblePaperworks = dayPaperworks.slice(0, 3)
                    const remainingCount =
                      dayPaperworks.length - visiblePaperworks.length

                    return (
                      <div
                        key={index}
                        className={cn(
                          'border-border/40 hover:bg-muted/5 relative border-r border-b',
                          index % 7 === 0 && 'border-l',
                          day
                            ? 'cursor-pointer transition-colors'
                            : 'bg-muted/5',
                          day &&
                            isCurrentOrFuture(day) &&
                            'hover:ring-primary/10 hover:ring-1'
                        )}
                        onClick={() => handleDayClick(day)}
                        role={day ? 'button' : 'presentation'}
                        aria-label={
                          day ? format(day, 'EEEE, MMMM d, yyyy') : undefined
                        }
                      >
                        {day && (
                          <div
                            className={cn(
                              'flex h-full w-full flex-col p-1.5 transition-colors',
                              getDayColor(day),
                              !isSameMonth(day, currentDate) && 'opacity-40'
                            )}
                          >
                            <div className="mb-1 flex items-center justify-between">
                              <span
                                className={cn(
                                  'flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium',
                                  isToday(day) &&
                                    'bg-primary text-primary-foreground'
                                )}
                              >
                                {format(day, 'd')}
                              </span>
                              {dayPaperworks.length > 0 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-muted-foreground bg-muted/30 hover:bg-muted/50 rounded-full px-1.5 py-0.5 text-[9px] font-medium transition-colors">
                                      {dayPaperworks.length}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className={tooltipStyles.content}
                                  >
                                    <div className="p-2 text-xs">
                                      {dayPaperworks.length}{' '}
                                      {dayPaperworks.length === 1
                                        ? 'document'
                                        : 'documents'}{' '}
                                      on this day
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>

                            <div className="mt-0.5 space-y-0.5 overflow-hidden">
                              {visiblePaperworks.map(paperwork => {
                                const isCompleted =
                                  paperwork.actual_completion_date !== undefined
                                return (
                                  <Tooltip key={paperwork.paperwork_id}>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={cn(
                                          'bg-background/80 hover:bg-muted/60 flex cursor-pointer items-center gap-1 rounded-sm px-1 py-0.5 text-[9px]',
                                          isCompleted &&
                                            'text-muted-foreground line-through',
                                          `border-l-2 ${
                                            paperwork.processing_priority ===
                                            'High'
                                              ? 'border-l-red-400'
                                              : paperwork.processing_priority ===
                                                  'Medium'
                                                ? 'border-l-amber-400'
                                                : 'border-l-blue-400'
                                          }`
                                        )}
                                      >
                                        <div className="truncate">
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
                                                paperwork.processing_priority ===
                                                  'High'
                                                  ? 'bg-red-400'
                                                  : paperwork.processing_priority ===
                                                      'Medium'
                                                    ? 'bg-amber-400'
                                                    : 'bg-blue-400'
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
                                          {isCompleted ? (
                                            <p className="text-muted-foreground font-medium">
                                              Completed on{' '}
                                              {format(
                                                parseDate(
                                                  paperwork.actual_completion_date ||
                                                    paperwork.target_completion_date
                                                ),
                                                'MMMM d, yyyy'
                                              )}
                                            </p>
                                          ) : (
                                            <p className="text-muted-foreground font-medium">
                                              Due on{' '}
                                              {format(
                                                parseDate(
                                                  paperwork.target_completion_date
                                                ),
                                                'MMMM d, yyyy'
                                              )}
                                            </p>
                                          )}
                                          <StatusBadge task={paperwork} />
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )
                              })}

                              {remainingCount > 0 && (
                                <div className="text-muted-foreground flex items-center gap-0.5 px-1 text-[8px]">
                                  <span>+{remainingCount} more</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <TaskDialog
            isOpen={isViewPaperworksOpen}
            onOpenChange={setIsViewPaperworksOpen}
            selectedDate={selectedDate}
            tasks={paperworks}
            onAddTaskClick={handleAddPaperworkClick}
            onTaskClick={handlePaperworkClick}
            isCurrentOrFuture={isCurrentOrFuture}
          />

          <PaperworkSubmissionDialog
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
