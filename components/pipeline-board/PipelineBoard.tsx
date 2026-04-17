'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePipelineStore, type PipelinePhase } from '@/lib/store/pipelineStore'
import { evaluate } from '@/lib/decision-engine'

interface Column {
  id: PipelinePhase
  label: string
  icon: string
  accentVar: string
  glowClass: string
}

const COLUMNS: Column[] = [
  { id: 'ba-analyzing',  label: 'BA Analyzing',  icon: '🤖', accentVar: '--accent-purple', glowClass: 'glow-purple' },
  { id: 'ready-for-dev', label: 'Ready for Dev', icon: '📋', accentVar: '--accent-blue',   glowClass: 'glow-blue'   },
  { id: 'qc-generating', label: 'QC Generating', icon: '🔬', accentVar: '--accent-yellow', glowClass: 'glow-yellow' },
  { id: 'ci-running',    label: 'CI Running',    icon: '⚡', accentVar: '--accent-green',  glowClass: 'glow-green'  },
]

interface Card {
  id: string
  title: string
  column: PipelinePhase | null
  tag: string
}

function getCards(phase: PipelinePhase, isFlaky: boolean, failCount: number, decision: string | null): Card[] {
  const rejected = phase === 'rejected'
  const overridden = phase === 'completed' && decision === 'override'

  const colFor = (cardId: string): PipelinePhase | null => {
    if (phase === 'idle') return null

    if (cardId === 'US-001') {
      if (['ba-analyzing'].includes(phase)) return 'ba-analyzing'
      if (['ready-for-dev'].includes(phase)) return 'ready-for-dev'
      return 'ci-running'
    }

    // US-002
    if (phase === 'ba-analyzing') return 'ba-analyzing'
    if (phase === 'ready-for-dev') return 'ready-for-dev'
    if (phase === 'qc-generating') return 'qc-generating'
    if (phase === 'ci-running' || phase === 'quality-gate') return 'ci-running'
    if (rejected) return 'qc-generating'
    if (overridden) return 'ci-running'
    return null
  }

  return [
    { id: 'US-001', title: 'Hero Section renders correctly',      column: colFor('US-001'), tag: 'hero.spec.ts' },
    { id: 'US-002', title: 'Pipeline Board state transitions',    column: colFor('US-002'), tag: 'pipeline.spec.ts' },
  ]
}

