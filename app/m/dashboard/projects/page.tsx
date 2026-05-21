import { auth } from '@/auth'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import MobileProjectsClient from './MobileProjectsClient'

export default async function MobileProjectsPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const rows = await db.select().from(projects).where(eq(projects.ownerId, userId))

  const data = rows.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    createdAt: p.createdAt.toISOString(),
    hasCi: !!p.ciConfig,
    hasTask: !!(p.jiraConfig || p.trelloConfig),
  }))

  return <MobileProjectsClient projects={data} />
}
