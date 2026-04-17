'use client'

import { motion } from 'framer-motion'
import { usePipelineStore } from '@/lib/store/pipelineStore'
import { GATE_RULES } from '@/lib/decision-engine'

export default function QualityGate() {
  const { phase, failCount, retryCount, isFlaky, decision, makeDecision, auditLog } = usePipelineStore()

  if (phase !== 'quality-gate' && phase !== 'completed' && phase !== 'rejected') return null
  if (phase === 'quality-gate' && failCount === 0) return null

  const isDecided = phase === 'completed' || phase === 'rejected'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      data-testid="quality-gate"
      className="mt-6 rounded-xl overflow-hidden"
      style={{
        border: isDecided
          ? `1px solid ${decision === 'override' ? 'rgba(255,68,68,0.3)' : 'rgba(192,132,252,0.3)'}`
          : '1px solid rgba(255,68,68,0.4)',
        background: isDecided
          ? `${decision === 'override' ? 'rgba(255,68,68,0.04)' : 'rgba(192,132,252,0.04)'}`
          : 'rgba(255,68,68,0.05)',
      }}
    >
      {/* Gate header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b"
        style={{
          borderColor: isDecided
            ? (decision === 'override' ? 'rgba(255,68,68,0.2)' : 'rgba(192,132,252,0.2)')
            : 'rgba(255,68,68,0.2)',
          background: 'rgba(0,0,0,0.2)',
        }}
      >
        <div className="flex items-center gap-3">
          {!isDecided && (
            <div
              className="w-2 h-2 rounded-full bg-[var(--accent-red)]"
              style={{ animation: 'pulse-glow 1s ease-in-out infinite' }}
            />
          )}
          {isDecided && decision === 'override' && <span className="text-sm">🔴</span>}
          {isDecided && decision === 'reject' && <span className="text-sm">🔄</span>}
          <span
            className="font-mono text-sm font-semibold tracking-wide"
            style={{ color: isDecided ? (decision === 'override' ? 'var(--accent-red)' : 'var(--accent-purple)') : 'var(--accent-red)' }}
          >
            {!isDecided && '⛔ QUALITY GATE — PIPELINE BLOCKED'}
            {isDecided && decision === 'override' && 'RISK ACCEPTED — HUMAN OVERRIDE'}
            {isDecided && decision === 'reject' && 'REJECTED — AGENT RETRAIN QUEUED'}
          </span>
        </div>

        <span className="font-mono text-[10px] text-[var(--text-muted)]">
          {auditLog.length > 0 ? auditLog[auditLog.length - 1].at : new Date().toLocaleTimeString('en-US',{hour12:false})}
        </span>
      </div>

      <div className="p-5">
        {!isDecided && (
          <>
            {/* Alert details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div
                className="rounded-lg p-3.5"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Failure Report</div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-[var(--text-secondary)]">Test file</span>
                    <span className="font-mono text-xs text-[var(--accent-red)]">pipeline.spec.ts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-[var(--text-secondary)]">failCount</span>
                    <span className="font-mono text-xs text-[var(--accent-red)]">{failCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-[var(--text-secondary)]">retryCount</span>
                    <span className="font-mono text-xs text-[var(--accent-yellow)]">{retryCount}</span>
                  </div>
                  {isFlaky && (
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs text-[var(--text-secondary)]">status</span>
                      <span className="font-mono text-xs text-[var(--accent-yellow)]">⚠ FLAKY</span>
                    </div>
                  )}
                </div>
              </div>

              <div
                className="rounded-lg p-3.5"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Root Cause</div>
                <p className="font-mono text-xs text-[var(--text-secondary)] leading-relaxed">
                  Locator{' '}
                  <code className="text-[var(--accent-orange)]">[data-testid=&quot;card-ba-analyzing&quot;]</code>{' '}
                  not found after 2 retries. Suspected async DOM race condition in pipeline state update.
                </p>
              </div>
            </div>

            {/* Decision Engine rules */}
            <div className="mb-5">
              <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Decision Engine</div>
              <div className="space-y-1">
                {GATE_RULES.map(rule => (
                  <div
                    key={rule.condition}
                    className="flex items-start gap-3 font-mono text-xs py-1.5 px-2.5 rounded"
                    style={{
                      background: rule.condition === 'failCount > 0' ? 'rgba(255,68,68,0.06)' : 'transparent',
                      border: rule.condition === 'failCount > 0' ? '1px solid rgba(255,68,68,0.15)' : '1px solid transparent',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)', minWidth: '110px' }}>{rule.condition}</span>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <span style={{ color: rule.result === 'GATE_BLOCKED' ? 'var(--accent-red)' : rule.result === 'FLAKY_DETECTED' ? 'var(--accent-yellow)' : 'var(--accent-green)' }}>
                      {rule.result}
                    </span>
                    <span className="text-[var(--text-muted)] hidden md:block">— {rule.action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                data-testid="btn-override"
                onClick={() => makeDecision('override')}
                className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg font-mono text-sm font-semibold transition-all duration-200"
                style={{
                  background: 'rgba(255,68,68,0.08)',
                  border: '1px solid rgba(255,68,68,0.35)',
                  color: 'var(--accent-red)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,68,68,0.15)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(255,68,68,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,68,68,0.08)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <span>🔴</span>
                <span>Override — Accept Risk</span>
              </button>

              <button
                data-testid="btn-reject"
                onClick={() => makeDecision('reject')}
                className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg font-mono text-sm font-semibold transition-all duration-200"
                style={{
                  background: 'rgba(192,132,252,0.06)',
                  border: '1px solid rgba(192,132,252,0.3)',
                  color: 'var(--accent-purple)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,132,252,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(192,132,252,0.06)' }}
              >
                <span>🔄</span>
                <span>Reject &amp; Retrain Agent</span>
              </button>
            </div>
          </>
        )}

        {/* Post-decision audit trail */}
        {isDecided && auditLog.length > 0 && (
          <div className="space-y-3">
            <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Audit Trail</div>
            {auditLog.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 font-mono text-xs py-2 px-3 rounded"
                style={{
                  background: 'var(--bg-secondary)',
                  border: `1px solid ${decision === 'override' ? 'rgba(255,68,68,0.2)' : 'rgba(192,132,252,0.2)'}`,
                }}
              >
                <span className="text-[var(--text-muted)] shrink-0">{entry.at}</span>
                <span style={{ color: decision === 'override' ? 'var(--accent-red)' : 'var(--accent-purple)' }}>
                  {entry.action}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
