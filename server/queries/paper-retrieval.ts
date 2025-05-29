import type { Task } from '@/lib/types'

export async function paperRetrieval(): Promise<Task[]> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_APP_URL
  const tasksPath = '/api/paper/retrieval'

  try {
    const response = await fetch(`${apiBaseUrl}${tasksPath}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to retrieve papers')
    }

    // Handle different response structures
    const tasks = Array.isArray(result)
      ? result
      : result.tasks || result.data || []

    // Ensure all tasks have proper structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return tasks.map((task: any) => ({
      id: task.id,
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate || '',
      dateCompleted:
        task.dateCompleted === 'undefined' || task.dateCompleted === null
          ? undefined
          : task.dateCompleted,
      priority: task.priority || 'Low',
    }))
  } catch (error) {
    console.error('Paper retrieval error:', error)
    throw error
  }
}
