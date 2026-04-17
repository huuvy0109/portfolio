import { auth } from '@/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import UsersClient from './UsersClient'

export default async function UsersPage() {
  const session = await auth()
  const [me] = await db.select().from(users).where(eq(users.id, session!.user.id)).limit(1)
  if (me?.role !== 'owner') redirect('/dashboard')

  const rows = await db.select({ id: users.id, username: users.username, role: users.role, createdAt: users.createdAt }).from(users)
  return <UsersClient initialUsers={rows} currentUserId={session!.user.id} />
}
