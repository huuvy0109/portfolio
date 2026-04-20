'use client'

import { useRef, useEffect } from 'react'
import { usePipelineStore } from '@/lib/store/pipelineStore'
import { useLang } from '@/lib/context/LanguageContext'
import type { LogLevel } from '@/lib/store/pipelineStore'

const LEVEL_COLOR: Record<LogLevel, string> = {
  info:    'var(--text-dim)',
  success: 'var(--accent)',
  warn:    'var(--warn)',
  error:   'var(--danger)',
  system:  'var(--text-secondary)',
  agent:   'var(--accent2)',
}

const COLUMNS = {
  en: [
    { id: 'ba-analyzing',  label: 'BA Analyzing',  short: 'BA'  },
    { id: 'ready-for-dev', label: 'Ready for Dev', short: 'DEV' },
    { id: 'qc-generating', label: 'QC Generating', short: 'QC'  },
    { id: 'ci-running',    label: 'CI Running',    short: 'CI'  },
  ],
  vi: [
    { id: 'ba-analyzing',  label: 'BA Phân Tích',  short: 'BA'  },
    { id: 'ready-for-dev', label: 'Sẵn Sàng Dev',  short: 'DEV' },
    { id: 'qc-generating', label: 'QC Sinh Test',   short: 'QC'  },
    { id: 'ci-running',    label: 'CI Đang Chạy',   short: 'CI'  },
  ],
}

function cardColumn(cardId: string, phase: string, decision: string | null): string | null {
  if (phase === 'idle') return null
  if (cardId === 'US-001') return ['ba-analyzing'].includes(phase) ? 'ba-analyzing' : 'ci-running'
  if (phase === 'ba-analyzing') return 'ba-analyzing'
  if (phase === 'ready-for-dev') return 'ready-for-dev'
  if (phase === 'qc-generating') return 'qc-generating'
  if (['ci-running', 'quality-gate'].includes(phase)) return 'ci-running'
  if (phase === 'completed' && decision === 'override') return 'ci-running'
  if (phase === 'rejected') return 'qc-generating'
  return 'ci-running'
}

