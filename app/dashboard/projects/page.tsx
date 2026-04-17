import { auth } from '@/auth'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import ProjectsClient from './ProjectsClient'

export default async function ProjectsPage() {
  const session = await auth()
  const rows = await db.select().from(projects).where(eq(projects.ownerId, session!.user.id))
  return <ProjectsClient initialProjects={rows} />
}
