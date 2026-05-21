'use client'

import { useState } from 'react'
import MTopBar from '@/components/mobile/MTopBar'
import MBottomTabs from '@/components/mobile/MBottomTabs'
import MCard from '@/components/mobile/MCard'
import { M } from '@/components/mobile/tokens'

interface Project {
  id: string; name: string; slug: string
  jiraConfig: string | null; trelloConfig: string | null
  ciConfig: string | null; apiKey: string | null
}

function parse(raw: string | null): Record<string, string> {
  try { return raw ? (JSON.parse(raw) as Record<string, string>) : {} } catch { return {} }
}

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  const [show, setShow] = useState(false)
  const isPass = type === 'password'
  return (
    <div>
      <label style={{ fontFamily: M.mono, fontSize: 9.5, color: M.textDim, textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 5 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={isPass && !show ? 'password' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          style={{
            width: '100%', background: M.surf3, border: `1px solid ${M.borderStrong}`,
            borderRadius: 7, padding: '11px 12px', fontFamily: M.mono, fontSize: 12,
            color: M.text, outline: 'none', boxSizing: 'border-box',
            paddingRight: isPass ? 40 : 12,
          }}
          onFocus={e => { e.currentTarget.style.borderColor = `rgba(${M.accentRgb},.5)` }}
          onBlur={e => { e.currentTarget.style.borderColor = M.borderStrong }}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: M.textDim, fontSize: 14 }}
          >{show ? '🙈' : '👁'}</button>
        )}
      </div>
    </div>
  )
}

