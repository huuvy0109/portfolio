'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Project { id: string; name: string; slug: string; ciConfig: string | null }
interface Run {
  id: string; status: string; env: string
  totalTests: string | null; passed: string | null; failed: string | null; skipped: string | null
  durationMs: string | null; blobUrl: string | null; jsonBlobUrl: string | null; createdAt: Date
}
interface TestResult {
  id: string; title: string; file: string | null; status: string
  durationMs: string | null; errorMessage: string | null; retryCount: string | null
}

type ResultFilter = 'all' | 'failed' | 'flaky'

function statusColor(s: string) {
  if (s === 'passed') return 'var(--accent-green)'
  if (s === 'failed') return 'var(--accent-red)'
  if (s === 'flaky') return 'var(--accent-yellow)'
  return 'var(--accent-yellow)'
}
function statusBg(s: string) {
  if (s === 'passed') return 'rgba(0,229,160,0.08)'
  if (s === 'failed') return 'rgba(255,68,68,0.08)'
  if (s === 'flaky') return 'rgba(245,197,24,0.08)'
  return 'rgba(245,197,24,0.08)'
}
function statusBorder(s: string) {
  if (s === 'passed') return 'rgba(0,229,160,0.2)'
  if (s === 'failed') return 'rgba(255,68,68,0.2)'
  if (s === 'flaky') return 'rgba(245,197,24,0.2)'
  return 'rgba(245,197,24,0.2)'
}

