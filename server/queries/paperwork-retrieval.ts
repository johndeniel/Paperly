import type { Paperwork } from '@/lib/types'

export async function paperworkRetrieval(): Promise<Paperwork[]> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_APP_URL
  const paperworkPath = '/api/paperwork/retrieval'

  try {
    const response = await fetch(`${apiBaseUrl}${paperworkPath}`, {
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

    const paperworkFromApi = result.paperwork || []

    return paperworkFromApi.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any): Paperwork => ({
        paperwork_id: item.paperwork_id,
        paper_title: item.paper_title,
        paper_description: item.paper_description,
        processing_priority: item.processing_priority,
        target_completion_date: item.target_completion_date,
        actual_completion_date: item.actual_completion_date,
      })
    )
  } catch (error) {
    console.error('Paper retrieval error:', error)
    throw error
  }
}
