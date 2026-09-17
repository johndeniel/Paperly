import { NextRequest, NextResponse } from 'next/server'
import { Query } from '@/lib/db/postgresql-connection-helper'

interface PaperworkRequestBody {
  paper_title: string
  paper_description: string
  paper_type: string
  paper_source: string
  processing_priority: string
  target_completion_date: string
}

export async function POST(request: NextRequest) {
  try {
    // Step 1: Parse and validate request body
    const paperworkRequestBody = (await request.json()) as PaperworkRequestBody

    if (
      !paperworkRequestBody.paper_title ||
      !paperworkRequestBody.paper_description
    ) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Paper title and description are required',
        },
        { status: 400 }
      )
    }

    // Step 2: Insert new paperwork record
    const insertPaperworkResult = await Query({
      query: `
        INSERT INTO paperwork_processing_ticket (
          paper_title,
          paper_description,
          submitted_by_user_id,
          paper_type,
          paper_source,
          processing_priority,
          target_completion_date,
          actual_completion_date,
          completed_by_user_id,
          assigned_department
        ) VALUES ($1, $2, NULL, $3, $4, $5, $6, NULL, NULL, NULL)
        RETURNING paperwork_id
      `,
      values: [
        paperworkRequestBody.paper_title,
        paperworkRequestBody.paper_description,
        paperworkRequestBody.paper_type,
        paperworkRequestBody.paper_source,
        paperworkRequestBody.processing_priority,
        paperworkRequestBody.target_completion_date,
      ],
    })

    const submittedPaperworkId = insertPaperworkResult[0].paperwork_id

    // Step 3: Insert initial workflow log entry
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
        submittedPaperworkId,
        'Reviewed',
        `Submitted paperwork: ${paperworkRequestBody.paper_title}`,
      ],
    })

    // Step 4: Return successful response
    return NextResponse.json(
      {
        code: 'SUCCESS',
        message: 'Paperwork created successfully',
        paperwork_id: submittedPaperworkId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Paperwork creation failed:', error)
    return NextResponse.json(
      { code: 'ERROR', message: 'Failed to create paperwork' },
      { status: 500 }
    )
  }
}
