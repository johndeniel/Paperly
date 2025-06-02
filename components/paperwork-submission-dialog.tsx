'use client'

import { format, isBefore, startOfDay } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Paperwork } from '@/lib/types'
import { formatDateToString } from '@/lib/task-utils'
import { paperworkSubmission } from '@/server/action/paperwork-submission'
import { toast } from 'sonner'

import { paperSubmissionSchema, PaperSubmissionFormValues } from '@/lib/schemas'

interface PaperworkSubmissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPaperworkSubmit: (paperwork: Paperwork) => void
  defaultCompletionDate?: Date
}

export function PaperworkSubmissionDialog({
  open,
  onOpenChange,
  onPaperworkSubmit,
  defaultCompletionDate,
}: PaperworkSubmissionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PaperSubmissionFormValues>({
    resolver: zodResolver(paperSubmissionSchema),
    defaultValues: {
      paper_title: '',
      paper_description: '',
      paper_type: 'Physical Paper',
      paper_source: 'Internal Source',
      processing_priority: 'Low',
      target_completion_date: defaultCompletionDate || new Date(),
    },
  })

  const onSubmit = async (values: PaperSubmissionFormValues) => {
    setIsSubmitting(true)

    try {
      const response = await paperworkSubmission(values)

      const newPaperwork: Paperwork = {
        paperwork_id: response.paperwork_id,
        paper_title: values.paper_title,
        paper_description: values.paper_description,
        processing_priority: values.processing_priority,
        target_completion_date: formatDateToString(
          values.target_completion_date
        ),
        actual_completion_date: undefined,
      }

      onPaperworkSubmit(newPaperwork)
      onOpenChange(false)
      form.reset()
      toast.success('Paperwork submitted successfully.')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[70vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Paperwork</DialogTitle>
          <DialogDescription>
            Fill out the details below to add a new paperwork to your system.
          </DialogDescription>
        </DialogHeader>

        <Separator className="mb-2" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="paper_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paper Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paper_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paper Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a brief summary or notes about the paper"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="paper_type"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Paper Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Physical Paper">
                          Physical Paper
                        </SelectItem>
                        <SelectItem value="Digital Paper">
                          Digital Paper
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paper_source"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Paper Source</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Internal Source">
                          Internal Source
                        </SelectItem>
                        <SelectItem value="External Source">
                          External Source
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="processing_priority"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Processing Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_completion_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Target Completion Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, 'PPP')
                              : 'Select date'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={date =>
                            isBefore(date, startOfDay(new Date()))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-2" />

            <Separator />

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
