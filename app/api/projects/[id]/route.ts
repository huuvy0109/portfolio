import { auth } from '@/auth'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = session.user.id

    const { id } = await params
    const body = await req.json() as {
      name?: string; slug?: string
      jiraConfig?: string | null; trelloConfig?: string | null; ciConfig?: string | null
    }

    type ProjectPatch = { name?: string; slug?: string; jiraConfig?: string | null; trelloConfig?: string | null; ciConfig?: string | null }
    const patch: ProjectPatch = {}
    if (body.name)                        patch.name = body.name
    if (body.slug)                        patch.slug = body.slug
    if (body.jiraConfig !== undefined)    patch.jiraConfig = body.jiraConfig
    if (body.trelloConfig !== undefined)  patch.trelloConfig = body.trelloConfig
    if (body.ciConfig !== undefined)      patch.ciConfig = body.ciConfig

    if (Object.keys(patch).length === 0)
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

    const [updated] = await db
      .update(projects)
      .set(patch)
      .where(and(eq(projects.id, id), eq(projects.ownerId, userId)))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PATCH /api/projects/[id]]', err)
    return NextResponse.json(
      { error: 'Internal server error', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const { id } = await params

  await db.delete(projects).where(and(eq(projects.id, id), eq(projects.ownerId, userId)))
  return NextResponse.json({ ok: true })
}
