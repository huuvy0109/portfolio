import { auth } from '@/auth'
import { db } from '@/lib/db'
import { projects, userProjects } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.ownerId, session.user.id!))

  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, slug } = await req.json()
  if (!name || !slug) return NextResponse.json({ error: 'name and slug required' }, { status: 400 })

  const [project] = await db
    .insert(projects)
    .values({ name, slug, ownerId: session.user.id })
    .returning()

  await db.insert(userProjects).values({
    userId: session.user.id,
    projectId: project.id,
    role: 'admin',
  })

  return NextResponse.json(project, { status: 201 })
}
