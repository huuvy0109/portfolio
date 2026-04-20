'use client'

import { useLang } from '@/lib/context/LanguageContext'

const STATS = {
  en: [
    { value: '7+',   label: 'Yrs Experience' },
    { value: '+30%', label: 'Test Coverage'   },
    { value: '−40%', label: 'Regression'      },
    { value: '95%+', label: 'On-time'         },
  ],
  vi: [
    { value: '7+',   label: 'Năm Kinh Nghiệm' },
    { value: '+30%', label: 'Độ Phủ Test'      },
    { value: '−40%', label: 'Regression'       },
    { value: '95%+', label: 'Đúng Hạn'         },
  ],
}

const TAGS = ['Playwright', 'TypeScript', 'AI Multi-Agent', 'Cursor AI', 'GitHub Actions', 'Postman', 'Jira']

const T = {
  en: {
    role: 'QC Engineer · AI Automation',
    desc: 'Building intelligent QA systems that model real-world failures, enforce quality gates, and leave an auditable trail of every human decision.',
    cta1: '▶ Run Pipeline',
    cta2: 'View Journey →',
  },
  vi: {
    role: 'Kỹ Sư QC · Tự Động Hóa AI',
    desc: 'Xây dựng hệ thống QA thông minh mô phỏng lỗi thực tế, kiểm soát chất lượng bằng quality gate, và ghi lại toàn bộ quyết định của con người.',
    cta1: '▶ Chạy Pipeline',
    cta2: 'Xem Hành Trình →',
  },
}

interface HeroSectionProps {
  onRunPipeline: () => void
}

export default function HeroSection({ onRunPipeline }: HeroSectionProps) {
  const { lang } = useLang()
  const t = T[lang]
  const stats = STATS[lang]

  const mono: React.CSSProperties = {
    fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
  }

  const scrollToJourney = () => {
    const el = document.getElementById('journey')
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 24
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div data-testid="hero-section" style={{ paddingTop: '60px', paddingBottom: '48px' }}>
      {/* Eyebrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <div style={{ width: 24, height: 1, background: 'var(--accent)' }} />
        <span style={{ ...mono, fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          {t.role}
        </span>
      </div>

      {/* Name */}
      <h1
        data-testid="hero-heading"
        style={{
          fontSize: 'clamp(3.2rem, 6vw, 5.5rem)',
          fontWeight: 700,
          lineHeight: 0.92,
          letterSpacing: '-0.03em',
          marginBottom: '22px',
          background: 'linear-gradient(135deg, var(--text-primary) 0%, rgba(var(--accent-rgb),.85) 55%, var(--text-secondary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        HUU VY
      </h1>

      {/* Description */}
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.75, marginBottom: '32px' }}>
        {t.desc}
      </p>

      {/* Stats row */}
      <div data-testid="hero-stats" style={{ display: 'flex', gap: '36px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {stats.map(s => (
          <div key={s.label}>
            <div style={{ ...mono, fontSize: '1.7rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ ...mono, fontSize: '9px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '5px' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <button
          data-testid="btn-run-pipeline"
          onClick={onRunPipeline}
          style={{
            ...mono,
            fontSize: '12px',
            padding: '9px 20px',
            borderRadius: '7px',
            cursor: 'pointer',
            border: '1px solid rgba(var(--accent-rgb),.5)',
            background: 'rgba(var(--accent-rgb),.1)',
            color: 'var(--accent)',
            fontWeight: 600,
            transition: 'background .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),.18)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),.1)' }}
        >
          {t.cta1}
        </button>

        <button
          onClick={scrollToJourney}
          style={{
            ...mono,
            fontSize: '12px',
            padding: '9px 20px',
            borderRadius: '7px',
            cursor: 'pointer',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            transition: 'all .2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),.3)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          {t.cta2}
        </button>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {TAGS.map(tag => (
          <span
            key={tag}
            style={{
              ...mono,
              fontSize: '9px',
              padding: '4px 10px',
              borderRadius: '5px',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
