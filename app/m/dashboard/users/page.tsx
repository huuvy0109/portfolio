import { auth } from '@/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import MobileUsersClient from './MobileUsersClient'

export default async function MobileUsersPage() {
  const session = await auth()
  const currentUserId = session!.user!.id!

  const rows = await db.select().from(users)

  const data = rows.map(u => ({
    id: u.id,
    username: u.username,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    isYou: u.id === currentUserId,
  }))

  return <MobileUsersClient users={data} currentUserId={currentUserId} />
}
