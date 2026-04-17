'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePipelineStore, type LogLevel } from '@/lib/store/pipelineStore'

const levelStyle: Record<LogLevel, { color: string; prefix: string }> = {
  info:    { color: 'var(--text-secondary)', prefix: '' },
  success: { color: 'var(--accent-green)',  prefix: '' },
  warn:    { color: 'var(--accent-yellow)', prefix: '' },
  error:   { color: 'var(--accent-red)',    prefix: '' },
  system:  { color: 'var(--accent-blue)',   prefix: '' },
  agent:   { color: 'var(--accent-purple)', prefix: '' },
}

export default function TerminalUI() {
  const { logs, phase, runId, retryCount, failCount } = usePipelineStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const isRunning = phase !== 'idle' && phase !== 'completed' && phase !== 'rejected'

  return (
    <div
      className="rounded-xl flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Header */}
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
          {isRunning && (
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]"
                style={{ animation: 'pulse-glow 1s ease-in-out infinite' }}
              />
              <span className="font-mono text-[10px] text-[var(--accent-green)]">RUNNING</span>
            </div>
          )}
          {phase === 'quality-gate' && (
            <span className="font-mono text-[10px] text-[var(--accent-red)]">⛔ GATE</span>
          )}
          {phase === 'completed' && (
            <span className="font-mono text-[10px] text-[var(--accent-green)]">✓ DONE</span>
          )}
          {phase === 'idle' && (
            <span className="font-mono text-[10px] text-[var(--text-muted)]">IDLE</span>
          )}
        </div>
      </div>

      {/* Log area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-0.5 min-h-[280px] max-h-[360px]"
        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
      >
        {phase === 'idle' && (
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs py-8 justify-center">
            <span>Waiting for pipeline trigger</span>
            <span className="cursor-blink" />
          </div>
        )}

        <AnimatePresence initial={false}>
          {logs.map((line) => {
            const style = levelStyle[line.level]
            return (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="flex gap-3 text-[11px] leading-5 font-mono"
              >
                <span className="shrink-0 text-[var(--text-muted)] select-none">{line.timestamp}</span>
                <span
                  className="shrink-0 select-none text-[10px]"
                  style={{ color: 'var(--text-muted)', minWidth: '60px' }}
                >
                  {line.worker}
                </span>
                <span style={{ color: style.color, wordBreak: 'break-word' }}>{line.msg}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {isRunning && logs.length > 0 && (
          <div className="flex gap-3 text-[11px] font-mono mt-1">
            <span className="text-[var(--text-muted)]">{new Date().toLocaleTimeString('en-US',{hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>
            <span className="text-[var(--text-muted)] text-[10px]" style={{ minWidth: '60px' }}>system</span>
            <span className="text-[var(--text-muted)] cursor-blink">processing</span>
          </div>
        )}
      </div>

      {/* Footer stats */}
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
          <span className="font-mono text-[10px] text-[var(--text-muted)]">
            lines: {logs.length}
          </span>
        </div>

        <div className="flex gap-4 items-center">
          <span className="font-mono text-[10px] text-[var(--text-muted)]">
            workers: 2 · Playwright v1.48
          </span>
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
            View CI Report →
          </a>
        </div>
      </div>
    </div>
  )
}
