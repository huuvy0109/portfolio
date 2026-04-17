import { auth } from '@/auth'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const { id } = await params
  const { name, slug, jiraConfig, trelloConfig } = await req.json()

  const [updated] = await db
    .update(projects)
    .set({ ...(name && { name }), ...(slug && { slug }), ...(jiraConfig !== undefined && { jiraConfig }), ...(trelloConfig !== undefined && { trelloConfig }) })
    .where(and(eq(projects.id, id), eq(projects.ownerId, userId)))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const { id } = await params

  await db.delete(projects).where(and(eq(projects.id, id), eq(projects.ownerId, userId)))
  return NextResponse.json({ ok: true })
}
