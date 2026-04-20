'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useLang } from '@/lib/context/LanguageContext'
import type { PipelinePhase } from '@/lib/store/pipelineStore'

type Theme = 'editorial' | 'sovereign' | 'verdant'

const NAV = {
  en: [
    { id: 'hero',      label: 'Overview' },
    { id: 'pipeline',  label: 'Pipeline' },
    { id: 'journey',   label: 'Journey' },
    { id: 'skills',    label: 'Skills' },
    { id: 'history',   label: 'Test History' },
    { id: 'sanitizer', label: 'Sanitizer' },
  ],
  vi: [
    { id: 'hero',      label: 'Tổng Quan' },
    { id: 'pipeline',  label: 'Pipeline' },
    { id: 'journey',   label: 'Hành Trình' },
    { id: 'skills',    label: 'Kỹ Năng' },
    { id: 'history',   label: 'Lịch Sử Test' },
    { id: 'sanitizer', label: 'Sanitizer' },
  ],
}

const THEMES: { id: Theme; en: string; vi: string; sub: { en: string; vi: string } }[] = [
  { id: 'editorial', en: 'Editorial', vi: 'Biên Tập',  sub: { en: 'Warm amber dark', vi: 'Tông hổ phách ấm' } },
  { id: 'sovereign', en: 'Sovereign', vi: 'Sovereign', sub: { en: 'Refined cyan dark', vi: 'Cyan tinh tế' } },
  { id: 'verdant',   en: 'Verdant',   vi: 'Verdant',   sub: { en: 'Emerald dark', vi: 'Xanh lá đậm' } },
]

interface SidebarProps {
  active: string
  pipelinePhase: PipelinePhase
  theme: Theme
  setTheme: (t: Theme) => void
  onNavClick: (id: string) => void
}

export default function Sidebar({ active, pipelinePhase, theme, setTheme, onNavClick }: SidebarProps) {
  const { lang, setLang } = useLang()
  const [avatarError, setAvatarError] = useState(false)
  const [tweaksOpen, setTweaksOpen] = useState(false)

  const isRunning = !['idle', 'completed', 'rejected'].includes(pipelinePhase)
  const navItems = NAV[lang]

  const statusLabel = {
    en: isRunning ? 'Running' : 'Online',
    vi: isRunning ? 'Đang Chạy' : 'Trực Tuyến',
  }[lang]

  const mono: React.CSSProperties = {
    fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
  }

  return (
    <nav
      data-testid="sidebar"
      style={{
        width: 'var(--sidebar-w)',
        minHeight: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        background: 'var(--surface-1)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflowY: 'auto',
        padding: '28px 0 24px',
      }}
    >
      {/* Identity */}
      <div style={{ padding: '0 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '14px' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              border: '1.5px solid rgba(var(--accent-rgb),0.45)',
              boxShadow: '0 0 14px rgba(var(--accent-rgb),0.15)',
              background: 'var(--surface-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!avatarError ? (
              <Image
                src="/avatar.jpg"
                alt="Huu Vy"
                width={40}
                height={40}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span style={{ ...mono, fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>VH</span>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Huu Vy
            </div>
            <div style={{ ...mono, fontSize: '9px', color: 'var(--text-dim)', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              QC Engineer
            </div>
          </div>
        </div>

        {/* Status pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '20px',
            background: 'rgba(var(--accent-rgb),0.08)',
            border: '1px solid rgba(var(--accent-rgb),0.2)',
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: 'var(--accent)',
              boxShadow: '0 0 6px var(--accent)',
              animation: isRunning ? 'pulseDot 1s ease infinite' : 'none',
            }}
          />
          <span style={{ ...mono, fontSize: '9px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Language toggle */}
      <div style={{ padding: '0 20px', marginBottom: '20px' }}>
        <div style={{ ...mono, fontSize: '9px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
          {lang === 'en' ? 'Language' : 'Ngôn Ngữ'}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['en', 'vi'] as const).map(l => (
            <button
              key={l}
              data-testid={`lang-${l}`}
              onClick={() => setLang(l)}
              style={{
                flex: 1,
                ...mono,
                fontSize: '10px',
                fontWeight: 600,
                padding: '5px 0',
                borderRadius: '6px',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                border: lang === l ? '1px solid rgba(var(--accent-rgb),0.5)' : '1px solid var(--border)',
                background: lang === l ? 'rgba(var(--accent-rgb),0.12)' : 'transparent',
                color: lang === l ? 'var(--accent)' : 'var(--text-dim)',
                transition: 'all 0.15s',
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: '0 10px', flex: 1 }}>
        <div style={{ ...mono, fontSize: '9px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 10px', marginBottom: '4px' }}>
          {lang === 'en' ? 'Navigation' : 'Điều Hướng'}
        </div>
        {navItems.map(item => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavClick(item.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '7px 10px',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                ...mono,
                fontSize: '11px',
                background: isActive ? 'rgba(var(--accent-rgb),0.1)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-dim)',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-dim)'
                }
              }}
            >
              {isActive && (
                <div style={{ width: 2, height: 12, borderRadius: 1, background: 'var(--accent)', flexShrink: 0 }} />
              )}
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Theme selector */}
      <div style={{ padding: '12px 20px 0', borderTop: '1px solid var(--border)', marginTop: '12px' }}>
        <button
          data-testid="btn-theme-toggle"
          onClick={() => setTweaksOpen(o => !o)}
          style={{
            width: '100%',
            ...mono,
            fontSize: '9px',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: tweaksOpen ? '8px' : 0,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{lang === 'en' ? 'Theme' : 'Giao Diện'}</span>
          <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: tweaksOpen ? 'rotate(180deg)' : 'none' }}>⌄</span>
        </button>
        {tweaksOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '8px' }}>
            {THEMES.map(t => (
              <button
                key={t.id}
                data-testid={`theme-${t.id}`}
                onClick={() => setTheme(t.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 10px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  border: `1px solid ${theme === t.id ? 'rgba(var(--accent-rgb),0.4)' : 'var(--border)'}`,
                  background: theme === t.id ? 'rgba(var(--accent-rgb),0.08)' : 'var(--surface-3)',
                  color: theme === t.id ? 'var(--accent)' : 'var(--text-secondary)',
                  ...mono,
                  fontSize: '10px',
                  transition: 'all 0.15s',
                }}
              >
                <div>{t[lang]}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: '2px' }}>{t.sub[lang]}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CV + LinkedIn */}
      <div style={{ padding: '12px 20px 0', borderTop: '1px solid var(--border)', marginTop: '4px' }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
          <a
            href="/CV/CV_VyQuangHuu_QCEngineer_ENG.pdf"
            download
            style={{
              flex: 1,
              textAlign: 'center',
              ...mono,
              fontSize: '9px',
              padding: '6px 4px',
              border: '1px solid rgba(var(--accent-rgb),0.3)',
              borderRadius: '6px',
              color: 'var(--accent)',
              background: 'rgba(var(--accent-rgb),0.06)',
            }}
          >
            ↓ CV (EN)
          </a>
          <a
            href="/CV/CV_VyQuangHuu_QCEngineer_VIE.pdf"
            download
            style={{
              flex: 1,
              textAlign: 'center',
              ...mono,
              fontSize: '9px',
              padding: '6px 4px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-dim)',
              background: 'transparent',
            }}
          >
            ↓ CV (VI)
          </a>
        </div>
        <a
          href="https://linkedin.com/in/huuvy0109"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', ...mono, fontSize: '9px', color: 'var(--text-dim)', textAlign: 'center' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)' }}
        >
          LinkedIn ↗
        </a>
      </div>
    </nav>
  )
}
