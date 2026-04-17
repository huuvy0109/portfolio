import { auth } from '@/auth'
import { db } from '@/lib/db'
import { testRuns, projects } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import ProjectRunsClient from './ProjectRunsClient'

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  const { slug } = await params

  const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1)
  if (!project || project.ownerId !== session!.user?.id) notFound()

  const runs = await db
    .select()
    .from(testRuns)
    .where(eq(testRuns.projectId, project.id))
    .orderBy(desc(testRuns.createdAt))
    .limit(50)

  return <ProjectRunsClient project={project} initialRuns={runs} />
}
