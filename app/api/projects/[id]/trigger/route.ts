import { auth } from '@/auth'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

interface GitHubConfig {
  provider: 'github'
  owner: string
  repo: string
  workflow: string
  ref: string
  token: string
}

interface GitLabConfig {
  provider: 'gitlab'
  host: string
  projectId: string
  ref: string
  token: string
}

type CiConfig = GitHubConfig | GitLabConfig

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const [project] = await db.select().from(projects)
    .where(and(eq(projects.id, id), eq(projects.ownerId, session.user.id)))
    .limit(1)

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  if (!project.ciConfig) return NextResponse.json({ error: 'CI not configured' }, { status: 400 })

  let ci: CiConfig
  try {
    ci = JSON.parse(project.ciConfig) as CiConfig
  } catch {
    return NextResponse.json({ error: 'Invalid CI config' }, { status: 400 })
  }

  // Body from caller (optional: inputs/variables to forward)
  let inputs: Record<string, string> = {}
  try {
    const body = await req.json() as { inputs?: Record<string, string> }
    inputs = body.inputs || {}
  } catch { /* no body */ }

  if (ci.provider === 'github') {
    const url = `https://api.github.com/repos/${ci.owner}/${ci.repo}/actions/workflows/${ci.workflow}/dispatches`
    const ghRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ci.token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: ci.ref, inputs }),
    })
    if (!ghRes.ok) {
      const text = await ghRes.text()
      return NextResponse.json({ error: 'GitHub trigger failed', detail: text }, { status: ghRes.status })
    }
    return NextResponse.json({ triggered: true, provider: 'github' })
  }

  if (ci.provider === 'gitlab') {
    const host = ci.host.replace(/\/$/, '')
    const url = `${host}/api/v4/projects/${encodeURIComponent(ci.projectId)}/trigger/pipeline`
    const form = new URLSearchParams({ token: ci.token, ref: ci.ref })
    Object.entries(inputs).forEach(([k, v]) => form.append(`variables[${k}]`, v))

    const glRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
    if (!glRes.ok) {
      const text = await glRes.text()
      return NextResponse.json({ error: 'GitLab trigger failed', detail: text }, { status: glRes.status })
    }
    const data = await glRes.json() as { id?: number; web_url?: string }
    return NextResponse.json({ triggered: true, provider: 'gitlab', pipelineId: data.id, url: data.web_url })
  }

  return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
}
