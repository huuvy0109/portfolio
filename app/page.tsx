'use client'

import { useState, useEffect } from 'react'
import { LanguageProvider, useLang } from '@/lib/context/LanguageContext'
import Sidebar from '@/components/sidebar/Sidebar'
import HeroSection from '@/components/hero/HeroSection'
import PipelineSection from '@/components/pipeline-board/PipelineSection'
import JourneySection from '@/components/journey/JourneySection'
import SkillsSection from '@/components/skills/SkillsSection'
import TestHistorySection from '@/components/history/TestHistorySection'
import SanitizerVisualizer from '@/components/sanitizer/SanitizerVisualizer'
import { usePipelineStore } from '@/lib/store/pipelineStore'

const SECTION_IDS = ['hero', 'pipeline', 'journey', 'skills', 'history', 'sanitizer'] as const
type SectionId = typeof SECTION_IDS[number]

const THEMES = ['editorial', 'sovereign', 'verdant'] as const
type Theme = typeof THEMES[number]

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 24
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

function AppShell() {
  const { lang } = useLang()
  const { trigger, phase } = usePipelineStore()
  const [active, setActive] = useState<SectionId>('hero')
  const [theme, setThemeState] = useState<Theme>('editorial')

  // Init theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('pf-theme') as Theme | null
    if (stored && THEMES.includes(stored)) {
      setThemeState(stored)
      document.body.setAttribute('data-theme', stored)
    } else {
      document.body.setAttribute('data-theme', 'editorial')
    }
  }, [])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    document.body.setAttribute('data-theme', t)
    localStorage.setItem('pf-theme', t)
  }

  // Active section tracking
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id as SectionId)
        })
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  const handleRunPipeline = () => {
    if (phase === 'idle') trigger()
    scrollToSection('pipeline')
  }

  const FT = {
    en: { line1: 'Vy Quang Huu · QC Engineer · huuvy0109@gmail.com', line2: 'Built with Next.js · TypeScript · Playwright ·', sut: 'this page is the SUT' },
    vi: { line1: 'Vỹ Quang Hữu · Kỹ Sư QC · huuvy0109@gmail.com', line2: 'Xây dựng với Next.js · TypeScript · Playwright ·', sut: 'trang này là SUT' },
  }[lang]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar
        active={active}
        pipelinePhase={phase}
        theme={theme}
        setTheme={setTheme}
        onNavClick={scrollToSection}
      />

      <main style={{ marginLeft: 'var(--sidebar-w)', flex: 1, padding: '0 52px 0 48px', minWidth: 0 }}>
        <section id="hero" style={{ borderBottom: '1px solid var(--border)' }}>
          <HeroSection onRunPipeline={handleRunPipeline} />
        </section>

        <section id="pipeline" style={{ borderBottom: '1px solid var(--border)' }}>
          <PipelineSection />
        </section>

        <section id="journey" style={{ borderBottom: '1px solid var(--border)' }}>
          <JourneySection />
        </section>

        <section id="skills" style={{ borderBottom: '1px solid var(--border)' }}>
          <SkillsSection />
        </section>

        <section id="history" style={{ borderBottom: '1px solid var(--border)' }}>
          <TestHistorySection />
        </section>

        <section id="sanitizer" style={{ borderBottom: '1px solid var(--border)' }}>
          <SanitizerVisualizer />
        </section>

        <footer
          data-testid="footer"
          style={{
            borderTop: '1px solid var(--border)',
            padding: '32px 0 40px',
            fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
            fontSize: '10px',
            color: 'var(--text-dim)',
            textAlign: 'center',
          }}
        >
          <p>{FT.line1}</p>
          <p style={{ marginTop: '6px', opacity: 0.5 }}>
            {FT.line2}{' '}
            <span style={{ color: 'var(--accent)' }}>{FT.sut}</span>
          </p>
        </footer>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <LanguageProvider>
      <AppShell />
    </LanguageProvider>
  )
}
