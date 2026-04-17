'use client'

import { motion } from 'framer-motion'
import { usePipelineStore } from '@/lib/store/pipelineStore'

const stats = [
  { value: '7', label: 'YRS EXP' },
  { value: '30–40', label: 'TEAM SIZE' },
  { value: '5+', label: 'ENTERPRISES' },
  { value: 'AI', label: 'PIPELINE' },
]

const tags = ['Playwright', 'TypeScript', 'AI Multi-Agent', 'Jira', 'GitHub Actions', 'Postman', 'SQL']

export default function HeroSection() {
  const { trigger, phase } = usePipelineStore()

  return (
    <section data-testid="hero-section" className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background ambient gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,255,157,0.04) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 80% 80%, rgba(96,165,250,0.03) 0%, transparent 60%)',
        }}
      />

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-6 left-6 right-6 flex items-center justify-between"
      >
        <span className="font-mono text-xs text-[var(--text-muted)] tracking-widest uppercase">
          portfolio_v2.1.0
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-green)]" style={{ animation: 'pulse-glow 2s ease-in-out infinite' }} />
          <span className="font-mono text-xs text-[var(--accent-green)]">SYSTEM ONLINE</span>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Role badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-dim)] mb-8"
          style={{ background: 'rgba(0,255,157,0.05)' }}
        >
          <span className="text-[var(--accent-green)] text-xs">⬡</span>
          <span className="font-mono text-xs text-[var(--text-secondary)] tracking-widest uppercase">
            QA Lead · AI Automation Engineer
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight mb-4 leading-none"
          style={{
            background: 'linear-gradient(135deg, #f0f0f0 0%, #888 60%, #f0f0f0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          <span data-testid="hero-heading">HUU VY</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="font-mono text-sm sm:text-base text-[var(--text-secondary)] mb-3 tracking-wide"
        >
          <span className="text-[var(--accent-green)]">&gt;</span>{' '}
          This page is not just a portfolio —{' '}
          <span className="text-[var(--text-primary)]">it is a Subject Under Test</span>
          <span className="cursor-blink" />
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-[var(--text-secondary)] text-sm max-w-xl mx-auto mb-12 leading-relaxed"
        >
          Building intelligent QA systems that model real-world failures, enforce quality gates,
          and leave an auditable trail of every human decision.
        </motion.p>

        {/* Stats */}
        <motion.div
          data-testid="hero-stats"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex items-center justify-center gap-8 mb-12"
        >
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{s.value}</div>
              <div className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest uppercase mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
        >
          <button
            data-testid="btn-run-pipeline"
            onClick={() => {
              if (phase === 'idle') trigger()
              document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="group flex items-center gap-2 px-6 py-3 rounded-lg font-mono text-sm font-medium transition-all duration-200"
            style={{
              background: 'rgba(0,255,157,0.08)',
              border: '1px solid rgba(0,255,157,0.3)',
              color: 'var(--accent-green)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = 'rgba(0,255,157,0.14)'
              el.style.boxShadow = '0 0 16px rgba(0,255,157,0.15)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = 'rgba(0,255,157,0.08)'
              el.style.boxShadow = 'none'
            }}
          >
            <span>▶ Run Pipeline</span>
          </button>

          <button
            onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-mono text-sm transition-all duration-200"
            style={{
              border: '1px solid var(--border-dim)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-active)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-dim)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            View Journey →
          </button>
        </motion.div>

        {/* Tech tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {tags.map(tag => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded font-mono text-[10px] tracking-widest uppercase"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 flex flex-col items-center gap-1.5"
      >
        <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest uppercase">scroll</span>
        <div className="flex flex-col gap-1">
          {[0, 1].map(i => (
            <div
              key={i}
              className="w-px h-2 bg-[var(--text-muted)] mx-auto"
              style={{ animation: `scroll-down 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </motion.div>
    </section>
  )
}
