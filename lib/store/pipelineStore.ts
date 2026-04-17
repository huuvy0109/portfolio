'use client'

import { create } from 'zustand'
import { nowTimestamp, randomDelay } from '@/lib/hooks/useRandomDelay'

export type PipelinePhase =
  | 'idle'
  | 'ba-analyzing'
  | 'ready-for-dev'
  | 'qc-generating'
  | 'ci-running'
  | 'quality-gate'
  | 'completed'
  | 'rejected'

export type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'system' | 'agent'
export type RunMode  = 'v1-broken' | 'v2-fixed'

export interface LogLine {
  id: number
  timestamp: string
  worker: string
  level: LogLevel
  msg: string
}

export interface AuditEntry {
  at: string
  action: string
  phase: PipelinePhase
}

export interface RunSnapshot {
  runId: number
  timestamp: string
  runMode: RunMode
  phase: PipelinePhase
  failCount: number
  retryCount: number
  isFlaky: boolean
  decision: 'override' | 'reject' | null
}

interface PipelineStore {
  phase: PipelinePhase
  failCount: number
  retryCount: number
  isFlaky: boolean
  decision: 'override' | 'reject' | null
  logs: LogLine[]
  auditLog: AuditEntry[]
  runId: number
  runMode: RunMode
  runHistory: RunSnapshot[]

  trigger: () => void
  reset: () => void
  makeDecision: (d: 'override' | 'reject') => void
  saveSnapshot: () => void
}

let logCounter = 0

function mkLog(worker: string, level: LogLevel, msg: string): LogLine {
  return { id: ++logCounter, timestamp: nowTimestamp(), worker, level, msg }
}

