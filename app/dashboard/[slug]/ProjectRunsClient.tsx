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

export default function ProjectRunsClient({ project, initialRuns }: { project: Project; initialRuns: Run[] }) {
  const [runs] = useState(initialRuns)
  const [selectedRun, setSelectedRun] = useState<Run | null>(null)
  const [results, setResults] = useState<TestResult[]>([])
  const [loadingResults, setLoadingResults] = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function handleTrigger() {
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
    setTimeout(() => setTriggerMsg(null), 5000)
  }

  async function openRun(run: Run) {
    setSelectedRun(run)
    setLoadingResults(true)
    const res = await fetch(`/api/reports/${project.slug}/${run.id}`)
    const data = await res.json()
    setResults(data.results || [])
    setLoadingResults(false)
  }

  const statusColor = (s: string) =>
    s === 'passed' ? 'var(--accent-green)' : s === 'failed' ? 'var(--accent-red)' : 'var(--accent-yellow)'
  const statusBg = (s: string) =>
    s === 'passed' ? 'rgba(0,229,160,0.08)' : s === 'failed' ? 'rgba(255,68,68,0.08)' : 'rgba(245,197,24,0.08)'
  const statusBorder = (s: string) =>
    s === 'passed' ? 'rgba(0,229,160,0.2)' : s === 'failed' ? 'rgba(255,68,68,0.2)' : 'rgba(245,197,24,0.2)'

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <a href="/dashboard/projects" className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
            ← Projects
          </a>
          <span style={{ color: 'var(--border-dim)' }}>/</span>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--accent-cyan)' }}>
              // PROJECT
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {project.name}
            </h1>
          </div>
        </div>

        {/* Trigger CI button — chỉ hiện khi đã config CI */}
        {project.ciConfig && (
          <div className="flex items-center gap-3">
            {triggerMsg && (
              <span data-testid="trigger-msg" className="font-mono text-[11px]" style={{ color: triggerMsg.ok ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {triggerMsg.text}
              </span>
            )}
            <button
              data-testid="btn-trigger-ci"
              onClick={handleTrigger}
              disabled={triggering}
              className="font-mono text-xs px-5 py-2 rounded transition-all duration-200 disabled:opacity-50"
              style={{
                background: triggering ? 'rgba(192,132,252,0.05)' : 'rgba(192,132,252,0.1)',
                border: '1px solid rgba(192,132,252,0.35)',
                color: 'var(--accent-purple)',
              }}
            >
              {triggering ? '// triggering...' : '▶ Trigger CI'}
            </button>
          </div>
        )}
      </div>

      {runs.length === 0 ? (
        <div data-testid="runs-empty" className="text-center py-16">
          <div className="font-mono text-sm mb-2" style={{ color: 'var(--text-muted)' }}>No runs yet</div>
          <div className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Upload a report via <code style={{ color: 'var(--accent-cyan)' }}>POST /api/reports/upload</code>
          </div>
        </div>
      ) : (
        <div data-testid="runs-table" className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-low)', border: '1px solid var(--border-subtle)' }}>
          <div className="grid grid-cols-12 text-[10px] font-mono uppercase tracking-widest px-5 py-3 border-b"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-lowest)' }}>
            <span className="col-span-2" style={{ color: 'var(--text-muted)' }}>Status</span>
            <span className="col-span-2" style={{ color: 'var(--text-muted)' }}>Env</span>
            <span className="col-span-4" style={{ color: 'var(--text-muted)' }}>Timestamp</span>
            <span className="col-span-3" style={{ color: 'var(--text-muted)' }}>Results</span>
            <span className="col-span-1 text-right" style={{ color: 'var(--text-muted)' }}>Action</span>
          </div>
          {runs.map(run => (
            <div key={run.id} data-testid={`run-row-${run.id}`} className="grid grid-cols-12 px-5 py-4 items-center border-b last:border-0"
              style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="col-span-2">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded"
                  style={{ background: statusBg(run.status), border: `1px solid ${statusBorder(run.status)}`, color: statusColor(run.status) }}>
                  {run.status.toUpperCase()}
                </span>
              </div>
              <div className="col-span-2">
                <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{run.env}</span>
              </div>
              <div className="col-span-4">
                <span className="font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(run.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="col-span-3 font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--accent-green)' }}>✓{run.passed || 0}</span>
                {' '}<span style={{ color: 'var(--accent-red)' }}>✗{run.failed || 0}</span>
                {' '}<span style={{ color: 'var(--accent-yellow)' }}>⊘{run.skipped || 0}</span>
              </div>
              <div className="col-span-1 text-right">
                <button data-testid={`btn-detail-${run.id}`} onClick={() => openRun(run)}
                  className="font-mono text-[10px] hover:underline" style={{ color: 'var(--accent-blue)' }}>
                  Detail ↗
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Run detail modal */}
      <AnimatePresence>
        {selectedRun && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedRun(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              data-testid="run-detail-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl h-[80vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
              style={{ background: 'var(--surface-lowest)', border: '1px solid var(--border-active)' }}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b"
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-low)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: statusColor(selectedRun.status) }} />
                  <div>
                    <span className="font-mono text-sm font-bold block" style={{ color: 'var(--text-primary)' }}>
                      {new Date(selectedRun.createdAt).toLocaleString()}
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {selectedRun.env} · {selectedRun.durationMs}ms
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {selectedRun.blobUrl && (
                    <a href={selectedRun.blobUrl} target="_blank" rel="noopener noreferrer"
                      className="font-mono text-[10px] hover:underline" style={{ color: 'var(--accent-green)' }}>
                      Open HTML Report ↗
                    </a>
                  )}
                  <button data-testid="btn-close-modal" onClick={() => setSelectedRun(null)}
                    className="p-2 rounded-full transition-colors"
                    style={{ color: 'var(--text-muted)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-auto p-6">
                {loadingResults ? (
                  <div className="flex items-center justify-center h-full">
                    <span className="font-mono text-sm animate-pulse" style={{ color: 'var(--accent-cyan)' }}>
                      Loading results...
                    </span>
                  </div>
                ) : results.length === 0 ? (
                  <div className="flex items-center justify-center h-full font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
                    No test results stored for this run
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 text-[10px] font-mono uppercase tracking-widest px-3 mb-3"
                      style={{ color: 'var(--text-muted)' }}>
                      <span className="col-span-5">Test Case</span>
                      <span className="col-span-3">File</span>
                      <span className="col-span-2">Status</span>
                      <span className="col-span-1">Time</span>
                      <span className="col-span-1 text-right">Retry</span>
                    </div>
                    {results.map(r => (
                      <div key={r.id} className="grid grid-cols-12 px-3 py-3 rounded-lg items-center"
                        style={{ background: 'var(--surface-low)', border: '1px solid var(--border-subtle)' }}>
                        <div className="col-span-5">
                          <span className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{r.title}</span>
                          {r.errorMessage && (
                            <div className="font-mono text-[9px] mt-1 truncate" style={{ color: 'var(--accent-red)' }}>
                              {r.errorMessage}
                            </div>
                          )}
                        </div>
                        <div className="col-span-3">
                          <span className="font-mono text-[10px] truncate block" style={{ color: 'var(--text-muted)' }}>{r.file}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                            style={{ background: statusBg(r.status), border: `1px solid ${statusBorder(r.status)}`, color: statusColor(r.status) }}>
                            {r.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="col-span-1">
                          <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.durationMs}ms</span>
                        </div>
                        <div className="col-span-1 text-right">
                          <span className="font-mono text-[10px]" style={{ color: r.retryCount && parseInt(r.retryCount) > 0 ? 'var(--accent-yellow)' : 'var(--text-muted)' }}>
                            {r.retryCount || 0}x
                          </span>
                        </div>
                      </div>
                    ))}
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
