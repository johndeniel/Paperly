'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  CalendarDays,
  Building2,
  FileText,
  Layers,
  Inbox,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PriorityBadge } from '@/components/priority-badge'
import { StatusBadge } from '@/components/status-badge'
import { paperworkDetailRetrieval } from '@/server/queries/paperwork-detail'
import { paperworkCompletion } from '@/server/action/paperwork-completion'
import {
  isPaperworkCompleted,
  parseDate,
  getFormattedPaperworkDate,
} from '@/lib/task-utils'
import type { Paperwork } from '@/lib/types'
import { cn } from '@/lib/utils'

function formatDetailDate(dateString?: string): string {
  if (!dateString) return '—'
  try {
    return format(parseDate(dateString), 'MMMM d, yyyy')
  } catch {
    return dateString
  }
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-muted-foreground w-32 shrink-0 text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
      <span className="text-right text-sm break-words">{value}</span>
    </div>
  )
}

export default function PaperworkDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const paperworkId = params.id

  const [paperwork, setPaperwork] = useState<Paperwork | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!paperworkId) return
    setIsLoading(true)
    setError(null)
    paperworkDetailRetrieval(paperworkId)
      .then(setPaperwork)
      .catch(err =>
        setError(err instanceof Error ? err.message : 'Failed to load task')
      )
      .finally(() => setIsLoading(false))
  }, [paperworkId])

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const handleToggleComplete = useCallback(async () => {
    if (!paperwork) return
    const isCompleted = isPaperworkCompleted(paperwork)
    setIsUpdating(true)
    try {
      const updated = await paperworkCompletion(
        paperwork.paperwork_id,
        isCompleted ? 'reopen' : 'complete'
      )
      setPaperwork(updated)
      toast.success(isCompleted ? 'Task reopened.' : 'Task marked as complete.')
    } catch {
      toast.error('Failed to update task. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }, [paperwork])

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Loading task...</div>
      </div>
    )
  }

  if (error || !paperwork) {
    return (
      <div className="container mx-auto flex h-screen flex-col items-center justify-center gap-4 px-4">
        <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-xl">
          <Inbox className="text-muted-foreground h-6 w-6" />
        </div>
        <h1 className="text-lg font-medium">Task not found</h1>
        <p className="text-muted-foreground text-sm">
          {error ?? 'This task does not exist or was removed.'}
        </p>
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go back
        </Button>
      </div>
    )
  }

  const isCompleted = isPaperworkCompleted(paperwork)
  const initial = (paperwork.paper_title || 'P').charAt(0).toUpperCase()

  return (
    <div className="container mx-auto flex h-screen max-w-3xl flex-col px-4 py-12">
      {/* Toolbar — Gmail-style action bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="Back to tasks"
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-medium">Task details</h1>
        </div>
        <Button
          size="sm"
          variant={isCompleted ? 'outline' : 'default'}
          onClick={handleToggleComplete}
          disabled={isUpdating}
        >
          {isCompleted ? (
            <>
              <RotateCcw className="mr-2 h-4 w-4" />
              {isUpdating ? 'Reopening...' : 'Reopen task'}
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {isUpdating ? 'Completing...' : 'Mark as complete'}
            </>
          )}
        </Button>
      </div>

      <ScrollArea className="mt-4 h-[calc(100vh-200px)]">
        <Card>
          <CardContent className="p-6 sm:p-8">
            {/* Subject line */}
            <h2
              className={cn(
                'text-xl leading-snug font-semibold tracking-tight sm:text-2xl',
                isCompleted && 'text-muted-foreground line-through'
              )}
            >
              {paperwork.paper_title}
            </h2>

            {/* Badges */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={paperwork} />
              <PriorityBadge priority={paperwork.processing_priority} />
              {paperwork.paper_type && (
                <Badge variant="outline" className="text-xs font-medium">
                  <FileText className="mr-1 h-3 w-3" />
                  {paperwork.paper_type}
                </Badge>
              )}
              {paperwork.paper_source && (
                <Badge variant="outline" className="text-xs font-medium">
                  <Layers className="mr-1 h-3 w-3" />
                  {paperwork.paper_source}
                </Badge>
              )}
            </div>

            <Separator className="my-5" />

            {/* Gmail-style header block */}
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-semibold">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-medium">
                    Paperwork{' '}
                    <span className="text-muted-foreground font-normal">
                      #{paperwork.paperwork_id.slice(0, 8)}
                    </span>
                  </p>
                  <p className="text-muted-foreground shrink-0 text-xs">
                    {getFormattedPaperworkDate(paperwork, 'MMM d, yyyy')}
                  </p>
                </div>
                <p className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    Due {formatDetailDate(paperwork.target_completion_date)}
                  </span>
                  {paperwork.actual_completion_date && (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Done {formatDetailDate(paperwork.actual_completion_date)}
                    </span>
                  )}
                  {paperwork.assigned_department && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {paperwork.assigned_department}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <Separator className="my-5" />

            {/* Body */}
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {paperwork.paper_description || 'No description provided.'}
            </p>

            <Separator className="my-5" />

            {/* Details */}
            <div className="divide-y divide-dashed">
              <DetailRow label="Task ID" value={paperwork.paperwork_id} />
              <DetailRow
                label="Target date"
                value={formatDetailDate(paperwork.target_completion_date)}
              />
              <DetailRow
                label="Completed"
                value={formatDetailDate(paperwork.actual_completion_date)}
              />
              <DetailRow
                label="Priority"
                value={paperwork.processing_priority}
              />
              <DetailRow label="Type" value={paperwork.paper_type ?? '—'} />
              <DetailRow label="Source" value={paperwork.paper_source ?? '—'} />
              <DetailRow
                label="Department"
                value={paperwork.assigned_department ?? '—'}
              />
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  )
}
