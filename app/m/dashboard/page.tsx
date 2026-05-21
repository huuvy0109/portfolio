import { auth } from '@/auth'
import { db } from '@/lib/db'
import { projects, testRuns, users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import MobileOverviewClient from './MobileOverviewClient'

export default async function MobileOverviewPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const [projectRows, userRows, runRows] = await Promise.all([
    db.select().from(projects).where(eq(projects.ownerId, userId)),
    db.select().from(users),
    db.select({
      id: testRuns.id, status: testRuns.status, projectId: testRuns.projectId, createdAt: testRuns.createdAt,
    }).from(testRuns).orderBy(desc(testRuns.createdAt)).limit(50),
  ])

  const passed = runRows.filter(r => r.status === 'passed').length
  const passRate = runRows.length > 0 ? Math.round((passed / runRows.length) * 100) : 0
  const projectMap = new Map(projectRows.map(p => [p.id, p]))

  const recentRuns = runRows.slice(0, 6).map(r => ({
    id: r.id,
    status: r.status,
    projectName: projectMap.get(r.projectId)?.name ?? 'Unknown',
    projectSlug: projectMap.get(r.projectId)?.slug ?? '',
    createdAt: r.createdAt.toISOString(),
  }))

  return (
    <MobileOverviewClient
      username={session!.user?.name ?? 'unknown'}
      totalProjects={projectRows.length}
      totalRuns={runRows.length}
      passRate={passRate}
      totalUsers={userRows.length}
      recentRuns={recentRuns}
    />
  )
}
