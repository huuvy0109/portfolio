import { auth } from '@/auth'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import MobileSettingsClient from './MobileSettingsClient'

export default async function MobileSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session!.user!.id!

  const [project] = await db.select().from(projects)
    .where(and(eq(projects.id, id), eq(projects.ownerId, userId)))
    .limit(1)

  if (!project) notFound()

  return (
    <MobileSettingsClient project={{
      id: project.id,
      name: project.name,
      slug: project.slug,
      jiraConfig: project.jiraConfig,
      trelloConfig: project.trelloConfig,
      ciConfig: project.ciConfig,
      apiKey: project.apiKey,
    }} />
  )
}
