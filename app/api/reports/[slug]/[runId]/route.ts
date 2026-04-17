import { auth } from '@/auth'
import { db } from '@/lib/db'
import { testRuns, testResults } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string; runId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { runId } = await params
  const [run] = await db.select().from(testRuns).where(eq(testRuns.id, runId)).limit(1)
  if (!run) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const results = await db.select().from(testResults).where(eq(testResults.runId, runId))
  return NextResponse.json({ run, results })
}
