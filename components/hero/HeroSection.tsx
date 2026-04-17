'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePipelineStore } from '@/lib/store/pipelineStore'

const stats = [
  { value: '7+', label: 'YRS EXP' },
  { value: '+30%', label: 'TEST COVERAGE' },
  { value: '-40%', label: 'REGRESSION' },
  { value: '95%+', label: 'ON-TIME' },
]

const tags = ['Playwright', 'TypeScript', 'AI Multi-Agent', 'Cursor AI', 'GitHub Actions', 'Postman', 'Jira']

export default function HeroSection() {
  const { trigger, phase } = usePipelineStore()
  const [avatarError, setAvatarError] = useState(false)

  return (
    <section
      data-testid="hero-section"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ background: 'var(--surface-lowest)' }}
    >
      {/* Ambient aura */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% -5%, rgba(0,229,255,0.07) 0%, transparent 65%), radial-gradient(ellipse 40% 30% at 80% 85%, rgba(0,229,160,0.04) 0%, transparent 60%)',
        }}
      />

      {/* Scanline subtle */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.008) 2px, rgba(0,229,255,0.008) 4px)',
        }}
      />

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-6 left-6 right-6 flex items-center justify-between"
      >
        <span className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
          portfolio_v2.1.0
        </span>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--accent-cyan)', animation: 'pulse-glow 2s ease-in-out infinite', boxShadow: '0 0 8px var(--accent-cyan)' }}
          />
          <span className="font-mono text-xs" style={{ color: 'var(--accent-cyan)' }}>SYSTEM ONLINE</span>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div
            className="w-20 h-20 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
            style={{
              border: '1.5px solid rgba(0,229,255,0.35)',
              boxShadow: '0 0 24px rgba(0,229,255,0.15), 0 0 48px rgba(0,229,255,0.06)',
              background: 'var(--surface-mid)',
            }}
          >
            {!avatarError ? (
              <Image
                src="/avatar.jpg"
                alt="Vy Quang Huu"
                width={80}
                height={80}
                className="w-full h-full object-cover"
                priority
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="font-mono text-lg font-bold" style={{ color: 'var(--accent-cyan)' }}>VH</span>
            )}
          </div>
        </motion.div>

        {/* Role badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded mb-8"
          style={{
            background: 'rgba(0,229,255,0.06)',
            border: '1px solid rgba(0,229,255,0.15)',
          }}
        >
          <span style={{ color: 'var(--accent-cyan)', fontSize: '10px' }}>⬡</span>
          <span className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>
            QC Engineer · AI Automation
          </span>
        </motion.div>

        {/* Name — Space Grotesk display */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight mb-4 leading-none"
          style={{
            fontFamily: 'var(--font-display), Space Grotesk, system-ui',
            background: 'linear-gradient(135deg, #e8f4f5 0%, var(--accent-cyan-dim) 40%, #7a9ca0 80%, #e8f4f5 100%)',
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
          className="font-mono text-sm sm:text-base mb-3 tracking-wide"
          style={{ color: 'var(--text-secondary)' }}
        >
          <span style={{ color: 'var(--accent-cyan)' }}>&gt;</span>{' '}
          This page is not just a portfolio —{' '}
          <span style={{ color: 'var(--text-primary)' }}>it is a Subject Under Test</span>
          <span className="cursor-blink" />
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-sm max-w-xl mx-auto mb-12 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
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
              <div
                className="text-2xl font-bold font-mono"
                style={{ color: 'var(--accent-cyan-dim)' }}
              >
                {s.value}
              </div>
              <div
                className="font-mono text-[10px] tracking-widest uppercase mt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {s.label}
              </div>
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
            className="btn-primary group flex items-center gap-2 px-6 py-3 rounded font-mono text-sm font-medium"
          >
            <span>▶ Run Pipeline</span>
          </button>

          <button
            onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 px-6 py-3 rounded font-mono text-sm transition-all duration-200"
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
              style={{
                background: 'var(--surface-mid)',
                border: '1px solid var(--border-ghost)',
                color: 'var(--text-muted)',
              }}
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
        <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>scroll</span>
        <div className="flex flex-col gap-1">
          {[0, 1].map(i => (
            <div
              key={i}
              className="w-px h-2 mx-auto"
              style={{ background: 'var(--text-muted)', animation: `scroll-down 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </motion.div>
    </section>
  )
}
