import { z } from 'zod'
import { isBefore, startOfDay } from 'date-fns'

export const loginFormSchema = z.object({
  username: z.string().min(8, 'Username must be at least 8 characters.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

export type LoginCredentials = z.infer<typeof loginFormSchema>

export const paperSubmissionSchema = z.object({
  paper_title: z.string().min(1, 'Title is required'),
  paper_description: z.string().min(1, 'Description is required'),
  paper_type: z.enum(['Physical Paper', 'Digital Paper']),
  paper_source: z.enum(['Internal Source', 'External Source']),
  processing_priority: z.enum(['High', 'Medium', 'Low']),
  target_completion_date: z
    .date()
    .refine(
      date => !isBefore(date, startOfDay(new Date())),
      'Target completion date cannot be in the past'
    ),
})

export type PaperSubmissionFormValues = z.infer<typeof paperSubmissionSchema>
