'use client'

import { useLang } from '@/lib/context/LanguageContext'

type AccentVar = 'accent' | 'accent2' | 'accent3'

const SKILL_GROUPS: {
  en: { label: string }
  vi: { label: string }
  icon: string
  accent: AccentVar
  skills: string[]
}[] = [
  {
    en: { label: 'Automation' },
    vi: { label: 'Tự Động Hóa' },
    icon: '▶',
    accent: 'accent',
    skills: ['Playwright', 'TypeScript', 'GitHub Actions', 'Page Object Model', 'CI/CD'],
  },
  {
    en: { label: 'AI Tooling' },
    vi: { label: 'Công Cụ AI' },
    icon: '⬡',
    accent: 'accent2',
    skills: ['Cursor AI', 'Claude AI', 'Playwright MCP', 'AI Test Generation'],
  },
  {
    en: { label: 'API & Integration' },
    vi: { label: 'API & Tích Hợp' },
    icon: '◈',
    accent: 'accent3',
    skills: ['Postman', 'REST APIs', 'Odoo ERP', 'Acumatica', 'WMS', 'GHN'],
  },
  {
    en: { label: 'Process & Management' },
    vi: { label: 'Quy Trình & Quản Lý' },
    icon: '▣',
    accent: 'accent',
    skills: ['Test Strategy', 'Jira', 'KPI Dashboard', 'Team Lead', 'Test Planning'],
  },
]

export default function SkillsSection() {
  const { lang } = useLang()
  const mono: React.CSSProperties = { fontFamily: 'var(--font-mono), JetBrains Mono, monospace' }

  const T = {
    en: { eyebrow: '// Skill Stack', title: 'Tools & Expertise' },
    vi: { eyebrow: '// Kỹ Năng', title: 'Công Cụ & Chuyên Môn' },
  }[lang]

  return (
    <div data-testid="skills-section" style={{ padding: '48px 0' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ ...mono, fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          {T.eyebrow}
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{T.title}</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
        {SKILL_GROUPS.map(g => {
          const acc = `var(--${g.accent})`
          const rgb = `var(--${g.accent}-rgb)`
          return (
            <div
              key={g.en.label}
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '18px',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(${rgb},0.3)` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ color: acc, fontSize: '13px' }}>{g.icon}</span>
                <span style={{ ...mono, fontSize: '10px', color: acc, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {g[lang].label}
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {g.skills.map(s => (
                  <span
                    key={s}
                    style={{
                      ...mono,
                      fontSize: '10px',
                      padding: '4px 9px',
                      borderRadius: '5px',
                      background: `rgba(${rgb},0.07)`,
                      border: `1px solid rgba(${rgb},0.18)`,
                      color: 'var(--text-secondary)',
                      transition: 'color 0.15s',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = acc }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
