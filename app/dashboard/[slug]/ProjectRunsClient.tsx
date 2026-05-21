'use client'

import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Interfaces ───────────────────────────────────────────
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

const RUNS_PER_PAGE = 10

// ─── Status helpers ───────────────────────────────────────
function statusColor(s: string) {
  if (s === 'passed') return 'var(--accent-green)'
  if (s === 'failed') return 'var(--accent-red)'
  if (s === 'running') return 'var(--accent-orange)'
  return 'var(--accent-yellow)'
}
function statusBg(s: string) {
  if (s === 'passed') return 'rgba(0,229,160,0.12)'
  if (s === 'failed') return 'rgba(255,68,68,0.12)'
  if (s === 'running') return 'rgba(249,115,22,0.12)'
  return 'rgba(245,197,24,0.1)'
}
function statusBorder(s: string) {
  if (s === 'passed') return 'rgba(0,229,160,0.25)'
  if (s === 'failed') return 'rgba(255,68,68,0.25)'
  if (s === 'running') return 'rgba(249,115,22,0.3)'
  return 'rgba(245,197,24,0.2)'
}

// ─── Category badge ───────────────────────────────────────
function getCategories(file: string | null): string[] {
  if (!file) return ['E2E']
  const f = file.toLowerCase()
  if (f.includes('auth') || f.includes('login')) return ['E2E', 'SANITY']
  if (f.includes('api') || f.includes('v2') || f.includes('integration')) return ['INTEGRATION']
  if (f.includes('checkout') || f.includes('payment') || f.includes('legacy')) return ['LEGACY']
  if (f.includes('performance') || f.includes('search') || f.includes('query') || f.includes('load')) return ['Performance']
  if (f.includes('settings') || f.includes('asset') || f.includes('profile') || f.includes('functional')) return ['Functional']
  return ['E2E']
}
function catStyle(cat: string) {
  const m: Record<string, { bg: string; border: string; color: string }> = {
    E2E:         { bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)',  color: 'var(--accent-blue)' },
    SANITY:      { bg: 'rgba(0,229,160,0.10)',   border: 'rgba(0,229,160,0.25)', color: 'var(--accent-green)' },
    LEGACY:      { bg: 'rgba(245,197,24,0.10)',  border: 'rgba(245,197,24,0.25)',color: 'var(--accent-yellow)' },
    INTEGRATION: { bg: 'rgba(192,132,252,0.10)', border: 'rgba(192,132,252,0.25)',color: 'var(--accent-purple)' },
    Performance: { bg: 'rgba(249,115,22,0.10)',  border: 'rgba(249,115,22,0.25)',color: 'var(--accent-orange)' },
    Functional:  { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)',color: 'var(--text-secondary)' },
  }
  return m[cat] ?? m['E2E']
}

// ─── Helpers ──────────────────────────────────────────────
function fmtDuration(ms: string | null) {
  if (!ms) return '—'
  const n = parseInt(ms)
  if (n < 1000) return `${n}ms`
  return `${(n / 1000).toFixed(1)}s`
}
function fmtTs(date: Date) {
  const d = new Date(date)
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')} ${d.getDate()}/${d.getMonth()+1}/${String(d.getFullYear()).slice(2)}`
}
function fmtRunLabel(date: Date) {
  const d = new Date(date)
  return `RUN — ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')} ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`
}
function shortId(id: string): string {
  return `RUN-ID-0x${id.replace(/-/g,'').slice(0,6).toUpperCase()}`
}
function testShortId(id: string, idx: number): string {
  const letters = ['XA','XB','XC','XD','XE','XF','XG','XH']
  return `ID: ${id.replace(/-/g,'').slice(0,5).toUpperCase()}-${letters[idx % letters.length]}`
}
function genInsight(results: TestResult[]): string {
  const failed = results.filter(r => r.status === 'failed').length
  const flaky  = results.filter(r => r.status === 'flaky' || parseInt(r.retryCount ?? '0') > 0).length
  if (failed === 0 && flaky === 0) return 'All core journeys passed. No anomalies detected in monitored modules.'
  if (failed === 0) return `All core journeys passed. ${flaky} minor flake${flaky > 1 ? 's' : ''} detected in network-dependent modules.`
  return `${failed} test${failed > 1 ? 's' : ''} failed — Code Bug classification. Review required before deployment.`
}

