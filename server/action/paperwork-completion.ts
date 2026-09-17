import type { Paperwork } from '@/lib/types'

export async function paperworkCompletion(
  paperworkId: string,
  action: 'complete' | 'reopen'
): Promise<Paperwork> {
  const response = await fetch(`/api/paperwork/${paperworkId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action }),
    credentials: 'include',
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update paperwork')
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
