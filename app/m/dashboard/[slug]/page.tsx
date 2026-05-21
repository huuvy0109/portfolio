import { auth } from '@/auth'
import { db } from '@/lib/db'
import { projects, testRuns } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import MobileRunsClient from './MobileRunsClient'

export default async function MobileProjectRunsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()
  const userId = session!.user!.id!

  const [project] = await db.select().from(projects)
    .where(eq(projects.slug, slug))
    .limit(1)

  if (!project || project.ownerId !== userId) notFound()

  const runs = await db.select({
    id: testRuns.id,
    status: testRuns.status,
    env: testRuns.env,
    passed: testRuns.passed,
    failed: testRuns.failed,
    skipped: testRuns.skipped,
    durationMs: testRuns.durationMs,
    blobUrl: testRuns.blobUrl,
    createdAt: testRuns.createdAt,
  }).from(testRuns)
    .where(eq(testRuns.projectId, project.id))
    .orderBy(desc(testRuns.createdAt))
    .limit(50)

  const passedCount = runs.filter(r => r.status === 'passed').length
  const passRate = runs.length > 0 ? Math.round((passedCount / runs.length) * 100) : 0
  const totalDurMs = runs.reduce((sum, r) => sum + (parseInt(r.durationMs ?? '0') || 0), 0)
  const avgDurationS = runs.length > 0 ? (totalDurMs / runs.length / 1000) : 0
  const totalTests = runs.reduce((sum, r) => sum + (parseInt(r.passed ?? '0') + parseInt(r.failed ?? '0') + parseInt(r.skipped ?? '0')), 0)

  const serialized = runs.map(r => ({
    id: r.id,
    status: r.status,
    env: r.env,
    passed: r.passed,
    failed: r.failed,
    skipped: r.skipped,
    durationMs: r.durationMs,
    blobUrl: r.blobUrl,
    createdAt: r.createdAt.toISOString(),
  }))

  return (
    <MobileRunsClient
      projectName={project.name}
      projectSlug={project.slug}
      hasCiConfig={!!project.ciConfig}
      runs={serialized}
      passRate={passRate}
      avgDurationS={avgDurationS}
      totalTests={totalTests}
    />
  )
}