// ─── Icon components ──────────────────────────────────────
function IconBell() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}
function IconSignal() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 20h.01M7 20v-4M12 20V10M17 20V4M22 20v-2" />
    </svg>
  )
}
function IconGrid() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )
}
function IconTarget() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  )
}
function IconFilter() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  )
}
function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  )
}
function IconBack() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  )
}
function IconDownload() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
    </svg>
  )
}
function IconRefresh() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
    </svg>
  )
}
function IconStop() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
    </svg>
  )
}
function IconSearch() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

// ─── Page Button ──────────────────────────────────────────
function PageBtn({ children, onClick, active, disabled }: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-lg font-mono text-[11px] flex items-center justify-center transition-all duration-150"
      style={{
        background: active ? 'rgba(249,115,22,0.15)' : 'transparent',
        border: `1px solid ${active ? 'rgba(249,115,22,0.4)' : 'var(--border-dim)'}`,
        color: active ? 'var(--accent-orange)' : 'var(--text-muted)',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  )
}

// ─── Top Bar (shared) ─────────────────────────────────────
function TopBar({ onBack, showBack = false }: { onBack?: () => void; showBack?: boolean }) {
  return (
    <div
      className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 py-2.5 border-b -mx-4 sm:-mx-6 lg:-mx-8 sticky top-0 z-20 flex-shrink-0"
      style={{ background: 'var(--surface-lowest)', borderColor: 'var(--border-subtle)' }}
    >
      {showBack && onBack && (
        <button
          onClick={onBack}
          className="p-1 rounded flex-shrink-0 transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Back to runs"
        >
          <IconBack />
        </button>
      )}
      <span className="font-mono text-[11px] font-bold tracking-widest uppercase flex-shrink-0" style={{ color: 'var(--text-primary)' }}>
        PROJECT_RUNS
      </span>
      {!showBack && (
        <>
          <span className="hidden sm:block" style={{ color: 'var(--border-dim)' }}>|</span>
          <span
            className="hidden sm:inline-block font-mono text-[10px] px-2 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-dim)', color: 'var(--text-muted)' }}
          >
            CLUSTER: ALPHA-9
          </span>
          <span
            className="hidden md:inline-block font-mono text-[10px] px-2 py-0.5 rounded"
            style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', color: 'var(--accent-green)' }}
          >
            V4.2.1-STABLE
          </span>
        </>
      )}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div
          className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-1.5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-dim)' }}
        >
          <span style={{ color: 'var(--text-muted)' }}><IconSearch /></span>
          <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {showBack ? 'SEARCH RUNS...' : 'QUERY RUN ID...'}
          </span>
        </div>
        <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <IconBell /><IconSignal /><IconGrid />
        </div>
      </div>
    </div>
  )
}

