'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { M } from '@/components/mobile/tokens'
import { ToDesktopIfLarge } from '@/components/ViewportRedirect'

function MobileLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/m/dashboard'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn('credentials', { username, password, redirect: false })
    setLoading(false)
    if (result?.error) { setError('Invalid username or password'); return }
    router.push(callbackUrl)
  }

  return (
    <div style={{
      background: M.bg, color: M.text, minHeight: '100svh',
      fontFamily: M.sans, padding: '80px 24px 48px',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
      backgroundImage: `radial-gradient(ellipse 70% 50% at 50% -10%, rgba(${M.accentRgb},.08) 0%, transparent 65%)`,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, background: '#FF6A2B',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: M.mono, fontSize: 18, fontWeight: 700, color: '#fff',
          boxShadow: '0 8px 24px rgba(255,106,43,.25)',
        }}>QA</div>
        <div style={{ marginTop: 14, fontFamily: M.mono, fontSize: 12, color: M.text, fontWeight: 700 }}>Command Center</div>
        <div style={{ marginTop: 3, fontFamily: M.mono, fontSize: 10, color: M.textDim, textTransform: 'uppercase', letterSpacing: '.1em' }}>QA Workspace</div>
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 700, color: M.text, marginBottom: 6, letterSpacing: '-.02em' }}>Workspace Access</h1>
      <p style={{ fontFamily: M.mono, fontSize: 11, color: M.textDim, marginBottom: 28 }}>Restricted — authorized personnel only</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
        <div>
          <label style={{ fontFamily: M.mono, fontSize: 10, color: M.textDim, textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 6 }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
            style={{
              width: '100%', background: M.surf2, border: `1px solid ${M.borderStrong}`,
              borderRadius: 9, padding: '13px 14px', fontFamily: M.mono, fontSize: 13,
              color: M.text, outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = `rgba(${M.accentRgb},.5)` }}
            onBlur={e => { e.currentTarget.style.borderColor = M.borderStrong }}
          />
        </div>
        <div>
          <label style={{ fontFamily: M.mono, fontSize: 10, color: M.textDim, textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 6 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{
              width: '100%', background: M.surf2, border: `1px solid ${M.borderStrong}`,
              borderRadius: 9, padding: '13px 14px', fontFamily: M.mono, fontSize: 13,
              color: M.text, outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = `rgba(${M.accentRgb},.5)` }}
            onBlur={e => { e.currentTarget.style.borderColor = M.borderStrong }}
          />
        </div>

        {error && (
          <div style={{ fontFamily: M.mono, fontSize: 11, color: M.danger, padding: '8px 12px', borderRadius: 7, background: `rgba(${M.dangerRgb},.08)`, border: `1px solid rgba(${M.dangerRgb},.2)` }}>
            ✗ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: 9, cursor: 'pointer',
            border: `1px solid rgba(${M.accentRgb},.5)`,
            background: `rgba(${M.accentRgb},.12)`, color: M.accent,
            fontFamily: M.mono, fontSize: 13, fontWeight: 600,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '// authenticating...' : '→ Sign In'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontFamily: M.mono, fontSize: 11, color: M.textDim }}>
        Forgot password? <span style={{ color: M.accent }}>Contact admin</span>
      </p>
    </div>
  )
}

export default function MobileLoginPage() {
  return (
    <ToDesktopIfLarge to="/login">
      <Suspense>
        <MobileLoginForm />
      </Suspense>
    </ToDesktopIfLarge>
  )
}
