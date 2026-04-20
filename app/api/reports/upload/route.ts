import { auth } from '@/auth'
import { db } from '@/lib/db'
import { testRuns, testResults, projects } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const session = await auth()
    const apiKeyHeader = req.headers.get('X-Api-Key')

    const formData = await req.formData()
    const projectSlug = formData.get('projectSlug') as string
    const env = (formData.get('env') as string) || 'local'
    const htmlFile = formData.get('htmlReport') as File | null
    const jsonFile = formData.get('jsonReport') as File | null
    const summary = JSON.parse((formData.get('summary') as string) || '{}')

    if (!projectSlug) return NextResponse.json({ error: 'projectSlug required' }, { status: 400 })

    // Resolve project
    const [project] = await db.select().from(projects).where(eq(projects.slug, projectSlug)).limit(1)
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // Auth: session cookie (dashboard) hoặc X-Api-Key (CI push)
    const validApiKey = apiKeyHeader && project.apiKey && apiKeyHeader === project.apiKey
    if (!session?.user?.id && !validApiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const runId = `run-${new Date().toISOString().replace(/[:.]/g, '-')}`
    let blobUrl: string | null = null
    let jsonBlobUrl: string | null = null

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.warn('[upload-report] BLOB_READ_WRITE_TOKEN not set — skipping blob upload')
    } else {
      // Upload HTML report — optional, don't abort if blob fails
      try {
        if (htmlFile) {
          const { url } = await put(`reports/${projectSlug}/${runId}/index.html`, htmlFile, { access: 'public' })
          blobUrl = url
        }
      } catch (blobErr) {
        console.warn('[upload-report] HTML blob upload failed:', blobErr)
      }

      // Upload JSON report — optional
      try {
        if (jsonFile) {
          const { url } = await put(`reports/${projectSlug}/${runId}/results.json`, jsonFile, { access: 'public' })
          jsonBlobUrl = url
        }
      } catch (blobErr) {
        console.warn('[upload-report] JSON blob upload failed:', blobErr)
      }
    }

    // Calculate expires_at (+6 months)
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 6)

    // Insert run
    const [run] = await db.insert(testRuns).values({
      projectId: project.id,
      triggeredBy: session?.user?.id ?? null,
      env: env as 'local' | 'ci',
      status: summary.status || 'passed',
      blobUrl,
      jsonBlobUrl,
      totalTests: String(summary.total || 0),
      passed: String(summary.passed || 0),
      failed: String(summary.failed || 0),
      skipped: String(summary.skipped || 0),
      durationMs: String(summary.durationMs || 0),
      expiresAt,
    }).returning()

    // Insert individual test results if provided
    const results = summary.results as Array<{
      title: string; file: string; status: string; durationMs: number; errorMessage?: string; retryCount?: number
    }> | undefined

    if (results?.length) {
      await db.insert(testResults).values(
        results.map(r => ({
          runId: run.id,
          title: r.title,
          file: r.file,
          status: r.status as 'passed' | 'failed' | 'skipped' | 'flaky',
          durationMs: String(r.durationMs),
          errorMessage: r.errorMessage || null,
          retryCount: String(r.retryCount || 0),
        }))
      )
    }

    return NextResponse.json({ runId: run.id, blobUrl, jsonBlobUrl }, { status: 201 })
  } catch (err) {
    console.error('[upload-report] Unhandled error:', err)
    return NextResponse.json(
      { error: 'Internal server error', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
