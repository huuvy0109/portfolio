'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import MTopBar from '@/components/mobile/MTopBar'
import MBottomTabs from '@/components/mobile/MBottomTabs'
import MCard from '@/components/mobile/MCard'
import MBadge from '@/components/mobile/MBadge'
import { M } from '@/components/mobile/tokens'

interface MRun {
  id: string
  status: string
  env: string
  passed: string | null
  failed: string | null
  skipped: string | null
  durationMs: string | null
  blobUrl: string | null
  createdAt: string
}

interface TestResult {
  id: string
  title: string
  file: string | null
  status: string
  durationMs: string | null
  errorMessage: string | null
  retryCount: string | null
}

interface Props {
  projectName: string
  projectSlug: string
  hasCiConfig: boolean
  runs: MRun[]
  passRate: number
  avgDurationS: number
  totalTests: number
}

function fmtDur(ms: string | null) {
  if (!ms) return '—'
  const n = parseInt(ms)
  return n < 1000 ? `${n}ms` : `${(n / 1000).toFixed(1)}s`
}
function fmtTs(iso: string) {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`
}

function RunDetailSheet({ runId, slug, onClose }: { runId: string; slug: string; onClose: () => void }) {
  const [run, setRun] = useState<MRun | null>(null)
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/reports/${slug}/${runId}`)
      .then(r => r.json())
      .then((d: { run: MRun; results: TestResult[] }) => {
        setRun(d.run)
        setResults(d.results)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [runId, slug])

  const statusDot = run?.status === 'passed' ? M.accent3 : run?.status === 'failed' ? M.danger : M.warn

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,.65)',
        }}
      />
      <motion.div
        key="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
          maxHeight: '82svh', background: M.bg,
          borderRadius: '18px 18px 0 0', border: `1px solid ${M.borderStrong}`,
          borderBottom: 'none', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: M.borderStrong }} />
        </div>

        {/* Sheet header */}
        <div style={{ padding: '8px 16px 14px', borderBottom: `1px solid ${M.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusDot }} />
              <span style={{ fontFamily: M.mono, fontSize: 12, fontWeight: 600, color: M.text }}>
                {run ? fmtTs(run.createdAt) : '—'}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: `1px solid ${M.border}`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: M.mono, fontSize: 11, color: M.textDim }}
            >✕</button>
          </div>
          <div style={{ fontFamily: M.mono, fontSize: 10, color: M.textDim }}>
            {run?.env ?? '—'} · {fmtDur(run?.durationMs ?? null)} · {results.length} tests
            {run?.blobUrl && (
              <> · <a href={run.blobUrl} target="_blank" rel="noreferrer" style={{ color: M.accent3 }}>open report ↗</a></>
            )}
          </div>
        </div>

        {/* Test results */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {loading && (
            <div style={{ fontFamily: M.mono, fontSize: 11, color: M.textDim, textAlign: 'center', padding: 24 }}>
              // loading...
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {results.map(t => (
              <MCard
                key={t.id}
                style={{
                  padding: 11,
                  borderColor: t.status === 'failed' ? `rgba(${M.dangerRgb},.25)` : M.border,
                  background: t.status === 'failed' ? `rgba(${M.dangerRgb},.04)` : M.surf2,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontFamily: M.mono, fontSize: 11, color: M.text, fontWeight: 600, flex: 1, marginRight: 8 }}>{t.title}</div>
                  <MBadge status={t.status} />
                </div>
                {t.errorMessage && (
                  <div style={{ fontFamily: M.mono, fontSize: 9.5, color: M.danger, marginBottom: 6, paddingLeft: 8, borderLeft: `2px solid rgba(${M.dangerRgb},.4)`, lineHeight: 1.4 }}>
                    ↳ {t.errorMessage}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: M.mono, fontSize: 9.5, color: M.textDim }}>{t.file ?? '—'}</span>
                  <span style={{ fontFamily: M.mono, fontSize: 9.5, color: parseInt(t.retryCount ?? '0') > 0 ? M.warn : M.textDim }}>
                    {fmtDur(t.durationMs)}{parseInt(t.retryCount ?? '0') > 0 ? ` · ${t.retryCount}× retry` : ''}
                  </span>
                </div>
              </MCard>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

export default function MobileRunsClient({ projectName, projectSlug, hasCiConfig, runs, passRate, avgDurationS, totalTests }: Props) {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [triggering, setTriggering] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState('')

  async function handleTrigger() {
    setTriggering(true)
    setTriggerMsg('')
    try {
      const res = await fetch(`/api/projects/${projectSlug}/trigger`, { method: 'POST' })
      const data = await res.json() as { message?: string; error?: string }
      setTriggerMsg(res.ok ? (data.message ?? '✓ Triggered') : `✗ ${data.error ?? 'Failed'}`)
    } catch {
      setTriggerMsg('✗ Network error')
    }
    setTriggering(false)
    setTimeout(() => setTriggerMsg(''), 4000)
  }

  return (
    <>
      <MTopBar subtitle="PROJECT_RUNS" />
      <div style={{ paddingTop: 52, paddingBottom: 104, paddingLeft: 16, paddingRight: 16, fontFamily: M.sans }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 16, marginBottom: 10, fontFamily: M.mono, fontSize: 11 }}>
          <a href="/m/dashboard/projects" style={{ color: M.textDim, textDecoration: 'none' }}>← Projects</a>
          <span style={{ color: M.textDim }}>/</span>
          <span style={{ color: M.textSec }}>{projectName}</span>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: M.text }}>{projectName}</h1>
          {hasCiConfig && (
            <button
              onClick={handleTrigger}
              disabled={triggering}
              style={{
                fontFamily: M.mono, fontSize: 11, fontWeight: 600, padding: '7px 12px', borderRadius: 7, cursor: 'pointer',
                border: `1px solid rgba(${M.accent2Rgb},.5)`, background: `rgba(${M.accent2Rgb},.1)`, color: M.accent2,
                opacity: triggering ? 0.6 : 1,
              }}
            >▶ Trigger CI</button>
          )}
        </div>
        {triggerMsg && (
          <div style={{ fontFamily: M.mono, fontSize: 11, color: triggerMsg.startsWith('✗') ? M.danger : M.accent3, marginBottom: 10 }}>
            {triggerMsg}
          </div>
        )}

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <MCard style={{ padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: M.mono, fontSize: 9, color: M.textDim, textTransform: 'uppercase', letterSpacing: '.08em' }}>Pass Rate</span>
              <span style={{ color: M.accent3 }}>✓</span>
            </div>
            <div style={{ fontFamily: M.mono, fontSize: 22, fontWeight: 700, color: passRate === 100 ? M.accent3 : passRate >= 80 ? M.warn : M.danger, marginBottom: 8 }}>
              {passRate}%
            </div>
            <div style={{ height: 4, borderRadius: 2, background: M.surf3, overflow: 'hidden' }}>
              <div style={{ width: `${passRate}%`, height: '100%', background: passRate === 100 ? M.accent3 : passRate >= 80 ? M.warn : M.danger, borderRadius: 2 }} />
            </div>
          </MCard>
          <MCard style={{ padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: M.mono, fontSize: 9, color: M.textDim, textTransform: 'uppercase', letterSpacing: '.08em' }}>Avg Duration</span>
              <span style={{ color: M.textDim, fontSize: 11 }}>⏱</span>
            </div>
            <div style={{ fontFamily: M.mono, fontSize: 22, fontWeight: 700, color: M.text }}>{avgDurationS.toFixed(1)}s</div>
          </MCard>
          <MCard style={{ padding: 12, gridColumn: '1/-1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: M.mono, fontSize: 9, color: M.textDim, textTransform: 'uppercase', letterSpacing: '.08em' }}>Total Tests</span>
              <span style={{ color: M.textDim, fontSize: 11 }}>▤</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <div style={{ fontFamily: M.mono, fontSize: 22, fontWeight: 700, color: M.text }}>{totalTests}</div>
              <div style={{ fontFamily: M.mono, fontSize: 10, color: M.textDim }}>Across {runs.length} runs</div>
            </div>
          </MCard>
        </div>

        {/* Run cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {runs.map(r => (
            <MCard
              key={r.id}
              style={{ padding: 12, cursor: 'pointer', borderColor: r.status === 'passed' ? `rgba(${M.accent3Rgb},.18)` : `rgba(${M.dangerRgb},.2)` }}
            >
              <button
                onClick={() => setSelectedRunId(r.id)}
                style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <MBadge status={r.status} />
                  <span style={{ fontFamily: M.mono, fontSize: 10, color: M.textDim }}>
                    {r.env} <span style={{ color: M.accent }}>→</span>
                  </span>
                </div>
                <div style={{ fontFamily: M.mono, fontSize: 12, color: M.text, marginBottom: 6 }}>{fmtTs(r.createdAt)}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 10, fontFamily: M.mono, fontSize: 10 }}>
                    <span style={{ color: M.accent3 }}>● {r.passed ?? 0}</span>
                    <span style={{ color: M.danger }}>● {r.failed ?? 0}</span>
                    <span style={{ color: M.warn }}>● {r.skipped ?? 0}</span>
                  </div>
                  <span style={{ fontFamily: M.mono, fontSize: 10, color: M.textDim }}>{fmtDur(r.durationMs)}</span>
                </div>
              </button>
            </MCard>
          ))}
          {runs.length === 0 && (
            <div style={{ fontFamily: M.mono, fontSize: 11, color: M.textDim, textAlign: 'center', padding: '32px 0' }}>
              No runs yet
            </div>
          )}
        </div>
      </div>
      <MBottomTabs />

      {selectedRunId && (
        <RunDetailSheet runId={selectedRunId} slug={projectSlug} onClose={() => setSelectedRunId(null)} />
      )}
    </>
  )
}
