import { PaperSubmissionFormValues } from '@/lib/schemas'
import { format } from 'date-fns'

export async function paperSubmission(formValues: PaperSubmissionFormValues) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_APP_URL
  const submitPath = '/api/paper/submission'

  const paperData = {
    paper_title: formValues.paper_title,
    paper_description: formValues.paper_description,
    paper_type: formValues.paper_type,
    paper_source: formValues.paper_source,
    processing_priority: formValues.processing_priority,
    target_completion_date: format(
      formValues.target_completion_date,
      'yyyy-MM-dd'
    ),
  }

  const response = await fetch(`${apiBaseUrl}${submitPath}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paperData),
    credentials: 'include',
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message)
  }

  return result
}
