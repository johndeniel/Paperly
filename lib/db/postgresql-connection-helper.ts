import { Pool, QueryResult, QueryResultRow } from 'pg'

/**
 * PostgreSQL database connection and query utility for Next.js
 */
interface QueryParams {
  query: string
  values?: (string | number | boolean | null | Date)[]
}

// Create connection pool using environment variable
const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
  // SSL configuration is handled by the sslmode=require in the connection string
})

// Handle pool errors
pool.on('error', err => {
  console.error('Unexpected database error:', err)
})

/**
 * Execute a database query
 */
export async function Query({
  query,
  values = [],
}: QueryParams): Promise<QueryResultRow[]> {
  const client = await pool.connect()
  try {
    const result: QueryResult = await client.query(query, values)
    return result.rows
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Database error: ${message}`)
  } finally {
    client.release()
  }
}
