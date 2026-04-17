'use client'

import HeroSection from '@/components/hero/HeroSection'
import PipelineBoard from '@/components/pipeline-board/PipelineBoard'
import TerminalUI from '@/components/terminal/TerminalUI'
import QualityGate from '@/components/quality-gate/QualityGate'
import SanitizerVisualizer from '@/components/sanitizer/SanitizerVisualizer'
import { usePipelineStore } from '@/lib/store/pipelineStore'

function PipelineSection() {
  const { trigger, phase } = usePipelineStore()

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

      {/* Board + Terminal */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <PipelineBoard />
        <TerminalUI />
      </div>

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
            ↺ Simulate Again
          </button>
        </div>
      )}
    </section>
  )
}

function JourneySection() {
  const roles = [
    {
      company: 'Haraworks',
      role: 'QA Lead',
      period: '2022 — Present',
      highlight: 'Team 30–40',
      desc: 'Led quality strategy across multi-team product releases. Established QA processes for 4 product lines, reduced critical bug leakage by 40%.',
      tags: ['Jira', 'Playwright', 'API Testing', 'Risk Management'],
      accent: 'var(--accent-green)',
    },
    {
      company: 'Techland',
      role: 'Senior QA Engineer',
      period: '2020 — 2022',
      highlight: 'AI Pipeline',
      desc: 'Designed and operated multi-agent test automation pipeline. First to introduce AI-generated test scripts in production QA workflow.',
      tags: ['GitHub Actions', 'Python', 'LLM Integration', 'CI/CD'],
      accent: 'var(--accent-blue)',
    },
    {
      company: 'Various',
      role: 'QA Engineer',
      period: '2017 — 2020',
      highlight: '5+ Projects',
      desc: 'Built foundational automation frameworks, API test suites, and performance testing pipelines across e-commerce and fintech domains.',
      tags: ['Selenium', 'Postman', 'JMeter', 'MySQL'],
      accent: 'var(--accent-purple)',
    },
  ]

  return (
    <section id="journey" className="py-20 px-4 max-w-7xl mx-auto w-full">
      <div className="mb-10">
        <div className="font-mono text-[10px] text-[var(--accent-green)] uppercase tracking-widest mb-2">
          // PROFESSIONAL JOURNEY
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">7 Years in the Trenches</h2>
      </div>

      <div className="space-y-4">
        {roles.map((r, i) => (
          <div
            key={i}
            className="group rounded-xl p-5 transition-all duration-300 cursor-default"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--border-active)'
              el.style.background = 'var(--bg-card-hover)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--border-subtle)'
              el.style.background = 'var(--bg-card)'
            }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-1.5 h-full min-h-[40px] rounded-full"
                  style={{ background: r.accent, opacity: 0.7 }}
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[var(--text-primary)]">{r.company}</span>
                    <span className="text-[var(--text-muted)]">·</span>
                    <span className="text-[var(--text-secondary)] text-sm">{r.role}</span>
                    <span
                      className="font-mono text-[10px] px-2 py-0.5 rounded"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: r.accent }}
                    >
                      {r.highlight}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-[var(--text-muted)] mt-0.5">{r.period}</div>
                </div>
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3 ml-5">{r.desc}</p>

            <div className="flex flex-wrap gap-1.5 ml-5">
              {r.tags.map(tag => (
                <span
                  key={tag}
                  className="font-mono text-[10px] px-2 py-0.5 rounded"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer
      className="py-8 px-4 text-center border-t"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <p className="font-mono text-xs text-[var(--text-muted)]">
        Huu Vy · QA Lead · huuvy0109@gmail.com
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
        <SanitizerVisualizer />
        <JourneySection />
      </div>

      <Footer />
    </main>
  )
}
