'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DataField {
  label: string
  raw: string
  masked: string
  type: 'email' | 'token' | 'phone' | 'name'
}

const MOCK_FIELDS: DataField[] = [
  { label: 'reporter_email', raw: 'john.doe@client.com',      masked: '[REDACTED:email]',   type: 'email' },
  { label: 'auth_token',     raw: 'eyJhbGciOiJSUzI1NiJ9...', masked: '[REDACTED:token]',   type: 'token' },
  { label: 'phone_number',   raw: '+84 091 234 5678',         masked: '[REDACTED:phone]',   type: 'phone' },
  { label: 'tester_name',    raw: 'Nguyen Van A',             masked: '[REDACTED:pii]',     type: 'name'  },
]

const TYPE_COLOR: Record<DataField['type'], string> = {
  email: 'var(--accent-blue)',
  token: 'var(--accent-red)',
  phone: 'var(--accent-yellow)',
  name:  'var(--accent-purple)',
}

export default function SanitizerVisualizer() {
  const [maskedCount, setMaskedCount] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [done, setDone] = useState(false)

  const runScan = () => {
    setMaskedCount(0)
    setDone(false)
    setScanning(true)

    MOCK_FIELDS.forEach((_, i) => {
      setTimeout(() => {
        setMaskedCount(i + 1)
        if (i === MOCK_FIELDS.length - 1) {
          setScanning(false)
          setDone(true)
        }
      }, 600 * (i + 1))
    })
  }

  useEffect(() => { runScan() }, [])

  return (
    <section id="sanitizer" className="py-20 px-4 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="font-mono text-[10px] text-[var(--accent-green)] uppercase tracking-widest mb-2">
          // SANITIZER VISUALIZER
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
              Data Sanitization Pipeline
            </h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-lg">
              External project reports are scanned before display. PII and credentials
              are automatically masked — no raw data is ever exposed.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="font-mono text-[10px] px-2.5 py-1 rounded"
              style={{ background: 'rgba(0,255,157,0.07)', border: '1px solid rgba(0,255,157,0.25)', color: 'var(--accent-green)' }}
            >
              NDA Protected
            </span>
            <span
              className="font-mono text-[10px] px-2.5 py-1 rounded"
              style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.25)', color: 'var(--accent-blue)' }}
            >
              OWASP Compliant
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Before panel */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--accent-red)]" />
              <span className="font-mono text-xs text-[var(--text-secondary)]">raw_report.json — UNSAFE</span>
            </div>
            <span className="font-mono text-[10px] text-[var(--accent-red)]">⚠ CONTAINS PII</span>
          </div>
          <div className="p-4 space-y-2.5 font-mono text-xs">
            {MOCK_FIELDS.map((field) => (
              <div key={field.label} className="flex gap-3">
                <span className="text-[var(--text-muted)] shrink-0 w-32">{field.label}:</span>
                <span style={{ color: TYPE_COLOR[field.type] }}>&quot;{field.raw}&quot;</span>
              </div>
            ))}
          </div>
        </div>

        {/* After panel */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}
          >
            <div className="flex items-center gap-2">
              {scanning && (
                <div
                  className="w-2 h-2 rounded-full bg-[var(--accent-yellow)]"
                  style={{ animation: 'pulse-glow 0.8s ease-in-out infinite' }}
                />
              )}
              {done && <div className="w-2 h-2 rounded-full bg-[var(--accent-green)]" />}
              <span className="font-mono text-xs text-[var(--text-secondary)]">
                sanitized_report.json — {scanning ? 'SCANNING...' : 'SAFE'}
              </span>
            </div>
            {done && (
              <span className="font-mono text-[10px] text-[var(--accent-green)]">✓ {maskedCount} fields masked</span>
            )}
          </div>

          <div className="p-4 space-y-2.5 font-mono text-xs">
            {MOCK_FIELDS.map((field, i) => {
              const isRedacted = i < maskedCount
              return (
                <div key={field.label} className="flex gap-3">
                  <span className="text-[var(--text-muted)] shrink-0 w-32">{field.label}:</span>
                  <AnimatePresence mode="wait">
                    {isRedacted ? (
                      <motion.span
                        key="masked"
                        initial={{ opacity: 0, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 0.3 }}
                        style={{ color: 'var(--accent-green)' }}
                      >
                        &quot;{field.masked}&quot;
                      </motion.span>
                    ) : (
                      <motion.span
                        key="raw"
                        exit={{ opacity: 0 }}
                        style={{ color: TYPE_COLOR[field.type] }}
                      >
                        &quot;{field.raw}&quot;
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Agent log */}
      <div
        className="mt-4 rounded-lg px-4 py-3 font-mono text-xs"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[var(--text-muted)] uppercase tracking-widest text-[10px]">Agent Sanitizer Log</span>
          <button
            onClick={runScan}
            className="text-[10px] px-2.5 py-1 rounded transition-all duration-200"
            style={{ border: '1px solid var(--border-dim)', color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-green)'; e.currentTarget.style.borderColor = 'rgba(0,255,157,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-dim)' }}
          >
            ↺ Re-scan
          </button>
        </div>
        <div className="space-y-0.5">
          {Array.from({ length: maskedCount }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3 text-[11px]"
            >
              <span className="text-[var(--text-muted)]">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
              <span className="text-[var(--accent-green)]">
                ✓ Masked field &quot;{MOCK_FIELDS[i].label}&quot; → {MOCK_FIELDS[i].masked}
              </span>
            </motion.div>
          ))}
          {done && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 text-[11px] mt-1"
            >
              <span className="text-[var(--text-muted)]">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
              <span style={{ color: 'var(--accent-blue)' }}>
                ✓ Sanitization complete. Report cleared for display.
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
