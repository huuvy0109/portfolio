import { auth } from '@/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only owner can list users
  const [me] = await db.select().from(users).where(eq(users.id, session.user.id!)).limit(1)
  if (me?.role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const rows = await db.select({ id: users.id, username: users.username, role: users.role, createdAt: users.createdAt }).from(users)
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [me] = await db.select().from(users).where(eq(users.id, session.user.id!)).limit(1)
  if (me?.role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { username, password, role } = await req.json()
  if (!username || !password) return NextResponse.json({ error: 'username and password required' }, { status: 400 })

  const passwordHash = await hash(password, 12)
  const [user] = await db.insert(users).values({ username, passwordHash, role: role || 'member' }).returning({
    id: users.id, username: users.username, role: users.role, createdAt: users.createdAt,
  })

  return NextResponse.json(user, { status: 201 })
}
