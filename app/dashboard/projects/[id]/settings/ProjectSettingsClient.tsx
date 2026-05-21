'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Project {
  id: string; name: string; slug: string
  jiraConfig: string | null; trelloConfig: string | null
  ciConfig: string | null; apiKey: string | null
}

function parseConfig(raw: string | null): Record<string, string> {
  if (!raw) return {}
  try { return JSON.parse(raw) as Record<string, string> } catch { return {} }
}

type Tab = 'task' | 'ci'
type TaskTool = 'jira' | 'trello'

function InputField({ label, value, onChange, placeholder, type = 'text', testid }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder: string; type?: string; testid?: string
}) {
  const [showPw, setShowPw] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      <div className="relative">
        <input
          data-testid={testid}
          type={isPassword && !showPw ? 'password' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full px-3 py-2.5 rounded-lg font-mono text-xs outline-none"
          style={{
            background: 'var(--surface-mid)',
            border: '1px solid var(--border-dim)',
            color: 'var(--text-primary)',
            paddingRight: isPassword ? '36px' : undefined,
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {showPw
                ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
              }
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

function SaveToast({ visible, error }: { visible: boolean; error?: string }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="fixed top-6 right-6 z-50 font-mono text-xs px-4 py-2.5 rounded-xl shadow-lg"
          style={{
            background: error ? 'rgba(255,68,68,0.12)' : 'rgba(0,229,160,0.1)',
            border: `1px solid ${error ? 'rgba(255,68,68,0.3)' : 'rgba(0,229,160,0.3)'}`,
            color: error ? 'var(--accent-red)' : 'var(--accent-green)',
          }}
        >
          {error ? `✗ ${error}` : '✓ Settings saved'}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function ProjectSettingsClient({ project }: { project: Project }) {
  const jira   = parseConfig(project.jiraConfig)
  const trello = parseConfig(project.trelloConfig)
  const ci     = parseConfig(project.ciConfig)

  const [activeTab, setActiveTab] = useState<Tab>(project.ciConfig ? 'ci' : 'task')
  const [revealApiKey, setRevealApiKey] = useState(false)
  const [activeTool, setActiveTool] = useState<TaskTool>(project.trelloConfig ? 'trello' : 'jira')

  // Jira
  const [jiraHost,    setJiraHost]    = useState(jira.host || '')
  const [jiraEmail,   setJiraEmail]   = useState(jira.email || '')
  const [jiraToken,   setJiraToken]   = useState('')
  const [jiraProject, setJiraProject] = useState(jira.projectKey || '')

  // Trello
  const [trelloKey,   setTrelloKey]   = useState(trello.key || '')
  const [trelloToken, setTrelloToken] = useState('')
  const [trelloBoard, setTrelloBoard] = useState(trello.boardId || '')

  // CI
  const [ciProvider,  setCiProvider]  = useState<'github' | 'gitlab'>((ci.provider as 'github' | 'gitlab') || 'github')
  const [ciOwner,     setCiOwner]     = useState(ci.owner || '')
  const [ciRepo,      setCiRepo]      = useState(ci.repo || '')
  const [ciProjectId, setCiProjectId] = useState(ci.projectId || '')
  const [ciHost,      setCiHost]      = useState(ci.host || 'https://gitlab.com')
  const [ciWorkflow,  setCiWorkflow]  = useState(ci.workflow || '')
  const [ciRef,       setCiRef]       = useState(ci.ref || 'main')
  const [ciToken,     setCiToken]     = useState('')

  const [saving,       setSaving]       = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastError,   setToastError]   = useState('')
  const [apiKeyCopied, setApiKeyCopied] = useState(false)
  const [apiKeyValue,  setApiKeyValue]  = useState(project.apiKey)

  function showToast(error?: string) {
    setToastError(error ?? '')
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3000)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

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
    } else if (activeTab === 'ci') {
      const ciPayload = ciProvider === 'github'
        ? { provider: 'github', owner: ciOwner, repo: ciRepo, workflow: ciWorkflow, ref: ciRef, token: ciToken }
        : { provider: 'gitlab', host: ciHost, projectId: ciProjectId, ref: ciRef, token: ciToken }
      body = { ciConfig: JSON.stringify(ciPayload) }
    }

    const res = await fetch(`/api/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (!res.ok) {
      const err = await res.json() as { error?: string }
      showToast(err.error || 'Save failed')
    } else {
      showToast()
    }
  }

  async function handleGenerateApiKey() {
    const res = await fetch(`/api/projects/${project.id}/api-key`, { method: 'POST' })
    const data = await res.json() as { apiKey?: string }
    if (data.apiKey) {
      setApiKeyValue(data.apiKey)
      await navigator.clipboard.writeText(data.apiKey)
      setApiKeyCopied(true)
      setTimeout(() => setApiKeyCopied(false), 3000)
    }
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'task', label: 'Task Management', icon: '◫' },
    { key: 'ci',   label: 'CI / CD',         icon: '⚡' },
  ]

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-1">
        <a href={`/dashboard/${project.slug}`} className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {project.name}
        </a>
        <span style={{ color: 'var(--border-dim)' }}>/</span>
        <span className="font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>Settings</span>
      </div>
      <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--accent-cyan)' }}>
        // SETTINGS
      </div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
        Integration Config
      </h1>

      {/* Underline tab bar */}
      <div className="flex border-b mb-6" style={{ borderColor: 'var(--border-dim)' }}>
        {tabs.map(t => {
          const active = activeTab === t.key
          return (
            <button
              key={t.key}
              type="button"
              data-testid={`settings-tab-${t.key}`}
              onClick={() => setActiveTab(t.key)}
              className="flex items-center gap-2 px-4 py-3 font-mono text-[11px] transition-all duration-150"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                marginBottom: '-1px',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'task' && (
              <motion.form
                key="task"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleSave}
                className="flex flex-col gap-5"
              >
                {/* Tool toggle */}
                <div
                  className="rounded-2xl p-5 flex flex-col gap-5"
                  style={{ background: 'var(--surface-low)', border: '1px solid rgba(96,165,250,0.12)' }}
                >
                  <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--accent-blue)' }}>
                    // Task Management
                  </div>
                  <div className="flex gap-2">
                    {([
                      { key: 'jira' as TaskTool, label: 'Jira', accent: 'var(--accent-blue)', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.35)' },
                      { key: 'trello' as TaskTool, label: 'Trello', accent: 'var(--accent-green)', bg: 'rgba(0,229,160,0.08)', border: 'rgba(0,229,160,0.3)' },
                    ]).map(tool => (
                      <button
                        key={tool.key}
                        type="button"
                        onClick={() => setActiveTool(tool.key)}
                        className="font-mono text-xs px-4 py-1.5 rounded-lg transition-all duration-150"
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

                  {activeTool === 'jira' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Host"        value={jiraHost}    onChange={setJiraHost}    placeholder="https://yourco.atlassian.net" />
                      <InputField label="Email"       value={jiraEmail}   onChange={setJiraEmail}   placeholder="you@company.com" />
                      <InputField label="API Token"   value={jiraToken}   onChange={setJiraToken}   placeholder={jira.token ? '••••••••' : 'ATATT3x...'} type="password" />
                      <InputField label="Project Key" value={jiraProject} onChange={setJiraProject} placeholder="QA" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="API Key"  value={trelloKey}   onChange={setTrelloKey}   placeholder="abc123..." />
                      <InputField label="Token"    value={trelloToken} onChange={setTrelloToken} placeholder={trello.token ? '••••••••' : 'def456...'} type="password" />
                      <div className="col-span-2">
                        <InputField label="Board ID" value={trelloBoard} onChange={setTrelloBoard} placeholder="boardId" />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  data-testid="btn-save-settings-task"
                  type="submit"
                  disabled={saving}
                  className="self-start font-mono text-xs px-6 py-2.5 rounded-lg disabled:opacity-50"
                  style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', color: 'var(--accent-blue)' }}
                >
                  {saving ? '// saving...' : '→ Save Task Config'}
                </button>
              </motion.form>
            )}

            {activeTab === 'ci' && (
              <motion.form
                key="ci"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleSave}
                className="flex flex-col gap-5"
              >
                <div
                  className="rounded-2xl p-5 flex flex-col gap-5"
                  style={{ background: 'var(--surface-low)', border: '1px solid rgba(192,132,252,0.12)' }}
                >
                  <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--accent-purple)' }}>
                    // CI / CD Integration
                  </div>

                  {/* Provider toggle */}
                  <div className="flex gap-2">
                    {(['github', 'gitlab'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCiProvider(p)}
                        className="font-mono text-xs px-4 py-1.5 rounded-lg transition-all duration-150"
                        style={{
                          background: ciProvider === p ? 'rgba(192,132,252,0.1)' : 'transparent',
                          border: `1px solid ${ciProvider === p ? 'rgba(192,132,252,0.35)' : 'var(--border-dim)'}`,
                          color: ciProvider === p ? 'var(--accent-purple)' : 'var(--text-muted)',
                        }}
                      >
                        {p === 'github' ? 'GitHub Actions' : 'GitLab CI'}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {ciProvider === 'github' ? (
                      <>
                        <InputField label="Owner / Org"   value={ciOwner}    onChange={setCiOwner}    placeholder="HuuVQ" />
                        <InputField label="Repository"    value={ciRepo}     onChange={setCiRepo}     placeholder="my-repo" />
                        <InputField label="Workflow file" value={ciWorkflow} onChange={setCiWorkflow} placeholder="playwright.yml" />
                        <InputField label="Branch / Ref"  value={ciRef}      onChange={setCiRef}      placeholder="main" />
                        <div className="col-span-2">
                          <InputField label="Personal Access Token" value={ciToken} onChange={setCiToken}
                            placeholder={ci.token ? '••••••••' : 'ghp_...'} type="password" />
                        </div>
                      </>
                    ) : (
                      <>
                        <InputField label="GitLab Host"  value={ciHost}      onChange={setCiHost}      placeholder="https://gitlab.com" />
                        <InputField label="Project ID"   value={ciProjectId} onChange={setCiProjectId} placeholder="12345678" />
                        <InputField label="Branch / Ref" value={ciRef}       onChange={setCiRef}       placeholder="main" />
                        <div className="col-span-2">
                          <InputField label="Pipeline Trigger Token" value={ciToken} onChange={setCiToken}
                            placeholder={ci.token ? '••••••••' : 'glptt-...'} type="password" />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <button
                  data-testid="btn-save-settings-ci"
                  type="submit"
                  disabled={saving}
                  className="self-start font-mono text-xs px-6 py-2.5 rounded-lg disabled:opacity-50"
                  style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.3)', color: 'var(--accent-purple)' }}
                >
                  {saving ? '// saving...' : '→ Save CI Config'}
                </button>

                {/* CI Push Token card */}
                <div
                  className="rounded-2xl p-5 flex flex-col gap-4"
                  style={{ background: 'var(--surface-low)', border: '1px solid var(--border)' }}
                >
                  <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                    // CI Push Token
                  </div>
                  <p className="font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    Send as{' '}
                    <code style={{ color: 'var(--accent-orange)' }}>X-Api-Key</code>{' '}
                    header to{' '}
                    <code style={{ color: 'var(--accent-cyan)' }}>POST /api/reports/upload</code>
                  </p>

                  {apiKeyValue && (
                    <div
                      data-testid="api-key-display"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                      style={{ background: 'var(--surface-mid)', border: '1px solid var(--border-dim)' }}
                    >
                      <span className="font-mono text-xs flex-1 truncate" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                        {revealApiKey ? apiKeyValue : `${apiKeyValue.slice(0, 8)}••••••••••••••••`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRevealApiKey(v => !v)}
                        className="flex-shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          {revealApiKey
                            ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                            : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                          }
                        </svg>
                      </button>
                    </div>
                  )}

                  <button
                    data-testid="btn-regenerate-key"
                    type="button"
                    onClick={handleGenerateApiKey}
                    className="self-start font-mono text-xs px-5 py-2.5 rounded-lg transition-all duration-150"
                    style={{
                      background: 'rgba(var(--warn-rgb),.1)',
                      border: '1px solid rgba(var(--warn-rgb),.3)',
                      color: 'var(--warn)',
                    }}
                  >
                    {apiKeyCopied ? '✓ Copied to clipboard!' : apiKeyValue ? '↺ Regenerate & Copy' : '+ Generate API Key'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

      <SaveToast visible={toastVisible} error={toastError || undefined} />
    </div>
  )
}