export default function MobileSettingsClient({ project }: { project: Project }) {
  const ci     = parse(project.ciConfig)
  const jira   = parse(project.jiraConfig)
  const trello = parse(project.trelloConfig)

  const [tab, setTab]               = useState<'task' | 'ci'>('ci')
  const [ciProvider, setCiProvider] = useState<'github' | 'gitlab'>((ci.provider as 'github' | 'gitlab') || 'github')
  const [ciOwner,    setCiOwner]    = useState(ci.owner || '')
  const [ciRepo,     setCiRepo]     = useState(ci.repo || '')
  const [ciProjectId,setCiProjectId]= useState(ci.projectId || '')
  const [ciHost,     setCiHost]     = useState(ci.host || 'https://gitlab.com')
  const [ciWorkflow, setCiWorkflow] = useState(ci.workflow || '')
  const [ciRef,      setCiRef]      = useState(ci.ref || 'main')
  const [ciToken,    setCiToken]    = useState('')

  const [jiraHost,    setJiraHost]    = useState(jira.host || '')
  const [jiraEmail,   setJiraEmail]   = useState(jira.email || '')
  const [jiraToken,   setJiraToken]   = useState('')
  const [jiraProject, setJiraProject] = useState(jira.projectKey || '')
  const [trelloKey,   setTrelloKey]   = useState(trello.key || '')
  const [trelloToken, setTrelloToken] = useState('')
  const [trelloBoard, setTrelloBoard] = useState(trello.boardId || '')
  const [activeTool,  setActiveTool]  = useState<'jira' | 'trello'>(project.trelloConfig ? 'trello' : 'jira')

  const [apiKeyValue, setApiKeyValue]   = useState(project.apiKey)
  const [revealKey,   setRevealKey]     = useState(false)
  const [keyCopied,   setKeyCopied]     = useState(false)
  const [saving,      setSaving]        = useState(false)
  const [toast,       setToast]         = useState('')
  const [toastOk,     setToastOk]       = useState(true)

  function showToast(msg: string, ok = true) {
    setToast(msg); setToastOk(ok)
    setTimeout(() => setToast(''), 3000)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    let body: Record<string, unknown> = {}
    if (tab === 'task') {
      body = activeTool === 'jira'
        ? { jiraConfig: JSON.stringify({ host: jiraHost, email: jiraEmail, token: jiraToken, projectKey: jiraProject }), trelloConfig: null }
        : { trelloConfig: JSON.stringify({ key: trelloKey, token: trelloToken, boardId: trelloBoard }), jiraConfig: null }
    } else {
      const ciPayload = ciProvider === 'github'
        ? { provider: 'github', owner: ciOwner, repo: ciRepo, workflow: ciWorkflow, ref: ciRef, token: ciToken }
        : { provider: 'gitlab', host: ciHost, projectId: ciProjectId, ref: ciRef, token: ciToken }
      body = { ciConfig: JSON.stringify(ciPayload) }
    }
    const res = await fetch(`/api/projects/${project.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    setSaving(false)
    res.ok ? showToast('✓ Settings saved') : showToast('✗ Save failed', false)
  }

  async function handleGenerateKey() {
    const res = await fetch(`/api/projects/${project.id}/api-key`, { method: 'POST' })
    const data = await res.json() as { apiKey?: string }
    if (data.apiKey) {
      setApiKeyValue(data.apiKey)
      await navigator.clipboard.writeText(data.apiKey).catch(() => null)
      setKeyCopied(true)
      setTimeout(() => setKeyCopied(false), 3000)
    }
  }

  return (
    <>
      <MTopBar />
      <div style={{ paddingTop: 52, paddingBottom: 104, paddingLeft: 16, paddingRight: 16, fontFamily: M.sans }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 16, marginBottom: 10, fontFamily: M.mono, fontSize: 11 }}>
          <a href={`/m/dashboard/${project.slug}`} style={{ color: M.textDim, textDecoration: 'none' }}>← {project.name}</a>
          <span style={{ color: M.textDim }}>/</span>
          <span style={{ color: M.textSec }}>Settings</span>
        </div>

        <div style={{ fontFamily: M.mono, fontSize: 10, color: M.accent, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>// Settings</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: M.text, marginBottom: 18 }}>Integration Config</h1>

        {/* Segmented tabs */}
        <div style={{ display: 'flex', background: M.surf2, borderRadius: 8, padding: 3, marginBottom: 18, border: `1px solid ${M.border}` }}>
          {(['task', 'ci'] as const).map(t => {
            const a = tab === t
            const label = t === 'task' ? '◫ Task' : '⚡ CI / CD'
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  flex: 1, fontFamily: M.mono, fontSize: 11, fontWeight: 600, padding: '9px 0',
                  borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  border: a ? `1px solid rgba(${M.accentRgb},.4)` : 'none',
                  background: a ? `rgba(${M.accentRgb},.1)` : 'transparent',
                  color: a ? M.accent : M.textDim,
                }}
              >{label}</button>
            )
          })}
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tab === 'task' && (
            <MCard style={{ padding: 16 }}>
              <div style={{ fontFamily: M.mono, fontSize: 9.5, color: M.textSec, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>// Task Management</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {(['jira', 'trello'] as const).map(tool => (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => setActiveTool(tool)}
                    style={{
                      flex: 1, fontFamily: M.mono, fontSize: 11, padding: '9px 0', borderRadius: 7, cursor: 'pointer',
                      border: activeTool === tool ? `1px solid rgba(${M.infoRgb},.4)` : `1px solid ${M.borderStrong}`,
                      background: activeTool === tool ? `rgba(${M.infoRgb},.1)` : M.surf3,
                      color: activeTool === tool ? M.info : M.textDim,
                    }}
                  >{tool === 'jira' ? 'Jira' : 'Trello'}</button>
                ))}
              </div>
              {activeTool === 'jira' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Field label="Host" value={jiraHost} onChange={setJiraHost} placeholder="https://yourco.atlassian.net" />
                  <Field label="Email" value={jiraEmail} onChange={setJiraEmail} placeholder="you@company.com" />
                  <Field label="API Token" value={jiraToken} onChange={setJiraToken} type="password" placeholder={jira.token ? '••••••••' : 'ATATT3x...'} />
                  <Field label="Project Key" value={jiraProject} onChange={setJiraProject} placeholder="QA" />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Field label="API Key" value={trelloKey} onChange={setTrelloKey} placeholder="abc123..." />
                  <Field label="Token" value={trelloToken} onChange={setTrelloToken} type="password" placeholder={trello.token ? '••••••••' : 'def456...'} />
                  <Field label="Board ID" value={trelloBoard} onChange={setTrelloBoard} placeholder="boardId" />
                </div>
              )}
            </MCard>
          )}

          {tab === 'ci' && (
            <MCard style={{ padding: 16 }}>
              <div style={{ fontFamily: M.mono, fontSize: 9.5, color: M.textSec, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>// Provider</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
                {(['github', 'gitlab'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCiProvider(p)}
                    style={{
                      flex: 1, fontFamily: M.mono, fontSize: 11, padding: '9px 0', borderRadius: 7, cursor: 'pointer',
                      border: ciProvider === p ? `1px solid rgba(${M.accent2Rgb},.5)` : `1px solid ${M.borderStrong}`,
                      background: ciProvider === p ? `rgba(${M.accent2Rgb},.1)` : M.surf3,
                      color: ciProvider === p ? M.accent2 : M.textDim,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <span style={{ width: 12, height: 12, borderRadius: '50%', border: ciProvider === p ? `4px solid ${M.accent2}` : `1px solid ${M.textDim}`, display: 'inline-block' }} />
                    {p === 'github' ? 'GitHub' : 'GitLab'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {ciProvider === 'github' ? (
                  <>
                    <Field label="Owner / Org" value={ciOwner} onChange={setCiOwner} placeholder="HuuVQ" />
                    <Field label="Repository" value={ciRepo} onChange={setCiRepo} placeholder="my-repo" />
                    <Field label="Workflow file" value={ciWorkflow} onChange={setCiWorkflow} placeholder="playwright.yml" />
                    <Field label="Branch / Ref" value={ciRef} onChange={setCiRef} placeholder="main" />
                    <Field label="Personal Access Token" value={ciToken} onChange={setCiToken} type="password" placeholder={ci.token ? '••••••••' : 'ghp_...'} />
                  </>
                ) : (
                  <>
                    <Field label="GitLab Host" value={ciHost} onChange={setCiHost} placeholder="https://gitlab.com" />
                    <Field label="Project ID" value={ciProjectId} onChange={setCiProjectId} placeholder="12345678" />
                    <Field label="Branch / Ref" value={ciRef} onChange={setCiRef} placeholder="main" />
                    <Field label="Pipeline Trigger Token" value={ciToken} onChange={setCiToken} type="password" placeholder={ci.token ? '••••••••' : 'glptt-...'} />
                  </>
                )}
              </div>
            </MCard>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%', padding: '12px', borderRadius: 8, cursor: 'pointer',
              border: `1px solid rgba(${M.accent2Rgb},.5)`, background: `rgba(${M.accent2Rgb},.1)`, color: M.accent2,
              fontFamily: M.mono, fontSize: 12, fontWeight: 600, opacity: saving ? 0.6 : 1,
            }}
          >{saving ? '// saving...' : `→ Save ${tab === 'ci' ? 'CI Config' : 'Task Config'}`}</button>
        </form>

        {/* CI Push Token card */}
        <MCard style={{ padding: 16, marginTop: 12 }}>
          <div style={{ fontFamily: M.mono, fontSize: 9.5, color: M.textSec, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>// CI Push Token</div>
          <p style={{ fontFamily: M.mono, fontSize: 11, color: M.textDim, marginBottom: 12, lineHeight: 1.5 }}>
            Send as <span style={{ color: M.accent }}>X-Api-Key</span> header to <span style={{ color: M.accent }}>POST /api/reports/upload</span>
          </p>
          {apiKeyValue && (
            <div style={{ background: M.surf3, border: `1px solid ${M.borderStrong}`, borderRadius: 7, padding: '11px 12px', fontFamily: M.mono, fontSize: 11, color: M.text, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>
                {revealKey ? apiKeyValue : `${apiKeyValue.slice(0, 8)}••••••••••••••••`}
              </span>
              <button type="button" onClick={() => setRevealKey(v => !v)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: M.textDim, fontSize: 14 }}>
                {revealKey ? '🙈' : '👁'}
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleGenerateKey}
            style={{
              width: '100%', padding: '10px', borderRadius: 7, cursor: 'pointer',
              border: `1px solid rgba(${M.warnRgb},.4)`, background: `rgba(${M.warnRgb},.08)`, color: M.warn,
              fontFamily: M.mono, fontSize: 11, fontWeight: 600,
            }}
          >{keyCopied ? '✓ Copied!' : apiKeyValue ? '↺ Regenerate & Copy' : '+ Generate API Key'}</button>
        </MCard>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 62, right: 14, zIndex: 300,
          padding: '10px 16px', borderRadius: 8,
          background: M.surf2,
          border: `1px solid ${toastOk ? `rgba(${M.accent3Rgb},.3)` : `rgba(${M.dangerRgb},.3)`}`,
          fontFamily: M.mono, fontSize: 11,
          color: toastOk ? M.accent3 : M.danger,
        }}>{toast}</div>
      )}

      <MBottomTabs />
    </>
  )
}
