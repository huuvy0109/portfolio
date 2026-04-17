'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePipelineStore, type LogLevel } from '@/lib/store/pipelineStore'

const levelStyle: Record<LogLevel, { color: string }> = {
  info:    { color: 'var(--text-secondary)' },
  success: { color: 'var(--accent-green)'  },
  warn:    { color: 'var(--accent-yellow)' },
  error:   { color: 'var(--accent-red)'    },
  system:  { color: 'var(--accent-blue)'   },
  agent:   { color: 'var(--accent-purple)' },
}

function StatusBadge({ phase, isRunning }: { phase: string; isRunning: boolean }) {
  if (isRunning) return (
    <div className="flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]"
        style={{ animation: 'pulse-glow 1s ease-in-out infinite' }} />
      <span className="font-mono text-[10px] text-[var(--accent-green)]">RUNNING</span>
    </div>
  )
  if (phase === 'quality-gate') return <span className="font-mono text-[10px] text-[var(--accent-red)]">⛔ GATE</span>
  if (phase === 'completed')    return <span className="font-mono text-[10px] text-[var(--accent-green)]">✓ DONE</span>
  if (phase === 'rejected')     return <span className="font-mono text-[10px] text-[var(--accent-purple)]">↩ RETRAIN</span>
  return <span className="font-mono text-[10px] text-[var(--text-muted)]">IDLE</span>
}

export default function TerminalUI() {
  const { logs, phase, runId, retryCount, failCount } = usePipelineStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)

  const isRunning = phase !== 'idle' && phase !== 'completed' && phase !== 'rejected'

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  // Summary status for mobile card
  const summaryStatus = failCount > 0 ? 'FAIL' : retryCount > 1 ? 'FLAKY' : logs.length > 0 ? 'PASS' : 'IDLE'
  const summaryColor = failCount > 0 ? 'var(--accent-red)' : retryCount > 1 ? 'var(--accent-yellow)' : logs.length > 0 ? 'var(--accent-green)' : 'var(--text-muted)'
  const lastLog = logs[logs.length - 1]

  return (
    <div
      className="rounded-xl flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Header — always visible */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            {['#ff5f56','#ffbd2e','#27c93f'].map(c => (
              <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
            ))}
          </div>
          <span className="font-mono text-xs text-[var(--text-secondary)]">
            ci-runner — Run #{runId || '—'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge phase={phase} isRunning={isRunning} />
          {/* Expand toggle — mobile only */}
          <button
            className="lg:hidden font-mono text-[10px] px-2 py-0.5 rounded ml-1 transition-colors"
            style={{ border: '1px solid var(--border-dim)', color: 'var(--text-muted)' }}
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? '▲ Hide' : '▾ Log'}
          </button>
        </div>
      </div>

      {/* Mobile summary card — hidden on lg+ */}
      <div className="lg:hidden px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold" style={{ color: summaryColor }}>{summaryStatus}</span>
            <span className="font-mono text-[10px] text-[var(--text-muted)]">
              fails: {failCount} · retries: {retryCount}
            </span>
          </div>
          {lastLog && (
            <span className="font-mono text-[10px] text-[var(--text-muted)] truncate max-w-[180px]">
              {lastLog.msg.slice(0, 40)}{lastLog.msg.length > 40 ? '…' : ''}
            </span>
          )}
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mt-3"
            >
              <div className="space-y-0.5 max-h-[200px] overflow-y-auto font-mono text-[10px]">
                {logs.slice(-20).map(line => (
                  <div key={line.id} className="flex gap-2">
                    <span className="text-[var(--text-muted)] shrink-0">{line.timestamp.slice(0,8)}</span>
                    <span style={{ color: levelStyle[line.level].color, wordBreak: 'break-word' }}>{line.msg}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full log area — hidden on mobile, shown on lg+ */}
      <div
        ref={scrollRef}
        className="hidden lg:block flex-1 overflow-y-auto p-4 space-y-0.5 min-h-[280px] max-h-[360px]"
        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
      >
        {phase === 'idle' && (
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs py-8 justify-center">
            <span>Waiting for pipeline trigger</span>
            <span className="cursor-blink" />
          </div>
        )}

        <AnimatePresence initial={false}>
          {logs.map((line) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="flex gap-3 text-[11px] leading-5 font-mono"
            >
              <span className="shrink-0 text-[var(--text-muted)] select-none">{line.timestamp}</span>
              <span className="shrink-0 select-none text-[10px]" style={{ color: 'var(--text-muted)', minWidth: '60px' }}>
                {line.worker}
              </span>
              <span style={{ color: levelStyle[line.level].color, wordBreak: 'break-word' }}>{line.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {isRunning && logs.length > 0 && (
          <div className="flex gap-3 text-[11px] font-mono mt-1">
            <span className="text-[var(--text-muted)]">{new Date().toLocaleTimeString('en-US',{hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>
            <span className="text-[var(--text-muted)] text-[10px]" style={{ minWidth: '60px' }}>system</span>
            <span className="text-[var(--text-muted)] cursor-blink">processing</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-t shrink-0"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px]" style={{ color: failCount > 0 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
            fails: {failCount}
          </span>
          <span className="font-mono text-[10px]" style={{ color: retryCount > 1 ? 'var(--accent-yellow)' : 'var(--text-muted)' }}>
            retries: {retryCount}
          </span>
          <span className="hidden lg:inline font-mono text-[10px] text-[var(--text-muted)]">lines: {logs.length}</span>
        </div>
        <div className="flex gap-3 items-center">
          <span className="hidden lg:inline font-mono text-[10px] text-[var(--text-muted)]">workers: 2 · Playwright v1.48</span>
          <a
            data-testid="playwright-report-link"
            href="https://github.com/huuvy0109/portfolio/actions"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] transition-colors duration-200"
            style={{ color: 'var(--accent-green)', textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
            onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}
          >
            CI Report →
          </a>
        </div>
      </div>
    </div>
  )
}
