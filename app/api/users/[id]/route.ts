import { auth } from '@/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  // Owner can update anyone, member can only update themselves
  const [me] = await db.select().from(users).where(eq(users.id, session.user.id!)).limit(1)
  if (me?.role !== 'owner' && id !== session.user.id!) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { password, role } = await req.json()
  const updates: Record<string, string> = {}
  if (password) updates.passwordHash = await hash(password, 12)
  if (role && me?.role === 'owner') updates.role = role

  const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning({
    id: users.id, username: users.username, role: users.role,
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const [me] = await db.select().from(users).where(eq(users.id, session.user.id!)).limit(1)
  if (me?.role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (id === session.user.id!) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })

  await db.delete(users).where(eq(users.id, id))
  return NextResponse.json({ ok: true })
}