export default function PipelineSection() {
  const { phase, logs, failCount, retryCount, isFlaky, decision, trigger, makeDecision, reset, runMode } = usePipelineStore()
  const { lang } = useLang()
  const termRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
  }, [logs])

  const mono: React.CSSProperties = { fontFamily: 'var(--font-mono), JetBrains Mono, monospace' }

  const t = {
    en: {
      eyebrow: '// meta-pipeline',
      title: 'Enterprise QA Pipeline',
      desc: 'This page is the Subject Under Test. Watch a live simulation of BA → QC → CI with intentional failures and human override.',
      run: '▶ Run Pipeline',
      again: '↺ Run Again',
      await: '$ awaiting pipeline trigger...',
      running: 'RUNNING',
      done: '✓ DONE',
      retrain: '↩ RETRAIN',
      gate_title: 'Quality Gate — Human Decision Required',
      override_btn: '⚠ Override — merge anyway',
      reject_btn: '↩ Reject — retrain',
      override_done: 'Merged to staging with override flag · monitoring for regression',
      reject_done: 'Rollback initiated · ticket QC-89 created for v2 fix',
      fail_label: 'fail',
      retry_label: 'retries',
      threshold: 'threshold exceeded',
      override_auth: '⚠ Override Authorized',
      build_rejected: '↩ Build Rejected',
    },
    vi: {
      eyebrow: '// meta-pipeline',
      title: 'Pipeline QA Doanh Nghiệp',
      desc: 'Trang này chính là Subject Under Test. Xem mô phỏng BA → QC → CI với lỗi có chủ ý và override thủ công.',
      run: '▶ Chạy Pipeline',
      again: '↺ Chạy Lại',
      await: '$ đang chờ kích hoạt pipeline...',
      running: 'ĐANG CHẠY',
      done: '✓ XONG',
      retrain: '↩ RETRAIN',
      gate_title: 'Quality Gate — Cần Quyết Định Thủ Công',
      override_btn: '⚠ Override — merge luôn',
      reject_btn: '↩ Từ Chối — retrain',
      override_done: 'Merge lên staging với cờ override · đang theo dõi regression',
      reject_done: 'Rollback đã khởi động · ticket QC-89 đã tạo cho bản fix v2',
      fail_label: 'lỗi',
      retry_label: 'retry',
      threshold: 'vượt ngưỡng cho phép',
      override_auth: '⚠ Override Đã Được Phê Duyệt',
      build_rejected: '↩ Build Bị Từ Chối',
    },
  }[lang]

  const cols = COLUMNS[lang]
  const isIdle = phase === 'idle'
  const isDone = ['completed', 'rejected'].includes(phase)
  const isGate = ['quality-gate', 'completed', 'rejected'].includes(phase) && failCount > 0
  const decided = phase !== 'quality-gate'
  const isRunning = !['idle', 'completed', 'rejected'].includes(phase)

  const cards = [
    { id: 'US-001', title: lang === 'vi' ? 'Hero renders đúng' : 'Hero renders correctly', file: 'hero.spec.ts' },
    { id: 'US-002', title: lang === 'vi' ? 'Chuyển trạng thái Pipeline Board' : 'Pipeline state transitions', file: 'pipeline.spec.ts' },
  ]

  const statusLabel = isRunning ? t.running : phase === 'completed' ? t.done : phase === 'rejected' ? t.retrain : null

  return (
    <div style={{ padding: '48px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ ...mono, fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          {t.eyebrow}
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {t.title}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.6 }}>
          {t.desc}
        </p>
      </div>

      {/* Run / Reset buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {isIdle && (
          <button
            data-testid="btn-run-pipeline-section"
            onClick={() => trigger()}
            style={{
              ...mono, fontSize: '12px', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer',
              border: '1px solid rgba(var(--accent-rgb),0.4)', background: 'rgba(var(--accent-rgb),0.08)', color: 'var(--accent)',
            }}
          >
            {t.run}
          </button>
        )}
        {isDone && (
          <button
            onClick={() => { reset(); setTimeout(() => trigger(), 100) }}
            style={{
              ...mono, fontSize: '12px', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer',
              border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-dim)',
            }}
          >
            {t.again} {runMode === 'v2-fixed' ? '(v2 — AI Fixed)' : ''}
          </button>
        )}
      </div>

      {/* Board — 4 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '12px' }}>
        {cols.map(col => {
          const colCards = cards.filter(c => cardColumn(c.id, phase, decision) === col.id)
          const isActive = phase === col.id
          return (
            <div
              key={col.id}
              data-testid={`column-${col.id}`}
              style={{
                background: isActive ? 'rgba(var(--accent-rgb),0.05)' : 'var(--surface-2)',
                border: `1px solid ${isActive ? 'rgba(var(--accent-rgb),0.25)' : 'var(--border)'}`,
                borderRadius: '8px',
                padding: '12px',
                minHeight: '130px',
                transition: 'all 0.3s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                {isActive && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulseDot 1.5s ease infinite' }} />
                )}
                <span style={{ ...mono, fontSize: '9px', color: isActive ? 'var(--accent)' : 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {col.short}
                </span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '8px', lineHeight: 1.3 }}>
                {col.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {colCards.map(c => {
                  const s = c.id === 'US-002' && phase === 'quality-gate' ? 'blocked'
                    : c.id === 'US-002' && (retryCount > 0 || isFlaky) && phase === 'ci-running' ? 'flaky'
                    : 'ok'
                  return (
                    <div
                      key={c.id}
                      data-testid={`card-${c.id}`}
                      style={{
                        background: s === 'blocked' ? 'rgba(var(--danger-rgb),0.08)' : s === 'flaky' ? 'rgba(var(--warn-rgb),0.08)' : 'var(--surface-3)',
                        border: `1px solid ${s === 'blocked' ? 'rgba(var(--danger-rgb),0.25)' : s === 'flaky' ? 'rgba(var(--warn-rgb),0.2)' : 'var(--border)'}`,
                        borderRadius: '6px',
                        padding: '8px',
                      }}
                    >
                      <div style={{ ...mono, fontSize: '8px', color: 'var(--accent)', marginBottom: '3px' }}>{c.id}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{c.title}</div>
                      <div style={{ marginTop: '5px', ...mono, fontSize: '8px', color: s === 'blocked' ? 'var(--danger)' : s === 'flaky' ? 'var(--warn)' : 'var(--text-dim)' }}>
                        {s === 'blocked' ? `⛔ ${failCount} ${t.fail_label}` : s === 'flaky' ? `⚠ FLAKY ×${retryCount}` : c.file}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Terminal */}
      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            {['#ff5f56', '#ffbd2e', '#27c93f'].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <span style={{ ...mono, fontSize: '10px', color: 'var(--text-dim)' }}>pipeline.log</span>
          {statusLabel && (
            <span style={{ marginLeft: 'auto', ...mono, fontSize: '9px', color: phase === 'quality-gate' || phase === 'rejected' ? 'var(--danger)' : 'var(--accent)' }}>
              {statusLabel}
            </span>
          )}
        </div>
        <div
          ref={termRef}
          style={{ padding: '10px 12px', minHeight: '160px', maxHeight: '200px', overflowY: 'auto', ...mono, fontSize: '11px', lineHeight: 1.7 }}
        >
          {logs.length === 0 ? (
            <span style={{ color: 'var(--text-dim)' }}>{t.await}</span>
          ) : (
            logs.map(l => (
              <div key={l.id}>
                <span style={{ color: 'var(--text-dim)', marginRight: '8px' }}>{l.timestamp}</span>
                <span style={{ color: LEVEL_COLOR[l.level] }}>{l.msg}</span>
              </div>
            ))
          )}
          {isRunning && <span style={{ color: 'var(--accent)', animation: 'blink 1s step-end infinite' }}>▊</span>}
        </div>
      </div>

      {/* Quality Gate */}
      {isGate && (
        <div
          style={{
            marginTop: '14px',
            border: `1px solid ${decided ? (decision === 'override' ? 'rgba(var(--danger-rgb),0.3)' : 'rgba(var(--accent2-rgb),0.3)') : 'rgba(var(--danger-rgb),0.4)'}`,
            background: decided ? 'rgba(var(--danger-rgb),0.03)' : 'rgba(var(--danger-rgb),0.05)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(var(--danger-rgb),0.15)', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!decided && (
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)', animation: 'pulseDot 1s ease infinite' }} />
            )}
            <span style={{ ...mono, fontSize: '11px', fontWeight: 600, color: decided ? (decision === 'override' ? 'var(--danger)' : 'var(--accent2)') : 'var(--danger)' }}>
              {decided ? (decision === 'override' ? t.override_auth : t.build_rejected) : t.gate_title}
            </span>
          </div>
          <div style={{ padding: '12px 14px' }}>
            <div style={{ ...mono, fontSize: '10px', color: 'var(--text-dim)', marginBottom: '10px' }}>
              pipeline.spec.ts · {failCount} {t.fail_label} · {retryCount} {t.retry_label} · {t.threshold}
            </div>
            {!decided ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => makeDecision('override')}
                  style={{ ...mono, fontSize: '11px', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', border: '1px solid rgba(var(--danger-rgb),0.4)', background: 'rgba(var(--danger-rgb),0.08)', color: 'var(--danger)' }}
                >
                  {t.override_btn}
                </button>
                <button
                  onClick={() => makeDecision('reject')}
                  style={{ ...mono, fontSize: '11px', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', border: '1px solid rgba(var(--accent2-rgb),0.4)', background: 'rgba(var(--accent2-rgb),0.06)', color: 'var(--accent2)' }}
                >
                  {t.reject_btn}
                </button>
              </div>
            ) : (
              <div style={{ ...mono, fontSize: '10px', color: 'var(--text-secondary)' }}>
                {decision === 'override' ? t.override_done : t.reject_done}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
