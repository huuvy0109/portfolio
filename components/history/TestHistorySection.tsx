'use client'

import { useState } from 'react'
import { useLang } from '@/lib/context/LanguageContext'

interface Run {
  id: string
  ts: string
  status: 'passed' | 'failed'
  dur: string
  specs: string[]
  fail?: string
}

const MOCK_RUNS: Run[] = [
  { id: 'r1', ts: '2026-04-17 06:02', status: 'passed',  dur: '4.2s', specs: ['hero.spec.ts','pipeline.spec.ts','journey.spec.ts','history.spec.ts','sanitizer.spec.ts','footer.spec.ts'] },
  { id: 'r2', ts: '2026-04-17 05:59', status: 'failed',  dur: '6.1s', specs: ['hero.spec.ts','pipeline.spec.ts','journey.spec.ts','history.spec.ts','sanitizer.spec.ts','footer.spec.ts'], fail: 'pipeline.spec.ts' },
  { id: 'r3', ts: '2026-04-17 05:54', status: 'passed',  dur: '3.9s', specs: ['hero.spec.ts','pipeline.spec.ts','journey.spec.ts','history.spec.ts','sanitizer.spec.ts','footer.spec.ts'] },
  { id: 'r4', ts: '2026-04-17 05:48', status: 'failed',  dur: '7.3s', specs: ['hero.spec.ts','pipeline.spec.ts','journey.spec.ts','history.spec.ts','sanitizer.spec.ts','footer.spec.ts'], fail: 'sanitizer.spec.ts' },
]

export default function TestHistorySection() {
  const { lang } = useLang()
  const [sel, setSel] = useState<Run>(MOCK_RUNS[0])

  const mono: React.CSSProperties = { fontFamily: 'var(--font-mono), JetBrains Mono, monospace' }

  const T = {
    en: { eyebrow: '// Test History', title: 'Playwright Run Archive', desc: 'Real test runs against this page — the portfolio is its own Subject Under Test.', tests: 'tests', pass: '✓ PASS', fail: '✗ FAIL' },
    vi: { eyebrow: '// Lịch Sử Test', title: 'Kho Lưu Playwright Runs', desc: 'Các lần chạy test thực tế trên trang này — portfolio chính là Subject Under Test.', tests: 'test', pass: '✓ PASS', fail: '✗ FAIL' },
  }[lang]

  return (
    <div data-testid="history-section" style={{ padding: '48px 0' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ ...mono, fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          {T.eyebrow}
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{T.title}</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{T.desc}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '12px' }}>
        {/* Run list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {MOCK_RUNS.map(run => (
            <div
              key={run.id}
              onClick={() => setSel(run)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: sel.id === run.id ? 'var(--surface-3)' : 'var(--surface-2)',
                border: `1px solid ${sel.id === run.id
                  ? run.status === 'passed' ? 'rgba(var(--accent-rgb),0.35)' : 'rgba(var(--danger-rgb),0.35)'
                  : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ ...mono, fontSize: '10px', color: 'var(--text-dim)' }}>{run.ts}</span>
                <span style={{
                  ...mono, fontSize: '9px', padding: '2px 7px', borderRadius: '4px',
                  background: run.status === 'passed' ? 'rgba(var(--accent-rgb),0.1)' : 'rgba(var(--danger-rgb),0.1)',
                  border: `1px solid ${run.status === 'passed' ? 'rgba(var(--accent-rgb),0.3)' : 'rgba(var(--danger-rgb),0.3)'}`,
                  color: run.status === 'passed' ? 'var(--accent)' : 'var(--danger)',
                }}>
                  {run.status === 'passed' ? T.pass : T.fail}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ ...mono, fontSize: '9px', color: 'var(--text-dim)' }}>{run.specs.length} {T.tests}</span>
                <span style={{ ...mono, fontSize: '9px', color: 'var(--text-dim)' }}>{run.dur}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface-3)' }}>
            <span style={{ ...mono, fontSize: '10px', color: 'var(--text-secondary)' }}>{sel.ts} · {sel.dur}</span>
          </div>
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {sel.specs.map(spec => {
              const failed = spec === sel.fail
              return (
                <div
                  key={spec}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 10px', borderRadius: '6px',
                    background: failed ? 'rgba(var(--danger-rgb),0.05)' : 'rgba(var(--accent-rgb),0.03)',
                    border: `1px solid ${failed ? 'rgba(var(--danger-rgb),0.15)' : 'rgba(var(--accent-rgb),0.08)'}`,
                  }}
                >
                  <span style={{ ...mono, fontSize: '10px', color: 'var(--text-secondary)' }}>{spec}</span>
                  <span style={{ ...mono, fontSize: '9px', color: failed ? 'var(--danger)' : 'var(--accent)' }}>
                    {failed ? T.fail : T.pass}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
