import { auth } from '@/auth'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import ProjectSettingsClient from './ProjectSettingsClient'

export default async function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params

  const [project] = await db.select().from(projects)
    .where(and(eq(projects.id, id), eq(projects.ownerId, session!.user!.id!)))
    .limit(1)

  if (!project) notFound()

  return <ProjectSettingsClient project={project} />
}
