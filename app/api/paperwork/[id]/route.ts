import { NextRequest, NextResponse } from 'next/server'
import { Query } from '@/lib/db/postgresql-connection-helper'
import type { Priority } from '@/lib/types'

interface ApiPaperworkDetail {
  paperwork_id: string
  paper_title: string
  paper_description: string
  processing_priority: Priority
  target_completion_date: string
  actual_completion_date?: string
  paper_type?: string
  paper_source?: string
  assigned_department?: string | null
  submitted_by_user_id?: string | null
  completed_by_user_id?: string | null
}

const DETAIL_SELECT = `
  SELECT
    ppt.paperwork_id,
    ppt.paper_title,
    ppt.paper_description,
    ppt.processing_priority,
    COALESCE(TO_CHAR(ppt.target_completion_date, 'DD-MM-YYYY'), '') AS target_completion_date,
    TO_CHAR(ppt.actual_completion_date, 'DD-MM-YYYY') AS actual_completion_date,
    ppt.paper_type,
    ppt.paper_source,
    ppt.assigned_department,
    ppt.submitted_by_user_id,
    ppt.completed_by_user_id
  FROM paperwork_processing_ticket ppt
  WHERE ppt.paperwork_id = $1
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToDetail(item: Record<string, any>): ApiPaperworkDetail {
  return {
    paperwork_id: item.paperwork_id as string,
    paper_title: (item.paper_title as string | null) || '',
    paper_description: (item.paper_description as string | null) || '',
    processing_priority:
      (item.processing_priority as Priority | null) || ('Low' as Priority),
    target_completion_date: item.target_completion_date as string,
    actual_completion_date:
      (item.actual_completion_date as string | null) === null
        ? undefined
        : (item.actual_completion_date as string),
    paper_type: (item.paper_type as string | null) || undefined,
    paper_source: (item.paper_source as string | null) || undefined,
    assigned_department: (item.assigned_department as string | null) ?? null,
    submitted_by_user_id: (item.submitted_by_user_id as string | null) ?? null,
    completed_by_user_id: (item.completed_by_user_id as string | null) ?? null,
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Paperwork id is required' },
        { status: 400 }
      )
    }

    const rows = (await Query({
      query: DETAIL_SELECT,
      values: [id],
    })) as Array<Record<string, unknown>>

    if (rows.length === 0) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'Paperwork not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        code: 'SUCCESS',
        message: 'Paperwork retrieved successfully',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        paperwork: mapRowToDetail(rows[0] as Record<string, any>),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Paperwork detail retrieval error:', error)
    return NextResponse.json(
      { code: 'PAPERWORK_ERROR', message: 'Failed to retrieve paperwork' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Paperwork id is required' },
        { status: 400 }
      )
    }

    const body = (await request.json()) as { action?: string }
    const action = body.action

    if (action !== 'complete' && action !== 'reopen') {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: "Action must be either 'complete' or 'reopen'",
        },
        { status: 400 }
      )
    }

    const updatedRows = (await Query({
      query: `
        UPDATE paperwork_processing_ticket
        SET actual_completion_date = ${action === 'complete' ? 'NOW()' : 'NULL'}
        WHERE paperwork_id = $1
        RETURNING
          paperwork_id,
          paper_title,
          paper_description,
          processing_priority,
          COALESCE(TO_CHAR(target_completion_date, 'DD-MM-YYYY'), '') AS target_completion_date,
          TO_CHAR(actual_completion_date, 'DD-MM-YYYY') AS actual_completion_date,
          paper_type,
          paper_source,
          assigned_department,
          submitted_by_user_id,
          completed_by_user_id
      `,
      values: [id],
    })) as Array<Record<string, unknown>>

    if (updatedRows.length === 0) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'Paperwork not found' },
        { status: 404 }
      )
    }

    // Audit trail: record the completion / reopen event in the workflow log.
    // Best-effort only — a logging failure must not fail the status update.
    try {
      await Query({
        query: `
          INSERT INTO paper_processing_workflow (
            paperwork_id,
            performed_by_user_id,
            workflow_action,
            target_department,
            action_notes
          ) VALUES ($1, NULL, $2, NULL, $3)
        `,
        values: [
          id,
          action === 'complete' ? 'Completed' : 'Reopened',
          action === 'complete'
            ? 'Marked paperwork as complete'
            : 'Reopened paperwork',
        ],
      })
    } catch (logError) {
      console.error('Paperwork workflow log failed:', logError)
    }

    return NextResponse.json(
      {
        code: 'SUCCESS',
        message:
          action === 'complete'
            ? 'Paperwork marked as complete'
            : 'Paperwork reopened',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        paperwork: mapRowToDetail(updatedRows[0] as Record<string, any>),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Paperwork status update error:', error)
    return NextResponse.json(
      { code: 'PAPERWORK_ERROR', message: 'Failed to update paperwork' },
      { status: 500 }
    )
  }
}
