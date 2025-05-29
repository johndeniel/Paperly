import { NextResponse } from 'next/server'
import { Query } from '@/lib/db/postgresql-connection-helper'
import { getAuthenticatedUser } from '@/lib/jwt'

interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  dateCompleted?: string
  priority: string
}

interface ApiResponse {
  code: string
  message: string
  tasks?: Task[]
  error?: string
}

export async function GET(): Promise<NextResponse> {
  try {
    // Step 1: Authenticate user
    const authenticatedUser = await getAuthenticatedUser()

    if (!authenticatedUser?.division) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const tasks = await fetchTasksByDivision(authenticatedUser.division)
    return createResponse('SUCCESS', 'Tasks retrieved successfully', 200, {
      tasks,
    })
  } catch (error) {
    console.error('Task retrieval error:', error)
    return createResponse('TASKS_ERROR', 'Failed to retrieve tasks', 500)
  }
}

function createResponse(
  code: string,
  message: string,
  status: number,
  data?: { tasks?: Task[]; error?: string }
): NextResponse {
  const responseBody: ApiResponse = { code, message }

  if (data?.tasks) responseBody.tasks = data.tasks
  if (data?.error) responseBody.error = data.error

  return NextResponse.json(responseBody, { status })
}

async function fetchTasksByDivision(divisionId: string): Promise<Task[]> {
  const query = {
    query: `
      SELECT DISTINCT 
        ppt.paperwork_id AS id, 
        ppt.paper_title AS title, 
        ppt.paper_description AS description, 
        TO_CHAR(ppt.target_completion_date, 'DD-MM-YYYY') AS "dueDate", 
        CASE 
          WHEN ppt.actual_completion_date IS NULL THEN NULL 
          ELSE TO_CHAR(ppt.actual_completion_date, 'DD-MM-YYYY') 
        END AS "dateCompleted",
        ppt.processing_priority AS priority 
      FROM paperwork_processing_ticket ppt 
      INNER JOIN paper_processing_workflow ppw ON ppt.paperwork_id = ppw.paperwork_id 
      WHERE ppw.target_department = $1
    `,
    values: [divisionId],
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawTasks = (await Query(query)) as any[]

  // Transform the data to ensure proper typing and handle null values
  return rawTasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    dateCompleted:
      task.dateCompleted === null || task.dateCompleted === 'undefined'
        ? undefined
        : task.dateCompleted,
    priority: task.priority,
  }))
}