export default function PipelineBoard() {
  const { phase, failCount, retryCount, isFlaky, decision, trigger, reset } = usePipelineStore()
  const gateResult = evaluate(failCount, retryCount)
  const cards = getCards(phase, isFlaky, failCount, decision)
  const isRunning = phase !== 'idle' && phase !== 'completed' && phase !== 'rejected'

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            {['#ff5f56','#ffbd2e','#27c93f'].map(c => (
              <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
            ))}
          </div>
          <span className="font-mono text-xs text-[var(--text-secondary)] tracking-wide">
            META-PIPELINE — Board #47
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isFlaky && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-mono text-[10px] px-2 py-0.5 rounded"
              style={{ background: 'rgba(245,197,24,0.1)', border: '1px solid var(--accent-yellow)', color: 'var(--accent-yellow)' }}
            >
              ⚠ FLAKY
            </motion.span>
          )}
          {failCount > 0 && phase !== 'completed' && phase !== 'rejected' && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-[10px] px-2 py-0.5 rounded"
              style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid var(--accent-red)', color: 'var(--accent-red)' }}
            >
              ⛔ BLOCKED
            </motion.span>
          )}
          {phase === 'completed' && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(0,255,157,0.1)', border: '1px solid var(--accent-green)', color: 'var(--accent-green)' }}>
              ✓ DEPLOYED
            </span>
          )}
          {phase === 'rejected' && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)' }}>
              ↩ RETRAIN
            </span>
          )}
        </div>
      </div>

      {/* Columns — horizontal scroll on mobile */}
      <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-0 flex-1 min-h-[280px]">
        {COLUMNS.map((col, ci) => {
          const colCards = cards.filter(c => c.column === col.id)
          const isActive = phase === col.id || (col.id === 'ci-running' && phase === 'quality-gate')

          return (
            <div
              key={col.id}
              data-testid={`column-${col.id}`}
              className="flex flex-col border-r last:border-r-0 transition-all duration-500 shrink-0 lg:shrink"
              style={{
                borderColor: 'var(--border-subtle)',
                background: isActive ? 'rgba(255,255,255,0.015)' : 'transparent',
                minWidth: '140px',
                boxShadow: isActive ? `inset 0 0 40px rgba(0,0,0,0.15)` : 'none',
              }}
            >
              {/* Column header */}
              <div
                className="px-3 py-2.5 border-b flex flex-col gap-0.5"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{col.icon}</span>
                  <span
                    className="font-mono text-[10px] font-semibold tracking-widest uppercase transition-colors duration-300"
                    style={{ color: isActive ? `var(${col.accentVar})` : 'var(--text-muted)' }}
                  >
                    {col.label}
                  </span>
                </div>
                {/* Active underline bar — glow-bar animation */}
                <div
                  className="h-0.5 w-full rounded-full transition-all duration-500 origin-left"
                  style={{
                    background: `var(${col.accentVar})`,
                    opacity: isActive ? 1 : 0,
                    animation: isActive ? 'glow-bar 2s ease-in-out infinite' : 'none',
                  }}
                />
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 p-2 flex-1">
                <AnimatePresence>
                  {colCards.map(card => (
                    <motion.div
                      key={card.id}
                      data-testid={`card-${card.id}`}
                      layout
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                      className={`rounded-lg p-2.5 cursor-default transition-all duration-300 ${isActive ? col.glowClass : ''}`}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: `1px solid ${isActive ? `var(${col.accentVar})` : 'var(--border-subtle)'}`,
                        transition: 'box-shadow 0.4s ease, border-color 0.3s ease',
                      }}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <span className="font-mono text-[10px] text-[var(--text-muted)]">{card.id}</span>
                        {card.id === 'US-002' && isFlaky && col.id !== 'ba-analyzing' && col.id !== 'ready-for-dev' && (
                          <span className="text-[8px] text-[var(--accent-yellow)]">⚠</span>
                        )}
                        {card.id === 'US-002' && phase === 'completed' && decision === 'override' && (
                          <span
                            className="font-mono text-[8px] px-1 py-0.5 rounded"
                            style={{ background: 'rgba(255,68,68,0.15)', color: 'var(--accent-red)', border: '1px solid rgba(255,68,68,0.3)' }}
                          >
                            RISK
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-tight">{card.title}</p>
                      <div className="mt-2">
                        <span
                          className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
                        >
                          {card.tag}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Agent indicator */}
                {isActive && colCards.length === 0 && (
                  <div className="flex items-center gap-1.5 px-1 py-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: `var(${col.accentVar})`,
                        color: `var(${col.accentVar})`,
                        animation: 'pulse-glow-intense 1.4s ease-in-out infinite',
                        boxShadow: `0 0 8px var(${col.accentVar})`,
                      }}
                    />
                    <span className="font-mono text-[9px]" style={{ color: `var(${col.accentVar})` }}>processing...</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-t"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}
      >
        <div className="font-mono text-[10px] text-[var(--text-muted)]">
          {gateResult !== 'PASS' && (
            <span style={{ color: gateResult === 'GATE_BLOCKED' ? 'var(--accent-red)' : 'var(--accent-yellow)' }}>
              {gateResult === 'GATE_BLOCKED' ? `⛔ failCount: ${failCount}` : `⚠ retryCount: ${retryCount}`}
            </span>
          )}
          {gateResult === 'PASS' && phase !== 'idle' && (
            <span style={{ color: 'var(--text-muted)' }}>retryCount: {retryCount} | failCount: {failCount}</span>
          )}
          {phase === 'idle' && <span>Awaiting trigger...</span>}
        </div>

        <div className="flex gap-2">
          {phase === 'idle' && (
            <button
              data-testid="btn-simulate"
              onClick={trigger}
              className="font-mono text-[10px] px-3 py-1 rounded transition-all duration-200"
              style={{ background: 'rgba(0,255,157,0.08)', border: '1px solid rgba(0,255,157,0.25)', color: 'var(--accent-green)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,157,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,157,0.08)' }}
            >
              ▶ Simulate Trigger
            </button>
          )}
          {phase !== 'idle' && (
            <button
              data-testid="btn-reset"
              onClick={reset}
              className="font-mono text-[10px] px-3 py-1 rounded transition-all duration-200"
              style={{ border: '1px solid var(--border-dim)', color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              ↺ Reset
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
