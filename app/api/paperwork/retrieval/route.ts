// app/api/paper/retrieval/route.ts (or your specific path)

import { NextResponse } from 'next/server'
import { Query } from '@/lib/db/postgresql-connection-helper' // Adjust path as needed
import { getAuthenticatedUser } from '@/lib/jwt' // Adjust path as needed
import type { Priority } from '@/lib/types' // Assuming Priority is defined and exported from here

// Interface for the structure of paperwork items returned by this API
interface ApiPaperworkItem {
  paperwork_id: string
  paper_title: string
  paper_description: string
  processing_priority: Priority
  target_completion_date: string // Format: DD-MM-YYYY
  actual_completion_date?: string // Format: DD-MM-YYYY, or undefined
}

// Interface for the overall API response structure
interface ApiResponse {
  code: string
  message: string
  paperwork?: ApiPaperworkItem[]
  error?: string
}

export async function GET(): Promise<NextResponse> {
  try {
    const authenticatedUser = await getAuthenticatedUser()

    if (!authenticatedUser?.division) {
      return createJsonResponse('UNAUTHORIZED', 'Authentication required', 401)
    }

    const paperworkItems = await fetchPaperworkByDivision(
      authenticatedUser.division
    )
    return createJsonResponse(
      'SUCCESS',
      'Paperwork retrieved successfully',
      200,
      {
        paperwork: paperworkItems,
      }
    )
  } catch (error) {
    console.error('Paperwork retrieval error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to retrieve paperwork'
    return createJsonResponse('PAPERWORK_ERROR', errorMessage, 500)
  }
}

function createJsonResponse(
  code: string,
  message: string,
  status: number,
  data?: { paperwork?: ApiPaperworkItem[]; error?: string }
): NextResponse {
  const responseBody: ApiResponse = { code, message }

  if (data?.paperwork) {
    responseBody.paperwork = data.paperwork
  }
  if (data?.error) {
    responseBody.error = data.error
  }

  return NextResponse.json(responseBody, { status })
}

async function fetchPaperworkByDivision(
  divisionId: string
): Promise<ApiPaperworkItem[]> {
  const sqlQuery = {
    query: `
      SELECT DISTINCT 
        ppt.paperwork_id, 
        ppt.paper_title, 
        ppt.paper_description, 
        ppt.processing_priority,
        -- Ensure target_completion_date is always a string, defaulting to empty if NULL
        COALESCE(TO_CHAR(ppt.target_completion_date, 'DD-MM-YYYY'), '') AS target_completion_date, 
        -- actual_completion_date will be NULL if the DB field is NULL
        TO_CHAR(ppt.actual_completion_date, 'DD-MM-YYYY') AS actual_completion_date
      FROM paperwork_processing_ticket ppt 
      INNER JOIN paper_processing_workflow ppw ON ppt.paperwork_id = ppw.paperwork_id 
      WHERE ppw.target_department = $1
    `,
    values: [divisionId],
  }

  // Assuming Query returns an array of records from the database
  const rawPaperworkItems = (await Query(sqlQuery)) as Array<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, any>
  >

  // Map database results to the ApiPaperworkItem structure.
  // This is the primary mapping on the backend.
  return rawPaperworkItems.map(
    (item): ApiPaperworkItem => ({
      paperwork_id: item.paperwork_id as string,
      paper_title: (item.paper_title as string | null) || '', // Default to empty string if null
      paper_description: (item.paper_description as string | null) || '', // Default to empty string if null
      processing_priority:
        (item.processing_priority as Priority | null) || ('Low' as Priority), // Default to 'Low'
      target_completion_date: item.target_completion_date as string, // Already a string due to COALESCE
      actual_completion_date:
        (item.actual_completion_date as string | null) === null
          ? undefined
          : (item.actual_completion_date as string), // Convert null to undefined
    })
  )
}
