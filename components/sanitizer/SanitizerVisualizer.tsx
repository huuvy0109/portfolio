'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/lib/context/LanguageContext'

interface DataField {
  label: string
  raw: string
  masked: string
  type: 'email' | 'token' | 'phone' | 'name'
  accent: string
}

const FIELDS: DataField[] = [
  { label: 'reporter_email', raw: 'john.doe@client.com',      masked: '[REDACTED:email]', type: 'email', accent: 'accent3'  },
  { label: 'auth_token',     raw: 'eyJhbGciOiJSUzI1NiJ9...', masked: '[REDACTED:token]', type: 'token', accent: 'danger'   },
  { label: 'phone_number',   raw: '+84 091 234 5678',         masked: '[REDACTED:phone]', type: 'phone', accent: 'warn'     },
  { label: 'tester_name',    raw: 'Nguyen Van A',             masked: '[REDACTED:pii]',   type: 'name',  accent: 'accent2'  },
]

export default function SanitizerVisualizer() {
  const { lang } = useLang()
  const [count, setCount] = useState(0)
  const [scanning, setScanning] = useState(false)

  const mono: React.CSSProperties = { fontFamily: 'var(--font-mono), JetBrains Mono, monospace' }

  const T = {
    en: { eyebrow: '// Sanitizer', title: 'Data Sanitization Pipeline', desc: 'PII masking before test reports are published — no sensitive data in artifacts.', scanning: 'Scanning...', done: 'fields redacted', ready: 'Ready', rescan: '↺ Re-scan' },
    vi: { eyebrow: '// Sanitizer', title: 'Pipeline Làm Sạch Dữ Liệu', desc: 'Che giấu PII trước khi xuất báo cáo test — không có dữ liệu nhạy cảm trong artifacts.', scanning: 'Đang quét...', done: 'trường đã ẩn', ready: 'Sẵn sàng', rescan: '↺ Quét Lại' },
  }[lang]

  const run = () => {
    setCount(0)
    setScanning(true)
    FIELDS.forEach((_, i) => {
      setTimeout(() => {
        setCount(i + 1)
        if (i === FIELDS.length - 1) setScanning(false)
      }, 600 * (i + 1))
    })
  }

  useEffect(() => { run() }, [])

  return (
    <div data-testid="sanitizer-section" style={{ padding: '48px 0' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ ...mono, fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          {T.eyebrow}
        </div>
        <h2 data-testid="sanitizer-heading" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {T.title}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{T.desc}</p>
      </div>

      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface-3)',
        }}>
          <span style={{ ...mono, fontSize: '10px', color: 'var(--text-dim)' }}>
            {scanning
              ? `${T.scanning} ${count}/${FIELDS.length}`
              : count === FIELDS.length
                ? `✓ ${count} ${T.done}`
                : T.ready}
          </span>
          <button
            data-testid="btn-rescan"
            onClick={run}
            style={{
              ...mono, fontSize: '10px', padding: '4px 10px', borderRadius: '5px', cursor: 'pointer',
              border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-dim)',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            {T.rescan}
          </button>
        </div>

        {/* Fields */}
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {FIELDS.map((f, i) => {
            const masked = i < count
            const color = `var(--${f.accent})`
            return (
              <div
                key={f.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '9px 12px', borderRadius: '6px',
                  background: masked ? 'rgba(0,0,0,0.15)' : 'var(--surface-3)',
                  border: '1px solid var(--border)',
                  transition: 'all 0.3s',
                }}
              >
                <span style={{ ...mono, fontSize: '10px', color, width: '80px', flexShrink: 0 }}>{f.type}</span>
                <span style={{ ...mono, fontSize: '10px', color: 'var(--text-dim)', flex: 1 }}>{f.label}</span>
                <span style={{ ...mono, fontSize: '10px', color: masked ? color : 'var(--text-secondary)', flex: 1, textAlign: 'right' }}>
                  {masked ? f.masked : f.raw}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
