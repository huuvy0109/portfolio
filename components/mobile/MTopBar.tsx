'use client'

import { signOut } from 'next-auth/react'
import { M } from './tokens'

interface Props {
  subtitle?: string
}

export default function MTopBar({ subtitle }: Props) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 52,
      background: M.surf1, borderBottom: `1px solid ${M.border}`,
      display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, zIndex: 50,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 7, background: '#FF6A2B',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: M.mono, fontSize: 11, fontWeight: 700, color: '#fff',
        letterSpacing: '.04em', flexShrink: 0,
      }}>QA</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: M.mono, fontSize: 12, fontWeight: 700, color: M.text, lineHeight: 1.1 }}>
          Command Center
        </div>
        {subtitle && (
          <div style={{ fontFamily: M.mono, fontSize: 9, color: M.textDim, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            {subtitle}
          </div>
        )}
      </div>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 8px', borderRadius: 5,
        background: `rgba(${M.accent2Rgb},.12)`, border: `1px solid rgba(${M.accent2Rgb},.3)`,
      }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: M.accent2 }} />
        <span style={{ fontFamily: M.mono, fontSize: 9, fontWeight: 600, color: M.accent2, textTransform: 'uppercase', letterSpacing: '.06em' }}>Owner</span>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: '/m/login' })}
        aria-label="Sign out"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: M.textDim, padding: 6, display: 'flex' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </div>
  )
}
