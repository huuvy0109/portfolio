import { auth } from '@/auth'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const [project] = await db.select().from(projects)
    .where(and(eq(projects.id, id), eq(projects.ownerId, session.user.id)))
    .limit(1)

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const apiKey = randomBytes(32).toString('hex') // 64-char hex string

  await db.update(projects)
    .set({ apiKey })
    .where(eq(projects.id, id))

  return NextResponse.json({ apiKey })
}