export default function ProjectRunsClient({ project, initialRuns }: { project: Project; initialRuns: Run[] }) {
  const [runs] = useState(initialRuns)
  const [selectedRun, setSelectedRun] = useState<Run | null>(null)
  const [results, setResults] = useState<TestResult[]>([])
  const [loadingResults, setLoadingResults] = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [showTriggerConfirm, setShowTriggerConfirm] = useState(false)
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all')
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set())

  async function handleTrigger() {
    setShowTriggerConfirm(false)
    setTriggering(true)
    setTriggerMsg(null)
    try {
      const res = await fetch(`/api/projects/${project.id}/trigger`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json() as { provider?: string; pipelineId?: number; url?: string }
        const label = data.url ? `Pipeline #${data.pipelineId ?? ''}` : 'Triggered'
        setTriggerMsg({ ok: true, text: `✓ ${label} — ${data.provider ?? 'CI'} dispatched` })
      } else {
        const err = await res.json() as { error?: string }
        setTriggerMsg({ ok: false, text: `✗ ${err.error || 'Trigger failed'}` })
      }
    } catch {
      setTriggerMsg({ ok: false, text: '✗ Network error' })
    }
    setTriggering(false)
    setTimeout(() => setTriggerMsg(null), 6000)
  }

  async function openRun(run: Run) {
    setSelectedRun(run)
    setResultFilter('all')
    setExpandedErrors(new Set())
    setLoadingResults(true)
    const res = await fetch(`/api/reports/${project.slug}/${run.id}`)
    const data = await res.json()
    setResults(data.results || [])
    setLoadingResults(false)
  }

  function toggleError(id: string) {
    setExpandedErrors(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filteredResults = results.filter(r => {
    if (resultFilter === 'all') return true
    if (resultFilter === 'failed') return r.status === 'failed'
    if (resultFilter === 'flaky') return r.status === 'flaky' || (parseInt(r.retryCount ?? '0') > 0)
    return true
  })

  const failedCount = results.filter(r => r.status === 'failed').length
  const flakyCount = results.filter(r => r.status === 'flaky' || parseInt(r.retryCount ?? '0') > 0).length

  function fmtDuration(ms: string | null) {
    if (!ms) return '—'
    const n = parseInt(ms)
    if (n < 1000) return `${n}ms`
    return `${(n / 1000).toFixed(1)}s`
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <a href="/dashboard/projects" className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Projects
            </a>
            <span style={{ color: 'var(--border-dim)' }}>/</span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>{project.name}</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--accent-orange)' }}>
            // PROJECT RUNS
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {project.name}
          </h1>
          <span
            className="font-mono text-[10px] px-2 py-0.5 rounded mt-1 inline-block"
            style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', color: 'var(--accent-orange)' }}
          >
            /{project.slug}
          </span>
        </div>

        {project.ciConfig && (
          <div className="flex items-center gap-3">
            {triggerMsg && (
              <span
                data-testid="trigger-msg"
                className="font-mono text-[11px]"
                style={{ color: triggerMsg.ok ? 'var(--accent-green)' : 'var(--accent-red)' }}
              >
                {triggerMsg.text}
              </span>
            )}
            <button
              data-testid="btn-trigger-ci"
              onClick={() => setShowTriggerConfirm(true)}
              disabled={triggering}
              className="flex items-center gap-2 font-mono text-xs px-5 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50"
              style={{
                background: triggering ? 'rgba(192,132,252,0.04)' : 'rgba(192,132,252,0.08)',
                border: '1px solid rgba(192,132,252,0.3)',
                color: 'var(--accent-purple)',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              {triggering ? 'Triggering...' : 'Trigger CI'}
            </button>
          </div>
        )}
      </div>

      {/* Runs */}
      {runs.length === 0 ? (
        <div
          data-testid="runs-empty"
          className="flex flex-col items-center justify-center py-24 rounded-2xl"
          style={{ border: '1px dashed var(--border-subtle)' }}
        >
          <p className="font-mono text-sm mb-2" style={{ color: 'var(--text-muted)' }}>No runs yet</p>
          <p className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Upload a report via{' '}
            <code style={{ color: 'var(--accent-cyan)' }}>POST /api/reports/upload</code>
          </p>
        </div>
      ) : (
        <div data-testid="runs-table">
          {/* ── MOBILE: card list ── */}
          <div className="flex flex-col gap-3 lg:hidden">
            {runs.map(run => (
              <div
                key={run.id}
                data-testid={`run-row-${run.id}`}
                className="rounded-2xl p-4"
                style={{ background: 'var(--surface-low)', border: `1px solid ${statusBorder(run.status)}` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    data-testid={`badge-status-${run.id}`}
                    className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: statusBg(run.status), border: `1px solid ${statusBorder(run.status)}`, color: statusColor(run.status) }}
                  >
                    {run.status.toUpperCase()}
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
                    {run.env}
                  </span>
                </div>
                <div className="font-mono text-[11px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(run.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[11px] flex gap-3">
                    <span style={{ color: 'var(--accent-green)' }}>✓ {run.passed ?? 0}</span>
                    <span style={{ color: 'var(--accent-red)' }}>✗ {run.failed ?? 0}</span>
                    <span style={{ color: 'var(--accent-yellow)' }}>⊘ {run.skipped ?? 0}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{fmtDuration(run.durationMs)}</span>
                  </div>
                  <button
                    data-testid={`btn-detail-${run.id}`}
                    onClick={() => openRun(run)}
                    className="font-mono text-[11px] px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)', color: 'var(--accent-orange)' }}
                  >
                    Detail ↗
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── DESKTOP: table ── */}
          <div
            className="hidden lg:block rounded-2xl overflow-hidden"
            style={{ background: 'var(--surface-low)', border: '1px solid var(--border-subtle)' }}
          >
            <div
              className="grid px-5 py-3 border-b font-mono text-[10px] uppercase tracking-widest"
              style={{
                gridTemplateColumns: '110px 70px 1fr 130px 80px 70px',
                borderColor: 'var(--border-subtle)',
                background: 'var(--surface-lowest)',
                color: 'var(--text-muted)',
              }}
            >
              <span>Status</span>
              <span>Env</span>
              <span>Timestamp</span>
              <span>Tests (P / F / S)</span>
              <span>Duration</span>
              <span className="text-right">Action</span>
            </div>

            {runs.map(run => (
              <div
                key={run.id}
                data-testid={`run-row-${run.id}`}
                className="grid px-5 py-4 items-center border-b last:border-0"
                style={{ gridTemplateColumns: '110px 70px 1fr 130px 80px 70px', borderColor: 'var(--border-subtle)' }}
              >
                <div>
                  <span
                    data-testid={`badge-status-${run.id}`}
                    className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: statusBg(run.status), border: `1px solid ${statusBorder(run.status)}`, color: statusColor(run.status) }}
                  >
                    {run.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{run.env}</span>
                </div>
                <div>
                  <span className="font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(run.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="font-mono text-[10px] flex gap-2">
                  <span style={{ color: 'var(--accent-green)' }}>✓{run.passed ?? 0}</span>
                  <span style={{ color: 'var(--accent-red)' }}>✗{run.failed ?? 0}</span>
                  <span style={{ color: 'var(--accent-yellow)' }}>⊘{run.skipped ?? 0}</span>
                </div>
                <div>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{fmtDuration(run.durationMs)}</span>
                </div>
                <div className="text-right">
                  <button
                    data-testid={`btn-detail-${run.id}`}
                    onClick={() => openRun(run)}
                    className="font-mono text-[10px] px-2.5 py-1 rounded transition-all duration-150"
                    style={{ border: '1px solid rgba(249,115,22,0.2)', color: 'var(--accent-orange)', background: 'rgba(249,115,22,0.05)' }}
                  >
                    Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trigger CI confirm modal */}
      <AnimatePresence>
        {showTriggerConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setShowTriggerConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="relative rounded-2xl p-6 w-full max-w-sm"
              style={{ background: 'var(--surface-lowest)', border: '1px solid rgba(192,132,252,0.2)' }}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--accent-purple)' }}>
                // TRIGGER CI
              </div>
              <p className="text-sm mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                Dispatch CI pipeline?
              </p>
              <p className="font-mono text-[11px] mb-5" style={{ color: 'var(--text-muted)' }}>
                Sẽ trigger workflow cho project <strong>{project.name}</strong>.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTriggerConfirm(false)}
                  className="flex-1 font-mono text-xs py-2 rounded-lg"
                  style={{ border: '1px solid var(--border-dim)', color: 'var(--text-muted)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleTrigger}
                  className="flex-1 font-mono text-xs py-2 rounded-lg"
                  style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.3)', color: 'var(--accent-purple)' }}
                >
                  ▶ Trigger
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Run Detail Modal */}
      <AnimatePresence>
        {selectedRun && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRun(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              data-testid="modal-run-detail"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative w-full max-w-5xl flex flex-col rounded-2xl overflow-hidden shadow-2xl"
              style={{
                maxHeight: '88vh',
                background: 'var(--surface-lowest)',
                border: '1px solid var(--border-active)',
              }}
            >
              {/* Modal header */}
              <div
                className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-low)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: statusColor(selectedRun.status) }}
                  />
                  <div>
                    <span className="font-mono text-sm font-bold block" style={{ color: 'var(--text-primary)' }}>
                      Run — {new Date(selectedRun.createdAt).toLocaleString('vi-VN')}
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {selectedRun.env.toUpperCase()} · {fmtDuration(selectedRun.durationMs)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {selectedRun.blobUrl && (
                    <a
                      href={selectedRun.blobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] px-3 py-1.5 rounded-lg transition-all duration-150"
                      style={{ border: '1px solid rgba(0,229,160,0.2)', color: 'var(--accent-green)', background: 'rgba(0,229,160,0.05)' }}
                    >
                      Open HTML Report ↗
                    </a>
                  )}
                  <button
                    data-testid="btn-close-modal"
                    onClick={() => setSelectedRun(null)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Summary stats */}
              <div
                className="grid grid-cols-5 px-6 py-3 border-b flex-shrink-0"
                style={{ borderColor: 'var(--border-subtle)', background: 'rgba(255,255,255,0.015)' }}
              >
                {[
                  { label: 'Total', value: selectedRun.totalTests ?? '—', color: 'var(--text-secondary)' },
                  { label: 'Passed', value: selectedRun.passed ?? '—', color: 'var(--accent-green)' },
                  { label: 'Failed', value: selectedRun.failed ?? '—', color: 'var(--accent-red)' },
                  { label: 'Skipped', value: selectedRun.skipped ?? '—', color: 'var(--accent-yellow)' },
                  { label: 'Duration', value: fmtDuration(selectedRun.durationMs), color: 'var(--text-secondary)' },
                ].map(stat => (
                  <div key={stat.label} className="flex flex-col items-center gap-0.5">
                    <span className="font-mono text-lg font-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Filter tabs */}
              <div
                className="flex items-center gap-1 px-6 py-2.5 border-b flex-shrink-0"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                {([
                  { key: 'all' as ResultFilter, label: `All (${results.length})` },
                  { key: 'failed' as ResultFilter, label: `Failed (${failedCount})`, accent: 'var(--accent-red)', activeBg: 'rgba(255,68,68,0.08)', activeBorder: 'rgba(255,68,68,0.25)' },
                  { key: 'flaky' as ResultFilter, label: `Flaky (${flakyCount})`, accent: 'var(--accent-yellow)', activeBg: 'rgba(245,197,24,0.08)', activeBorder: 'rgba(245,197,24,0.25)' },
                ]).map(tab => {
                  const active = resultFilter === tab.key
                  const accent = tab.accent ?? 'var(--accent-cyan)'
                  const activeBg = tab.activeBg ?? 'rgba(0,229,255,0.08)'
                  const activeBorder = tab.activeBorder ?? 'rgba(0,229,255,0.25)'
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setResultFilter(tab.key)}
                      className="font-mono text-[10px] px-3 py-1.5 rounded-lg transition-all duration-150"
                      style={{
                        background: active ? activeBg : 'transparent',
                        border: `1px solid ${active ? activeBorder : 'var(--border-dim)'}`,
                        color: active ? accent : 'var(--text-muted)',
                      }}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Results list */}
              <div className="flex-1 overflow-auto p-5">
                {loadingResults ? (
                  <div className="flex items-center justify-center h-32">
                    <span className="font-mono text-sm animate-pulse" style={{ color: 'var(--accent-cyan)' }}>
                      Loading results...
                    </span>
                  </div>
                ) : filteredResults.length === 0 ? (
                  <div className="flex items-center justify-center h-32 font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
                    {results.length === 0 ? 'No test results stored for this run' : 'No results match this filter'}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {/* Column header */}
                    <div
                      className="grid px-3 mb-2 font-mono text-[9px] uppercase tracking-widest"
                      style={{
                        gridTemplateColumns: '1fr 180px 90px 55px 50px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <span>Test Case</span>
                      <span>File</span>
                      <span>Status</span>
                      <span>Time</span>
                      <span className="text-right">Retry</span>
                    </div>

                    {filteredResults.map(r => {
                      const retry = parseInt(r.retryCount ?? '0')
                      const isFlaky = r.status === 'flaky' || retry > 0
                      const expanded = expandedErrors.has(r.id)

                      return (
                        <div
                          key={r.id}
                          className="rounded-xl overflow-hidden"
                          style={{ border: `1px solid ${statusBorder(r.status)}` }}
                        >
                          <div
                            className="grid px-3 py-2.5 items-center"
                            style={{
                              gridTemplateColumns: '1fr 180px 90px 55px 50px',
                              background: statusBg(r.status),
                            }}
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-mono text-[11px] block truncate" style={{ color: 'var(--text-primary)' }}>
                                {r.title}
                              </span>
                              {isFlaky && (
                                <span
                                  className="font-mono text-[9px] px-1.5 py-0.5 rounded mt-0.5 inline-block"
                                  style={{ background: 'rgba(245,197,24,0.12)', border: '1px solid rgba(245,197,24,0.25)', color: 'var(--accent-yellow)' }}
                                >
                                  ⚠ FLAKY
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-mono text-[10px] truncate block" style={{ color: 'var(--text-muted)' }}>
                                {r.file ?? '—'}
                              </span>
                            </div>
                            <div>
                              <span
                                className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                                style={{ background: statusBg(r.status), border: `1px solid ${statusBorder(r.status)}`, color: statusColor(r.status) }}
                              >
                                {r.status.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                {fmtDuration(r.durationMs)}
                              </span>
                            </div>
                            <div className="text-right">
                              {r.errorMessage ? (
                                <button
                                  onClick={() => toggleError(r.id)}
                                  className="font-mono text-[10px]"
                                  style={{ color: retry > 0 ? 'var(--accent-yellow)' : 'var(--text-muted)' }}
                                >
                                  {retry}x {expanded ? '▲' : '▼'}
                                </button>
                              ) : (
                                <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                  {retry}x
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Error message expanded */}
                          <AnimatePresence>
                            {r.errorMessage && expanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <pre
                                  className="font-mono text-[10px] px-4 py-3 overflow-x-auto"
                                  style={{
                                    color: 'var(--accent-red)',
                                    background: 'rgba(255,68,68,0.04)',
                                    borderTop: '1px solid rgba(255,68,68,0.15)',
                                  }}
                                >
                                  {r.errorMessage}
                                </pre>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
