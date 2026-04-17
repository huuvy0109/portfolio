'use client'

import HeroSection from '@/components/hero/HeroSection'
import PipelineBoard from '@/components/pipeline-board/PipelineBoard'
import TerminalUI from '@/components/terminal/TerminalUI'
import QualityGate from '@/components/quality-gate/QualityGate'
import SanitizerVisualizer from '@/components/sanitizer/SanitizerVisualizer'
import HistoryLog from '@/components/history/HistoryLog'
import TestHistorySection from '@/components/history/TestHistorySection'
import PipelineErrorBoundary from '@/components/pipeline-board/PipelineErrorBoundary'
import JourneySection from '@/components/journey/JourneySection'
import { usePipelineStore } from '@/lib/store/pipelineStore'

function PipelineSection() {
  const { trigger, phase, runMode } = usePipelineStore()

  return (
    <section id="pipeline" className="py-20 px-4 max-w-7xl mx-auto w-full">
      {/* Section header */}
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="font-mono text-[10px] text-[var(--accent-green)] uppercase tracking-widest mb-2">
            // META-PIPELINE
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            Enterprise QA Pipeline
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-lg">
            This page is the Subject Under Test. Watch a real-time simulation of BA → QC → CI
            with intentional failures and human override.
          </p>
        </div>

        {/* Legend */}
        <div
          className="flex flex-col gap-1.5 p-3 rounded-lg shrink-0"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-1">
            How to read
          </div>
          {[
            { color: 'var(--accent-green)',  label: 'Active / Pass' },
            { color: 'var(--accent-yellow)', label: '⚠ Flaky (retry > 1)' },
            { color: 'var(--accent-red)',    label: '⛔ Blocked (fail > 0)' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
              <span className="font-mono text-[10px] text-[var(--text-secondary)]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Board + Terminal — wrapped in error boundary */}
      <PipelineErrorBoundary>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <PipelineBoard />
          <TerminalUI />
        </div>
      </PipelineErrorBoundary>

      {/* Quality Gate */}
      <QualityGate />

      {/* Re-trigger */}
      {phase !== 'idle' && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => { usePipelineStore.getState().reset(); setTimeout(() => trigger(), 100) }}
            className="font-mono text-xs px-4 py-2 rounded-lg transition-all duration-200"
            style={{ border: '1px solid var(--border-dim)', color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-green)'; e.currentTarget.style.borderColor = 'rgba(0,255,157,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-dim)' }}
          >
            ↺ Simulate Again {runMode === 'v2-fixed' ? '(v2 — AI Fixed)' : ''}
          </button>
        </div>
      )}
    </section>
  )
}


function Footer() {
  return (
    <footer
      data-testid="footer"
      className="py-8 px-4 text-center border-t"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <p className="font-mono text-xs text-[var(--text-muted)]">
        Vy Quang Huu · QC Engineer · huuvy0109@gmail.com ·{' '}
        <a
          href="https://linkedin.com/in/huuvy0109"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}
          onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
          onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}
        >
          LinkedIn ↗
        </a>
      </p>
      <p className="font-mono text-[10px] text-[var(--text-muted)] mt-1 opacity-50">
        Built with Next.js · TypeScript · Tailwind · Playwright · <span style={{ color: 'var(--accent-green)' }}>this page is the SUT</span>
      </p>
    </footer>
  )
}

export default function Home() {
  return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <HeroSection />

      <div className="flex flex-col items-center">
        <PipelineSection />
        <HistoryLog />
        <TestHistorySection />
        <SanitizerVisualizer />
        <JourneySection />
      </div>

      <Footer />
    </main>
  )
}