export const usePipelineStore = create<PipelineStore>((set, get) => ({
  phase: 'idle',
  failCount: 0,
  retryCount: 0,
  isFlaky: false,
  decision: null,
  logs: [],
  auditLog: [],
  runId: 0,
  runMode: 'v1-broken',
  runHistory: [],

  saveSnapshot: () => {
    const { runId, runMode, phase, failCount, retryCount, isFlaky, decision, runHistory } = get()
    if (runId === 0) return
    const snap: RunSnapshot = { runId, timestamp: nowTimestamp(), runMode, phase, failCount, retryCount, isFlaky, decision }
    const updated = [snap, ...runHistory].slice(0, 5)
    set({ runHistory: updated })
  },

  reset: () => {
    get().saveSnapshot()
    const nextRunId = get().runId + 1
    const nextMode: RunMode = get().runHistory.length >= 1 ? 'v2-fixed' : 'v1-broken'
    set({
      phase: 'idle', failCount: 0, retryCount: 0, isFlaky: false,
      decision: null, logs: [], auditLog: [],
      runId: nextRunId, runMode: nextMode,
    })
  },

  makeDecision: (d) => {
    const { phase, auditLog, runId } = get()
    if (phase !== 'quality-gate') return

    const entry: AuditEntry = {
      at: nowTimestamp(),
      action: d === 'override' ? 'Risk Accepted — Human Override' : 'Rejected — Agent Retrain Queued',
      phase: d === 'override' ? 'completed' : 'rejected',
    }
    const decisionLog = mkLog('human', 'system',
      d === 'override'
        ? '🔴 DECISION: Override accepted. Risk acknowledged by human. Pipeline resumed.'
        : '🔄 DECISION: Rejected. Agent QC queued for retrain. Cards returned to QC column.'
    )
    set({ decision: d, phase: d === 'override' ? 'completed' : 'rejected', auditLog: [...auditLog, entry], logs: [...get().logs, decisionLog] })

    if (d === 'override') {
      const currentRun = runId
      setTimeout(() => {
        if (get().runId !== currentRun) return
        set(s => ({ logs: [...s.logs, mkLog('system', 'success', '✓ Pipeline completed with accepted risk. Build deployed.')] }))
        get().saveSnapshot()
      }, 1500)
    } else {
      setTimeout(() => get().saveSnapshot(), 300)
    }
  },

  trigger: () => {
    const { runMode } = get()
    const currentRun = get().runId + 1
    set({ phase: 'ba-analyzing', failCount: 0, retryCount: 0, isFlaky: false, decision: null, logs: [], auditLog: [], runId: currentRun })

    const push = (delay: number, worker: string, level: LogLevel, msg: string) => {
      setTimeout(() => {
        if (get().runId !== currentRun) return
        set(s => ({ logs: [...s.logs, mkLog(worker, level, msg)] }))
      }, delay)
    }

    const advance = (delay: number, phase: PipelinePhase, extraLog?: { w: string; l: LogLevel; m: string }) => {
      setTimeout(() => {
        if (get().runId !== currentRun) return
        set({ phase })
        if (extraLog) set(s => ({ logs: [...s.logs, mkLog(extraLog.w, extraLog.l, extraLog.m)] }))
      }, delay)
    }

    // ── Shared phases 1–3 ───────────────────────────
    push(200,  'agent-ba', 'agent',   '▶ Agent BA initializing — reading requirement doc...')
    push(900,  'agent-ba', 'info',    '  ✓ Parsed: US-001 "Hero Section renders with correct heading"')
    push(1500, 'agent-ba', 'info',    '  ✓ Parsed: US-002 "Pipeline Board transitions between phases"')
    push(2200, 'agent-ba', 'success', '  ✓ Acceptance Criteria generated for 2 user stories')
    advance(2800, 'ready-for-dev', { w: 'system', l: 'system', m: '━━━ Phase: READY FOR DEV ━━━' })
    push(3200, 'agent-ba', 'info',    '  → Cards US-001, US-002 moved to Ready for Dev')
    advance(4500, 'qc-generating', { w: 'system', l: 'system', m: '━━━ Phase: QC GENERATING ━━━' })
    push(4800, 'agent-qc', 'agent',   '▶ Agent QC: Generating test scripts from Acceptance Criteria...')
    push(5400, 'agent-qc', 'info',    '  ✓ hero.spec.ts generated (3 assertions)')

    if (runMode === 'v1-broken') {
      // ── v1: AI wrong locator ──
      push(6000, 'agent-qc', 'warn',    '  ⚠ pipeline.spec.ts — locator auto-generated: [data-testid="card-ba-analyzing"]')
      push(6400, 'agent-qc', 'info',    '    Note: Locator accuracy depends on runtime DOM state')
      push(6900, 'agent-qc', 'success', '  ✓ Scripts ready. Handing off to CI runner.')
      advance(7500, 'ci-running', { w: 'system', l: 'system', m: '━━━ Phase: CI RUNNING ━━━' })
      push(7800, 'worker-1', 'info',    '▶ Running 2 tests using 2 workers')
      push(8100, 'worker-1', 'info',    '  [worker-1] hero.spec.ts › renders correctly')
      push(8600, 'worker-1', 'info',    '    ✓ Browser launched: chromium')
      push(9000, 'worker-1', 'info',    '    ✓ Navigated to http://localhost:3000')
      push(9300, 'worker-1', 'info',    '    ✓ Assertion: h1 text matches "HUU VY"')
      push(9600, 'worker-1', 'info',    '    ✓ Assertion: CTA button visible and clickable')
      push(9900, 'worker-1', 'success', '  ✓ PASS (1.8s) — hero.spec.ts')
      push(10200, 'worker-2', 'info',   '  [worker-2] pipeline.spec.ts › Pipeline Board › state transitions')
      push(10600, 'worker-2', 'info',   '    ✓ Board rendered with 4 columns')
      push(11100, 'worker-2', 'warn',   '    ⚠ locator not found: [data-testid="card-ba-analyzing"]')
      push(11200, 'worker-2', 'warn',   '      → Element may not be in DOM yet (async state update)')
      setTimeout(() => { if (get().runId !== currentRun) return; set(s => ({ retryCount: s.retryCount + 1 })) }, 11500)
      push(11500, 'worker-2', 'info',   '    ↺ Retry #1 — waiting 1000ms...')
      push(12600, 'worker-2', 'warn',   '    ⚠ locator still not found: [data-testid="card-ba-analyzing"]')
      setTimeout(() => { if (get().runId !== currentRun) return; set(s => ({ retryCount: s.retryCount + 1, isFlaky: true })) }, 13000)
      push(13000, 'worker-2', 'warn',   '    ↺ Retry #2 — waiting 2000ms...')
      push(13200, 'worker-2', 'warn',   '    ⚠ FLAKY DETECTED — retryCount exceeded threshold (> 1)')
      push(14500, 'worker-2', 'error',  '    ✗ Timeout 3000ms exceeded waiting for locator')
      push(14700, 'worker-2', 'error',  '      at pipeline.spec.ts:42:18')
      push(14900, 'worker-2', 'error',  '        await page.click(\'[data-testid="card-ba-analyzing"]\')')
      push(15100, 'worker-2', 'error',  '  ✗ FAIL (3.3s) — pipeline.spec.ts | retryCount: 2')
      setTimeout(() => {
        if (get().runId !== currentRun) return
        set(s => ({ failCount: s.failCount + 1, phase: 'quality-gate' }))
        set(s => ({ logs: [...s.logs, mkLog('system', 'error', '⛔ failCount: 1 | QUALITY GATE TRIGGERED — Pipeline blocked')] }))
      }, 15400 + randomDelay(0, 300))

    } else {
      // ── v2: Agent QC fixed locator ──
      push(6000, 'agent-qc', 'success', '  ✓ pipeline.spec.ts — locator fixed: [data-testid="card-US-002"] ← AI Agent corrected')
      push(6400, 'agent-qc', 'info',    '    Locator now targets card by ID, not by column phase')
      push(6900, 'agent-qc', 'success', '  ✓ Scripts ready. Handing off to CI runner.')
      advance(7500, 'ci-running', { w: 'system', l: 'system', m: '━━━ Phase: CI RUNNING (v2 — Fixed) ━━━' })
      push(7800, 'worker-1', 'info',    '▶ Running 2 tests using 2 workers')
      push(8100, 'worker-1', 'info',    '  [worker-1] hero.spec.ts › renders correctly')
      push(8600, 'worker-1', 'info',    '    ✓ Browser launched: chromium')
      push(9000, 'worker-1', 'success', '  ✓ PASS (1.6s) — hero.spec.ts')
      push(9300, 'worker-2', 'info',    '  [worker-2] pipeline.spec.ts › Pipeline Board › state transitions')
      push(9700, 'worker-2', 'info',    '    ✓ Board rendered with 4 columns')
      push(10100, 'worker-2', 'info',   '    ✓ Locator found: [data-testid="card-US-002"]')
      push(10500, 'worker-2', 'info',   '    ✓ Card visible in ba-analyzing column')
      push(10900, 'worker-2', 'success','  ✓ PASS (1.6s) — pipeline.spec.ts')
      push(11200, 'worker-1', 'success','▶ 2 passed (3.2s) — 0 failed | 0 retries')
      setTimeout(() => {
        if (get().runId !== currentRun) return
        set({ phase: 'completed' })
        set(s => ({ logs: [...s.logs, mkLog('system', 'success', '✓ All tests passed. Pipeline completed successfully.')] }))
        setTimeout(() => get().saveSnapshot(), 400)
      }, 11800)
    }
  },
}))
