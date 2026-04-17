'use client'

import { useState } from 'react'

interface Project {
  id: string; name: string; slug: string
  jiraConfig: string | null; trelloConfig: string | null
  ciConfig: string | null; apiKey: string | null
}

function parseConfig(raw: string | null) {
  if (!raw) return {} as Record<string, string>
  try { return JSON.parse(raw) as Record<string, string> } catch { return {} as Record<string, string> }
}

type Tab = 'task' | 'ci'
type TaskTool = 'jira' | 'trello'

function InputField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="px-3 py-2 rounded font-mono text-xs outline-none"
        style={{ background: 'var(--surface-mid)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
      />
    </div>
  )
}

export default function ProjectSettingsClient({ project }: { project: Project }) {
  const jira   = parseConfig(project.jiraConfig)
  const trello = parseConfig(project.trelloConfig)
  const ci     = parseConfig(project.ciConfig)

  const defaultTab: Tab = project.ciConfig ? 'ci' : 'task'
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)

  // Task Management — tool selector
  const defaultTool: TaskTool = project.trelloConfig ? 'trello' : 'jira'
  const [activeTool, setActiveTool] = useState<TaskTool>(defaultTool)

  // Jira fields
  const [jiraHost,    setJiraHost]    = useState(jira.host || '')
  const [jiraEmail,   setJiraEmail]   = useState(jira.email || '')
  const [jiraToken,   setJiraToken]   = useState('')
  const [jiraProject, setJiraProject] = useState(jira.projectKey || '')

  // Trello fields
  const [trelloKey,   setTrelloKey]   = useState(trello.key || '')
  const [trelloToken, setTrelloToken] = useState('')
  const [trelloBoard, setTrelloBoard] = useState(trello.boardId || '')

  // CI fields
  const [ciProvider,  setCiProvider]  = useState<'github' | 'gitlab'>(
    (ci.provider as 'github' | 'gitlab') || 'github'
  )
  const [ciOwner,     setCiOwner]     = useState(ci.owner || '')
  const [ciRepo,      setCiRepo]      = useState(ci.repo || '')
  const [ciProjectId, setCiProjectId] = useState(ci.projectId || '')
  const [ciHost,      setCiHost]      = useState(ci.host || 'https://gitlab.com')
  const [ciWorkflow,  setCiWorkflow]  = useState(ci.workflow || '')
  const [ciRef,       setCiRef]       = useState(ci.ref || 'main')
  const [ciToken,     setCiToken]     = useState('')

  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [apiKeyCopied, setApiKeyCopied] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    let body: Record<string, unknown> = {}

    if (activeTab === 'task') {
      if (activeTool === 'jira') {
        body = {
          jiraConfig: JSON.stringify({ host: jiraHost, email: jiraEmail, token: jiraToken, projectKey: jiraProject }),
          trelloConfig: null,
        }
      } else {
        body = {
          trelloConfig: JSON.stringify({ key: trelloKey, token: trelloToken, boardId: trelloBoard }),
          jiraConfig: null,
        }
      }
    } else {
      const ciPayload =
        ciProvider === 'github'
          ? { provider: 'github', owner: ciOwner, repo: ciRepo, workflow: ciWorkflow, ref: ciRef, token: ciToken }
          : { provider: 'gitlab', host: ciHost, projectId: ciProjectId, ref: ciRef, token: ciToken }
      body = { ciConfig: JSON.stringify(ciPayload) }
    }

    await fetch(`/api/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleGenerateApiKey() {
    const res = await fetch(`/api/projects/${project.id}/api-key`, { method: 'POST' })
    const data = await res.json() as { apiKey?: string }
    if (data.apiKey) {
      await navigator.clipboard.writeText(data.apiKey)
      setApiKeyCopied(true)
      setTimeout(() => setApiKeyCopied(false), 3000)
    }
  }

  const tabs: { key: Tab; label: string; accent: string; border: string; bg: string }[] = [
    { key: 'task', label: '// Task Management', accent: 'var(--accent-blue)',   border: 'rgba(96,165,250,0.4)',  bg: 'rgba(96,165,250,0.08)' },
    { key: 'ci',   label: '// CI',              accent: 'var(--accent-purple)', border: 'rgba(192,132,252,0.4)', bg: 'rgba(192,132,252,0.08)' },
  ]

  return (
    <div className="max-w-xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-8">
        <a href={`/dashboard/${project.slug}`} className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
          ← {project.name}
        </a>
        <span style={{ color: 'var(--border-dim)' }}>/</span>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--accent-cyan)' }}>// SETTINGS</div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Integration Config
          </h1>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => {
          const active = activeTab === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className="font-mono text-xs px-4 py-2 rounded transition-all duration-200"
              style={{
                background: active ? t.bg : 'transparent',
                border: `1px solid ${active ? t.border : 'var(--border-dim)'}`,
                color: active ? t.accent : 'var(--text-muted)',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">

        {/* TASK MANAGEMENT TAB */}
        {activeTab === 'task' && (
          <div className="rounded-xl p-5 flex flex-col gap-5" style={{ background: 'var(--surface-low)', border: '1px solid rgba(96,165,250,0.12)' }}>
            {/* Tool selector */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Tool</label>
              <div className="flex gap-2">
                {([
                  { key: 'jira'   as TaskTool, label: '⬡ Jira',   accent: 'var(--accent-blue)',  border: 'rgba(96,165,250,0.4)',  bg: 'rgba(96,165,250,0.1)' },
                  { key: 'trello' as TaskTool, label: '⬡ Trello', accent: 'var(--accent-green)', border: 'rgba(0,229,160,0.35)', bg: 'rgba(0,229,160,0.08)' },
                ]).map(tool => (
                  <button
                    key={tool.key}
                    type="button"
                    onClick={() => setActiveTool(tool.key)}
                    className="font-mono text-xs px-4 py-1.5 rounded transition-all duration-150"
                    style={{
                      background: activeTool === tool.key ? tool.bg : 'transparent',
                      border: `1px solid ${activeTool === tool.key ? tool.border : 'var(--border-dim)'}`,
                      color: activeTool === tool.key ? tool.accent : 'var(--text-muted)',
                    }}
                  >
                    {tool.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Jira fields */}
            {activeTool === 'jira' && (
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Host"        value={jiraHost}    onChange={setJiraHost}    placeholder="https://yourcompany.atlassian.net" />
                <InputField label="Email"       value={jiraEmail}   onChange={setJiraEmail}   placeholder="you@company.com" />
                <InputField label="API Token"   value={jiraToken}   onChange={setJiraToken}   placeholder={jira.token ? '••••••••' : 'ATATT3x...'} type="password" />
                <InputField label="Project Key" value={jiraProject} onChange={setJiraProject} placeholder="QA" />
              </div>
            )}

            {/* Trello fields */}
            {activeTool === 'trello' && (
              <div className="grid grid-cols-2 gap-4">
                <InputField label="API Key"  value={trelloKey}   onChange={setTrelloKey}   placeholder="abc123..." />
                <InputField label="Token"    value={trelloToken} onChange={setTrelloToken} placeholder={trello.token ? '••••••••' : 'def456...'} type="password" />
                <InputField label="Board ID" value={trelloBoard} onChange={setTrelloBoard} placeholder="boardId" />
              </div>
            )}
          </div>
        )}

        {/* CI TAB */}
        {activeTab === 'ci' && (
          <div className="rounded-xl p-5 flex flex-col gap-5" style={{ background: 'var(--surface-low)', border: '1px solid rgba(192,132,252,0.12)' }}>
            {/* Provider toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Provider</label>
              <div className="flex gap-2">
                {(['github', 'gitlab'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCiProvider(p)}
                    className="font-mono text-xs px-4 py-1.5 rounded transition-all duration-150"
                    style={{
                      background: ciProvider === p ? 'rgba(192,132,252,0.12)' : 'transparent',
                      border: `1px solid ${ciProvider === p ? 'rgba(192,132,252,0.4)' : 'var(--border-dim)'}`,
                      color: ciProvider === p ? 'var(--accent-purple)' : 'var(--text-muted)',
                    }}
                  >
                    {p === 'github' ? '⬡ GitHub' : '⬡ GitLab'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {ciProvider === 'github' ? (
                <>
                  <InputField label="Owner / Org"            value={ciOwner}    onChange={setCiOwner}    placeholder="HuuVQ" />
                  <InputField label="Repository"             value={ciRepo}     onChange={setCiRepo}     placeholder="automation-portfolio" />
                  <InputField label="Workflow file"          value={ciWorkflow} onChange={setCiWorkflow} placeholder="playwright.yml" />
                  <InputField label="Branch / Ref"           value={ciRef}      onChange={setCiRef}      placeholder="main" />
                  <div className="col-span-2">
                    <InputField label="Personal Access Token" value={ciToken}   onChange={setCiToken}
                      placeholder={ci.token ? '••••••••' : 'ghp_...'} type="password" />
                  </div>
                </>
              ) : (
                <>
                  <InputField label="GitLab Host"            value={ciHost}      onChange={setCiHost}      placeholder="https://gitlab.com" />
                  <InputField label="Project ID"             value={ciProjectId} onChange={setCiProjectId} placeholder="12345678" />
                  <InputField label="Branch / Ref"           value={ciRef}       onChange={setCiRef}       placeholder="main" />
                  <div className="col-span-2">
                    <InputField label="Pipeline Trigger Token" value={ciToken}   onChange={setCiToken}
                      placeholder={ci.token ? '••••••••' : 'glptt-...'} type="password" />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving}
            className="btn-primary font-mono text-sm py-2.5 rounded px-8 disabled:opacity-50">
            {saving ? '// saving...' : saved ? '✓ Saved' : '→ Save Settings'}
          </button>
          {saved && (
            <span className="font-mono text-[11px]" style={{ color: 'var(--accent-green)' }}>
              Config saved — old token overwritten
            </span>
          )}
        </div>
      </form>

      {/* CI Push Token section */}
      <div className="mt-10 pt-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--accent-cyan)' }}>
          // CI PUSH TOKEN
        </div>
        <p className="font-mono text-[11px] mb-4" style={{ color: 'var(--text-muted)' }}>
          Dùng header <span style={{ color: 'var(--accent-orange)' }}>X-Api-Key</span> khi CI push report lên{' '}
          <span style={{ color: 'var(--accent-cyan)' }}>POST /api/reports/upload</span>
        </p>
        <div className="flex items-center gap-3">
          {project.apiKey && (
            <span className="font-mono text-xs px-3 py-1.5 rounded" style={{
              background: 'var(--surface-low)', border: '1px solid var(--border-dim)',
              color: 'var(--text-secondary)', letterSpacing: '0.05em',
            }}>
              {project.apiKey.slice(0, 8)}••••••••••••••••••••••••
            </span>
          )}
          <button
            type="button"
            onClick={handleGenerateApiKey}
            className="font-mono text-xs px-4 py-1.5 rounded transition-all duration-150"
            style={{
              background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)',
              color: 'var(--accent-cyan)',
            }}
          >
            {apiKeyCopied ? '✓ Copied!' : project.apiKey ? '↺ Regenerate & Copy' : '+ Generate API Key'}
          </button>
        </div>
      </div>
    </div>
  )
}
