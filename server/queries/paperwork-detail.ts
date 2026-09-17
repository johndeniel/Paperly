import type { Paperwork } from '@/lib/types'

export async function paperworkDetailRetrieval(
  paperworkId: string
): Promise<Paperwork> {
  const response = await fetch(`/api/paperwork/${paperworkId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Failed to retrieve paperwork')
  }

  const item = result.paperwork

  return {
    paperwork_id: item.paperwork_id,
    paper_title: item.paper_title,
    paper_description: item.paper_description,
    processing_priority: item.processing_priority,
    target_completion_date: item.target_completion_date,
    actual_completion_date: item.actual_completion_date,
    paper_type: item.paper_type,
    paper_source: item.paper_source,
    assigned_department: item.assigned_department,
    submitted_by_user_id: item.submitted_by_user_id,
    completed_by_user_id: item.completed_by_user_id,
  } satisfies Paperwork
}
