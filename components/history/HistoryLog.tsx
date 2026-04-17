'use client'

import { motion } from 'framer-motion'
import { usePipelineStore, type RunSnapshot } from '@/lib/store/pipelineStore'

const TESTS = [
  { id: 'hero.spec.ts',    label: 'Hero Section renders correctly' },
  { id: 'pipeline.spec.ts', label: 'Pipeline Board state transitions' },
]

function runResult(snap: RunSnapshot, testId: string) {
  if (testId === 'hero.spec.ts') {
    return { passed: true, retries: 0, locator: null }
  }
  if (snap.runMode === 'v1-broken') {
    return { passed: false, retries: snap.retryCount, locator: '[data-testid="card-ba-analyzing"]' }
  }
  return { passed: true, retries: 0, locator: '[data-testid="card-US-002"]' }
}

function ResultBadge({ passed, retries }: { passed: boolean; retries: number }) {
  if (!passed) return (
    <span className="font-mono text-[10px] px-2 py-0.5 rounded"
      style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: 'var(--accent-red)' }}>
      ✗ FAIL {retries > 0 ? `(retry ×${retries})` : ''}
    </span>
  )
  return (
    <span className="font-mono text-[10px] px-2 py-0.5 rounded"
      style={{ background: 'rgba(0,255,157,0.08)', border: '1px solid rgba(0,255,157,0.25)', color: 'var(--accent-green)' }}>
      ✓ PASS
    </span>
  )
}

export default function HistoryLog() {
  const { runHistory, runMode } = usePipelineStore()

  if (runHistory.length < 2) return null

  const v1 = runHistory.find(r => r.runMode === 'v1-broken')
  const v2 = runHistory.find(r => r.runMode === 'v2-fixed')

  if (!v1 || !v2) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="history"
      data-testid="history-section"
      className="py-12 px-4 max-w-7xl mx-auto w-full"
    >
      <div className="mb-6">
        <div className="font-mono text-[10px] text-[var(--accent-green)] uppercase tracking-widest mb-2">
          // HISTORY LOG
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <h2 data-testid="history-heading" className="text-xl font-bold text-[var(--text-primary)]">AI Agent Learning Cycle</h2>
          <span className="font-mono text-[10px] px-2.5 py-1 rounded"
            style={{ background: 'rgba(0,255,157,0.07)', border: '1px solid rgba(0,255,157,0.2)', color: 'var(--accent-green)' }}>
            v1 → v2 Fixed
          </span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Agent QC corrected the wrong locator after FAIL — compare test results across runs.
        </p>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        {/* Column headers */}
        <div
          className="grid grid-cols-4 text-[10px] font-mono uppercase tracking-widest border-b px-4 py-2.5"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}
        >
          <span className="text-[var(--text-muted)] col-span-2">Test</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-red)]" />
            <span className="text-[var(--accent-red)]">Run #{v1.runId} — v1 (AI Error)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]" />
            <span className="text-[var(--accent-green)]">Run #{v2.runId} — v2 (AI Fixed)</span>
          </div>
        </div>

        {/* Test rows */}
        {TESTS.map((test, i) => {
          const r1 = runResult(v1, test.id)
          const r2 = runResult(v2, test.id)
          const hasLocatorDiff = test.id === 'pipeline.spec.ts'

          return (
            <div
              key={test.id}
              className="grid grid-cols-4 px-4 py-3 border-b last:border-b-0 items-start gap-2"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div className="col-span-2">
                <div className="font-mono text-[11px] text-[var(--text-secondary)]">{test.id}</div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{test.label}</div>
              </div>

              {/* v1 result */}
              <div className="space-y-1.5">
                <ResultBadge passed={r1.passed} retries={r1.retries} />
                {hasLocatorDiff && r1.locator && (
                  <div className="font-mono text-[9px] px-1.5 py-1 rounded break-all"
                    style={{ background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.15)', color: 'var(--accent-red)' }}>
                    {r1.locator}
                  </div>
                )}
              </div>

              {/* v2 result */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <ResultBadge passed={r2.passed} retries={r2.retries} />
                  {hasLocatorDiff && r2.passed && (
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(0,255,157,0.07)', color: 'var(--accent-green)', border: '1px solid rgba(0,255,157,0.2)' }}>
                      AI Fixed
                    </span>
                  )}
                </div>
                {hasLocatorDiff && r2.locator && (
                  <div className="font-mono text-[9px] px-1.5 py-1 rounded break-all"
                    style={{ background: 'rgba(0,255,157,0.05)', border: '1px solid rgba(0,255,157,0.15)', color: 'var(--accent-green)' }}>
                    {r2.locator}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Summary footer */}
        <div
          data-testid="history-summary"
          className="grid grid-cols-4 px-4 py-2.5 text-[10px] font-mono"
          style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}
        >
          <span className="col-span-2 text-[var(--text-muted)]">Summary</span>
          <span style={{ color: 'var(--accent-red)' }}>1 fail · {v1.retryCount} retries</span>
          <span style={{ color: 'var(--accent-green)' }}>2 pass · 0 retries</span>
        </div>
      </div>
    </motion.section>
  )
}
