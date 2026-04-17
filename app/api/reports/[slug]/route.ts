import { auth } from '@/auth'
import { db } from '@/lib/db'
import { testRuns, testResults, projects } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1)
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const runs = await db
    .select()
    .from(testRuns)
    .where(eq(testRuns.projectId, project.id))
    .orderBy(desc(testRuns.createdAt))
    .limit(50)

  return NextResponse.json({ project, runs })
}