// ─── Run Row ──────────────────────────────────────────────
function RunRow({ run, onOpen }: { run: Run; onOpen: () => void }) {
  const isRunning = run.status === 'running'
  return (
    <motion.div
      data-testid={`run-row-${run.id}`}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden cursor-pointer group transition-all duration-150"
      style={{
        background: 'var(--surface-low)',
        border: `1px solid ${statusBorder(run.status)}`,
      }}
      onClick={onOpen}
      whileHover={{ borderColor: statusColor(run.status), transition: { duration: 0.15 } }}
    >
      {/* Desktop */}
      <div
        className="hidden lg:grid items-center"
        style={{
          gridTemplateColumns: '130px 100px 1fr 175px 110px 56px',
          padding: '16px 20px',
        }}
      >
        {/* Status */}
        <div>
          <span
            data-testid={`badge-status-${run.id}`}
            className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1.5"
            style={{ background: statusBg(run.status), border: `1px solid ${statusBorder(run.status)}`, color: statusColor(run.status) }}
          >
            {isRunning && (
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent-orange)', animation: 'pulse-glow 1.4s ease-in-out infinite' }} />
            )}
            {run.status.toUpperCase()}
          </span>
        </div>
        {/* Environment */}
        <div>
          <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>{run.env}</span>
        </div>
        {/* Timestamp */}
        <div>
          <span className="font-mono text-[11px]" style={{ color: isRunning ? 'var(--accent-orange)' : 'var(--text-secondary)' }}>
            {isRunning ? 'LIVE NOW' : fmtTs(run.createdAt)}
          </span>
        </div>
        {/* Tests P/F/S */}
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent-green)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>{run.passed ?? 0}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent-red)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>{run.failed ?? 0}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent-yellow)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>{run.skipped ?? 0}</span>
          </span>
        </div>
        {/* Duration */}
        <div>
          <span className="font-mono text-[11px]" style={{ color: isRunning ? 'var(--accent-orange)' : 'var(--text-muted)' }}>
            {isRunning ? `${fmtDuration(run.durationMs)}...` : fmtDuration(run.durationMs)}
          </span>
        </div>
        {/* Action */}
        <div className="flex justify-end pr-1">
          {isRunning
            ? <span style={{ color: 'var(--text-muted)' }}><IconStop /></span>
            : <span className="transition-transform duration-150 group-hover:translate-x-0.5" style={{ color: 'var(--accent-orange)' }}><IconArrow /></span>
          }
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden p-5">
        <div className="flex items-center justify-between mb-2.5">
          <span
            className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1.5"
            style={{ background: statusBg(run.status), border: `1px solid ${statusBorder(run.status)}`, color: statusColor(run.status) }}
          >
            {isRunning && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-orange)', animation: 'pulse-glow 1.4s ease-in-out infinite' }} />}
            {run.status.toUpperCase()}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{run.env}</span>
            <span style={{ color: 'var(--accent-orange)' }}><IconArrow /></span>
          </div>
        </div>
        <div className="font-mono text-[11px] mb-3" style={{ color: isRunning ? 'var(--accent-orange)' : 'var(--text-secondary)' }}>
          {isRunning ? 'LIVE NOW' : fmtTs(run.createdAt)}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-green)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>{run.passed ?? 0}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-red)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>{run.failed ?? 0}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-yellow)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>{run.skipped ?? 0}</span>
            </span>
          </div>
          <span className="font-mono text-[11px]" style={{ color: isRunning ? 'var(--accent-orange)' : 'var(--text-muted)' }}>
            {isRunning ? `${fmtDuration(run.durationMs)}...` : fmtDuration(run.durationMs)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Test Result Row ──────────────────────────────────────
function TestResultRow({ result: r, idx, expanded, onToggle }: {
  result: TestResult
  idx: number
  expanded: boolean
  onToggle: () => void
}) {
  const retry = parseInt(r.retryCount ?? '0')
  const isFlaky = r.status === 'flaky' || retry > 0
  const cats = getCategories(r.file)
  const testId = testShortId(r.id, idx)
  const sBg = r.status === 'passed' ? 'rgba(0,229,160,0.12)' : r.status === 'failed' ? 'rgba(255,68,68,0.12)' : r.status === 'skipped' ? 'rgba(255,255,255,0.06)' : 'rgba(245,197,24,0.10)'
  const sBorder = r.status === 'passed' ? 'rgba(0,229,160,0.3)' : r.status === 'failed' ? 'rgba(255,68,68,0.3)' : r.status === 'skipped' ? 'rgba(255,255,255,0.12)' : 'rgba(245,197,24,0.25)'
  const sColor = r.status === 'passed' ? 'var(--accent-green)' : r.status === 'failed' ? 'var(--accent-red)' : r.status === 'skipped' ? 'var(--text-muted)' : 'var(--accent-yellow)'
  const statusLabel = r.status === 'passed' ? 'PASSED' : r.status === 'failed' ? 'FAILED' : r.status === 'skipped' ? 'SKIPPED' : r.status.toUpperCase()

  const isFailed = r.status === 'failed'

  return (
    <div className="border-b last:border-0"
      style={{
        borderColor: 'var(--border-subtle)',
        background: isFailed ? 'rgba(var(--danger-rgb), 0.04)' : 'transparent',
      }}
    >
      {/* Desktop */}
      <div
        className="hidden lg:grid items-center"
        style={{
          gridTemplateColumns: '1fr 165px 100px 145px 65px 50px',
          padding: '14px 24px',
        }}
      >
        <div className="min-w-0 pr-4">
          <div className="font-mono text-[11px] font-medium truncate" style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>{r.title}</div>
          <div className="font-mono text-[9px] mt-2" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{testId}</div>
          {isFailed && r.errorMessage && (
            <div className="font-mono text-[9px] mt-2 truncate" style={{ color: 'var(--accent-red)', lineHeight: 1.5 }}>
              ↳ {r.errorMessage}
            </div>
          )}
          {isFlaky && !isFailed && (
            <span className="font-mono text-[8px] px-1.5 py-0.5 rounded mt-0.5 inline-block"
              style={{ background: 'rgba(245,197,24,0.12)', border: '1px solid rgba(245,197,24,0.25)', color: 'var(--accent-yellow)' }}>
              ⚠ FLAKY
            </span>
          )}
        </div>
        <div>
          <span className="font-mono text-[10px] truncate block" style={{ color: 'var(--text-muted)' }}>{r.file ?? '—'}</span>
        </div>
        <div>
          <span className="font-mono text-[9px] px-2 py-0.5 rounded font-bold"
            style={{ background: sBg, border: `1px solid ${sBorder}`, color: sColor }}>
            {statusLabel}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {cats.map(cat => {
            const s = catStyle(cat)
            return (
              <span key={cat} className="font-mono text-[8px] px-1.5 py-0.5 rounded"
                style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
                {cat}
              </span>
            )
          })}
        </div>
        <div>
          <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {r.durationMs ? `${(parseInt(r.durationMs)/1000).toFixed(1)}s` : '—'}
          </span>
        </div>
        <div className="text-right">
          {r.errorMessage ? (
            <button onClick={onToggle} className="font-mono text-[10px]"
              style={{ color: retry > 0 ? 'var(--accent-yellow)' : 'var(--text-muted)' }}>
              {retry} {expanded ? '▲' : '▼'}
            </button>
          ) : (
            <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{retry}</span>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden px-4 py-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</div>
            <div className="font-mono text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{testId}</div>
          </div>
          <span className="font-mono text-[9px] px-2 py-0.5 rounded font-bold flex-shrink-0"
            style={{ background: sBg, border: `1px solid ${sBorder}`, color: sColor }}>
            {statusLabel}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 flex-wrap">
            {cats.map(cat => {
              const s = catStyle(cat)
              return (
                <span key={cat} className="font-mono text-[8px] px-1.5 py-0.5 rounded"
                  style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
                  {cat}
                </span>
              )
            })}
            {isFlaky && (
              <span className="font-mono text-[8px] px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(245,197,24,0.12)', border: '1px solid rgba(245,197,24,0.25)', color: 'var(--accent-yellow)' }}>
                ⚠ FLAKY
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {r.durationMs ? `${(parseInt(r.durationMs)/1000).toFixed(1)}s` : '—'}
            </span>
            {r.errorMessage && (
              <button onClick={onToggle} className="font-mono text-[10px]"
                style={{ color: retry > 0 ? 'var(--accent-yellow)' : 'var(--text-muted)' }}>
                {retry > 0 ? `${retry}x` : ''}{expanded ? ' ▲' : ' ▼'}
              </button>
            )}
          </div>
        </div>
        {r.file && (
          <div className="font-mono text-[10px] mt-1.5 truncate" style={{ color: 'var(--text-muted)' }}>{r.file}</div>
        )}
      </div>

      {/* Error expand */}
      <AnimatePresence>
        {r.errorMessage && expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <pre className="font-mono text-[10px] px-5 py-3 overflow-x-auto"
              style={{ color: 'var(--accent-red)', background: 'rgba(255,68,68,0.04)', borderTop: '1px solid rgba(255,68,68,0.15)' }}>
              {r.errorMessage}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Metric Card ──────────────────────────────────────────
function MetricCard({ title, subtitle, icon, children }: {
  title: string; subtitle: string; icon: React.ReactNode; children?: React.ReactNode
}) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface-low)', border: '1px solid var(--border-subtle)' }}>
      <div className="flex items-start gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
          {icon}
        </div>
        <div>
          <div className="font-mono text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>{title}</div>
          <div className="font-mono text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</div>
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── Run Detail View ──────────────────────────────────────
function RunDetailView({
  run, results, loadingResults, filteredResults,
  failedCount, flakyCount, resultFilter, setResultFilter,
  expandedErrors, toggleError, onClose,
}: {
  run: Run; results: TestResult[]; loadingResults: boolean
  filteredResults: TestResult[]; failedCount: number; flakyCount: number
  resultFilter: ResultFilter; setResultFilter: (f: ResultFilter) => void
  expandedErrors: Set<string>; toggleError: (id: string) => void; onClose: () => void
}) {
  const insight = genInsight(results)
  const runIdLabel = shortId(run.id)

  const chip = (label: string) => (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '2px 8px', borderRadius: 4,
      background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-dim)', color: 'var(--text-secondary)',
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>{label}</span>
  )

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '100%', maxWidth: '860px',
        maxHeight: 'calc(100vh - 48px)',
        display: 'flex', flexDirection: 'column',
        background: 'var(--surface-1)',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}>
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '0 24px', minHeight: '64px',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap', flexShrink: 0,
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor(run.status), flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', marginRight: 4 }}>
            {fmtRunLabel(run.createdAt)}
          </span>
          {chip(run.env)}
          {chip(fmtDuration(run.durationMs))}
          {run.totalTests && chip(`${run.totalTests} tests`)}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {run.blobUrl && (
              <a href={run.blobUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent)', textDecoration: 'none', flexShrink: 0 }}>
                Open HTML Report ↗
              </a>
            )}
            <button
              data-testid="btn-close-modal"
              onClick={onClose}
              style={{
                padding: '6px', borderRadius: '6px',
                border: '1px solid var(--border-dim)',
                color: 'var(--text-muted)', background: 'transparent',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {/* Main run card */}
        <div className="rounded-2xl overflow-hidden mb-4"
          style={{ background: 'var(--surface-low)', border: 'none', borderRadius: 0 }}>

          {/* Stats row */}
          <div className="grid border-b" style={{ gridTemplateColumns: 'repeat(5,1fr)', borderColor: 'var(--border-subtle)', background: 'rgba(255,255,255,0.012)' }}>
            {[
              { label: 'TOTAL',    value: run.totalTests ?? '—', color: 'var(--text-secondary)' },
              { label: 'PASSED',   value: run.passed ?? '—',     color: 'var(--accent-orange)' },
              { label: 'FAILED',   value: run.failed ?? '—',     color: 'var(--accent-red)' },
              { label: 'SKIPPED',  value: run.skipped ?? '—',    color: 'var(--accent-yellow)' },
              { label: 'DURATION', value: fmtDuration(run.durationMs), color: 'var(--text-secondary)' },
            ].map((stat, i) => (
              <div key={stat.label}
                className={`flex flex-col items-center justify-center gap-3 py-6 ${i < 4 ? 'border-r' : ''}`}
                style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {stat.label}
                </span>
                <span className="font-mono text-xl sm:text-2xl font-bold" style={{ color: stat.color, lineHeight: 1 }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center px-6 border-b flex-wrap gap-x-1"
            style={{ borderColor: 'var(--border-subtle)' }}>
            {([
              { key: 'all'    as ResultFilter, label: 'ALL TESTS',         accent: 'var(--accent-orange)' },
              { key: 'failed' as ResultFilter, label: `FAILED (${failedCount})`, accent: 'var(--accent-red)' },
              { key: 'flaky'  as ResultFilter, label: `FLAKY (${flakyCount})`,   accent: 'var(--accent-yellow)' },
            ]).map(tab => {
              const active = resultFilter === tab.key
              return (
                <button key={tab.key} onClick={() => setResultFilter(tab.key)}
                  className="font-mono text-[10px] px-3 transition-all duration-150"
                  style={{
                    background: 'transparent', border: 'none',
                    borderBottom: active ? `2px solid ${tab.accent}` : '2px solid transparent',
                    color: active ? tab.accent : 'var(--text-muted)',
                    marginBottom: '-1px',
                    lineHeight: 1.4,
                    paddingTop: '14px',
                    paddingBottom: '14px',
                  }}>
                  {tab.label}
                </button>
              )
            })}
            <div className="ml-auto flex-shrink-0 py-2">
              <button className="flex items-center gap-1.5 font-mono text-[10px] px-3 py-1.5 rounded-lg"
                style={{ border: '1px solid var(--border-dim)', color: 'var(--text-muted)', background: 'transparent' }}>
                <IconFilter /> ADVANCED FILTER
              </button>
            </div>
          </div>

          {/* Table */}
          {loadingResults ? (
            <div className="flex items-center justify-center h-32">
              <span className="font-mono text-sm animate-pulse" style={{ color: 'var(--accent-orange)' }}>Loading results...</span>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="flex items-center justify-center h-32 font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
              {results.length === 0 ? 'No test results stored for this run' : 'No results match this filter'}
            </div>
          ) : (
            <>
              {/* Column header — desktop */}
              <div className="hidden lg:grid font-mono uppercase"
                style={{
                  gridTemplateColumns: '1fr 165px 100px 145px 65px 50px',
                  fontSize: '9px', letterSpacing: '0.08em', lineHeight: 1,
                  color: 'var(--text-muted)',
                  background: 'var(--surface-lowest)',
                  borderBottom: '1px solid var(--border-subtle)',
                  padding: '13px 24px',
                }}>
                <span>TEST CASE</span><span>FILE</span><span>STATUS</span>
                <span>PHAN LOAI</span><span>TIME</span><span className="text-right">RETRY</span>
              </div>
              <div>
                {filteredResults.map((r, idx) => (
                  <TestResultRow key={r.id} result={r} idx={idx} expanded={expandedErrors.has(r.id)} onToggle={() => toggleError(r.id)} />
                ))}
              </div>
            </>
          )}

          {/* AI Insight bar */}
          {!loadingResults && results.length > 0 && (
            <div className="flex items-center gap-3 px-6 py-4 border-t flex-wrap"
              style={{ borderColor: 'var(--border-subtle)', background: 'rgba(249,115,22,0.04)' }}>
              <span style={{ color: 'var(--accent-orange)', fontSize: '16px', lineHeight: 1 }}>✦</span>
              <span className="font-mono text-[11px] flex-1">
                <span className="font-bold" style={{ color: 'var(--accent-orange)' }}>Lumix AI Insight: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{insight}</span>
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                INSTANCE: {runIdLabel}
              </span>
            </div>
          )}
        </div>

        </div>{/* /scrollable body */}

        {/* Footer metric cards — always visible */}
        <div style={{ flexShrink: 0, borderTop: '1px solid var(--border-subtle)', padding: '16px 20px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetricCard title="Node Distribution" subtitle="LOAD BALANCING ACTIVE"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3"/>
                <line x1="12" y1="3" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="21"/>
                <line x1="3" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="21" y2="12"/>
                <line x1="5.64" y1="5.64" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="18.36" y2="18.36"/>
              </svg>
            }>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div className="h-full rounded-full" style={{ width: '68%', background: 'var(--accent-orange)' }} />
            </div>
          </MetricCard>

          <MetricCard title="Historical Delta" subtitle="+1.4S VS LAST RUN"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="1.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            }>
            <div className="flex items-end gap-0.5 h-7 mt-1">
              {[3,5,2,6,4,8,5].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm"
                  style={{ height: `${h * 10}%`, background: i === 5 ? 'var(--accent-orange)' : 'rgba(249,115,22,0.28)' }} />
              ))}
            </div>
          </MetricCard>

          <MetricCard title="Worker Efficiency" subtitle="PEAK: 94.2%"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
            }>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>OPTIMIZED</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </MetricCard>
        </div>
        </div>
      </div>
    </div>
  , document.body
  )
}

// ─── Main Component ───────────────────────────────────────
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
  const [page, setPage] = useState(1)

  // ── Computed stats ──
  const passRate = useMemo(() => {
    if (!runs.length) return 0
    const passed = runs.filter(r => r.status === 'passed').length
    return Math.round((passed / runs.length) * 1000) / 10
  }, [runs])

  const avgDuration = useMemo(() => {
    const withDur = runs.filter(r => r.durationMs)
    if (!withDur.length) return 0
    const sum = withDur.reduce((s, r) => s + parseInt(r.durationMs!), 0)
    return Math.round(sum / withDur.length / 100) / 10
  }, [runs])

  const totalTests = useMemo(() => runs.reduce((s, r) => s + parseInt(r.totalTests ?? '0'), 0), [runs])

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(runs.length / RUNS_PER_PAGE))
  const pagedRuns  = runs.slice((page - 1) * RUNS_PER_PAGE, page * RUNS_PER_PAGE)

  // ── Filtered results ──
  const failedCount = results.filter(r => r.status === 'failed').length
  const flakyCount  = results.filter(r => r.status === 'flaky' || parseInt(r.retryCount ?? '0') > 0).length
  const filteredResults = results.filter(r => {
    if (resultFilter === 'all')    return true
    if (resultFilter === 'failed') return r.status === 'failed'
    if (resultFilter === 'flaky')  return r.status === 'flaky' || parseInt(r.retryCount ?? '0') > 0
    return true
  })

  // ── Actions ──
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
    const data = await res.json() as { results?: TestResult[] }
    setResults(data.results || [])
    setLoadingResults(false)
  }

  function closeRun() { setSelectedRun(null); setResults([]) }

  function toggleError(id: string) {
    setExpandedErrors(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── List + modal view ──
  return (
    <div className="flex flex-col">
      <TopBar />

      <div className="px-4 sm:px-6 lg:px-8 -mx-4 sm:-mx-6 lg:-mx-8" style={{ paddingTop: '24px', paddingBottom: '8px' }}>
        {/* Breadcrumb */}
        <div className="flex items-center font-mono uppercase"
          style={{ gap: '6px', marginBottom: '14px', fontSize: '10px', letterSpacing: '0.06em', lineHeight: 1.4 }}>
          <a href="/dashboard/projects" style={{ color: 'var(--text-muted)' }}>Projects</a>
          <span style={{ color: 'var(--border-dim)' }}>›</span>
          <span style={{ color: 'var(--text-secondary)' }}>{project.name}</span>
        </div>

        {/* Project header */}
        <div className="flex flex-wrap items-start justify-between" style={{ gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 className="font-bold" style={{ fontSize: '24px', marginBottom: '10px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
              {project.name}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Avatar stack */}
              <div className="flex -space-x-1.5">
                {['QA','AI','CI'].map((l, i) => (
                  <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[8px] font-bold border-2"
                    style={{ background: `rgba(249,115,22,${0.14 + i*0.06})`, borderColor: 'var(--bg-primary)', color: 'var(--accent-orange)', zIndex: 3 - i }}>
                    {l}
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[8px] font-bold border-2"
                  style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'var(--bg-primary)', color: 'var(--text-muted)', zIndex: 0 }}>
                  +4
                </div>
              </div>
              <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Lead: <span style={{ color: 'var(--accent-orange)' }}>QA Owner</span> &amp; 6 collaborators
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {triggerMsg && (
              <span className="font-mono text-[11px]" style={{ color: triggerMsg.ok ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {triggerMsg.text}
              </span>
            )}
            <button className="flex items-center gap-1.5 font-mono text-[11px] px-4 py-2 rounded-lg"
              style={{ border: '1px solid var(--border-dim)', color: 'var(--text-muted)', background: 'transparent' }}>
              <IconFilter /> Filter
            </button>
            {project.ciConfig && (
              <button
                data-testid="btn-trigger-ci"
                onClick={() => setShowTriggerConfirm(true)}
                disabled={triggering}
                className="flex items-center gap-1.5 font-mono text-[11px] font-bold px-5 py-2 rounded-full transition-all duration-200 disabled:opacity-50"
                style={{ background: triggering ? 'rgba(249,115,22,0.7)' : 'var(--accent-orange)', color: '#000', border: 'none' }}>
                <IconTarget /> {triggering ? 'Triggering...' : 'TRIGGER RUN'}
              </button>
            )}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: '14px', marginBottom: '28px' }}>
          {/* Pass Rate */}
          <div className="rounded-xl"
            style={{ background: 'var(--surface-low)', border: '1px solid var(--border-subtle)', padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="flex items-center justify-between">
              <span className="font-mono uppercase" style={{ fontSize: '9px', letterSpacing: '0.08em', lineHeight: 1.4, color: 'var(--text-muted)' }}>PASS RATE</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="font-mono font-bold" style={{ fontSize: '22px', lineHeight: 1.2, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {passRate}%
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${passRate}%`, background: 'var(--accent-green)' }} />
            </div>
          </div>

          {/* Avg Duration */}
          <div className="rounded-xl"
            style={{ background: 'var(--surface-low)', border: '1px solid var(--border-subtle)', padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="flex items-center justify-between">
              <span className="font-mono uppercase" style={{ fontSize: '9px', letterSpacing: '0.08em', lineHeight: 1.4, color: 'var(--text-muted)' }}>AVG DURATION</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="font-mono font-bold" style={{ fontSize: '22px', lineHeight: 1.2, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {avgDuration}s
            </div>
            <div className="font-mono" style={{ fontSize: '10px', lineHeight: 1.4, color: 'var(--text-muted)' }}>↗ 12s vs last week</div>
          </div>

          {/* Total Tests */}
          <div className="rounded-xl"
            style={{ background: 'var(--surface-low)', border: '1px solid var(--border-subtle)', padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="flex items-center justify-between">
              <span className="font-mono uppercase" style={{ fontSize: '9px', letterSpacing: '0.08em', lineHeight: 1.4, color: 'var(--text-muted)' }}>TOTAL TESTS</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            </div>
            <div className="font-mono font-bold" style={{ fontSize: '22px', lineHeight: 1.2, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {totalTests.toLocaleString()}
            </div>
            <div className="font-mono" style={{ fontSize: '10px', lineHeight: 1.4, color: 'var(--text-muted)' }}>ACROSS {runs.length} SCENARIO{runs.length !== 1 ? 'S' : ''}</div>
          </div>

          {/* AI Recommendation */}
          <div className="rounded-xl col-span-2 lg:col-span-1"
            style={{ background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.3)', padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span className="font-mono uppercase font-bold" style={{ fontSize: '9px', letterSpacing: '0.08em', lineHeight: 1.4, color: 'var(--accent-orange)' }}>
              AI RECOMMENDATION
            </span>
            <p className="font-mono flex-1" style={{ fontSize: '11px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              {passRate < 80
                ? 'Critical failures detected. Review failing tests before deployment.'
                : "Reroute traffic on 'ci' to reduce node latency."}
            </p>
            <button className="font-mono text-[10px] font-bold text-left" style={{ color: 'var(--accent-orange)' }}>
              OPTIMIZE NOW →
            </button>
          </div>
        </div>

        {/* Run table */}
        {runs.length === 0 ? (
          <div data-testid="runs-empty" className="flex flex-col items-center justify-center py-24 rounded-2xl"
            style={{ border: '1px dashed var(--border-subtle)' }}>
            <p className="font-mono text-sm mb-2" style={{ color: 'var(--text-muted)' }}>No runs yet</p>
            <p className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Upload via <code style={{ color: 'var(--accent-orange)' }}>POST /api/reports/upload</code>
            </p>
          </div>
        ) : (
          <div data-testid="runs-table">
            {/* Column headers — desktop */}
            <div className="hidden lg:grid font-mono uppercase font-semibold"
              style={{
                gridTemplateColumns: '130px 100px 1fr 175px 110px 56px',
                fontSize: '10px', letterSpacing: '0.06em', lineHeight: 1,
                color: 'var(--text-primary)',
                background: 'var(--surface-mid)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '13px 20px',
                marginTop: 0,
                marginBottom: '12px',
              }}>
              <span>Status</span><span>Environment</span><span>Timestamp</span>
              <span>Tests (P / F / S)</span><span>Duration</span><span className="text-right">Action</span>
            </div>

            <div className="flex flex-col gap-4">
              {pagedRuns.map(run => (
                <RunRow key={run.id} run={run} onOpen={() => openRun(run)} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
              <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Showing{' '}
                <strong style={{ color: 'var(--text-secondary)' }}>
                  {Math.min(RUNS_PER_PAGE, runs.length - (page-1)*RUNS_PER_PAGE)}
                </strong>{' '}
                of <strong style={{ color: 'var(--text-secondary)' }}>{runs.length}</strong> total runs
              </span>
              <div className="flex items-center gap-1">
                <PageBtn onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>{'<'}</PageBtn>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <PageBtn key={p} onClick={() => setPage(p)} active={p === page}>{p}</PageBtn>
                ))}
                <PageBtn onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>{'>'}</PageBtn>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Run detail modal (portal) */}
      {selectedRun && (
        <RunDetailView
          run={selectedRun} results={results} loadingResults={loadingResults}
          filteredResults={filteredResults} failedCount={failedCount} flakyCount={flakyCount}
          resultFilter={resultFilter} setResultFilter={setResultFilter}
          expandedErrors={expandedErrors} toggleError={toggleError} onClose={closeRun}
        />
      )}

      {/* Trigger confirm modal */}
      <AnimatePresence>
        {showTriggerConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.75)' }}
              onClick={() => setShowTriggerConfirm(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="relative rounded-2xl p-6 w-full max-w-sm"
              style={{ background: 'var(--surface-lowest)', border: '1px solid rgba(249,115,22,0.25)' }}>
              <div className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--accent-orange)' }}>
                // TRIGGER CI
              </div>
              <p className="text-sm mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                Dispatch CI pipeline?
              </p>
              <p className="font-mono text-[11px] mb-5" style={{ color: 'var(--text-muted)' }}>
                Sẽ trigger workflow cho project <strong>{project.name}</strong>.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowTriggerConfirm(false)}
                  className="flex-1 font-mono text-xs py-2.5 rounded-lg"
                  style={{ border: '1px solid var(--border-dim)', color: 'var(--text-muted)' }}>
                  Cancel
                </button>
                <button onClick={handleTrigger}
                  className="flex-1 font-mono text-xs py-2.5 rounded-full font-bold"
                  style={{ background: 'var(--accent-orange)', color: '#000', border: 'none' }}>
                  ▶ TRIGGER
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
