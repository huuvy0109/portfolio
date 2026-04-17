'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Invalid username or password')
      return
    }

    router.push(callbackUrl)
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Ambient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: 'var(--accent-cyan)' }}>
            // QA COMMAND CENTER
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Workspace Access
          </h1>
          <p className="font-mono text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Restricted — authorized personnel only
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-6"
          style={{
            background: 'var(--surface-low)',
            border: '1px solid rgba(0,229,255,0.1)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
          }}
        >
          <div className="h-px mb-6" style={{ background: 'linear-gradient(90deg, var(--accent-cyan), transparent 70%)' }} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-3 py-2.5 rounded font-mono text-sm outline-none transition-all duration-200"
                style={{
                  background: 'var(--surface-mid)',
                  border: '1px solid var(--border-dim)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.4)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-dim)' }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-3 py-2.5 rounded font-mono text-sm outline-none transition-all duration-200"
                style={{
                  background: 'var(--surface-mid)',
                  border: '1px solid var(--border-dim)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.4)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-dim)' }}
              />
            </div>

            {error && (
              <div
                className="font-mono text-[11px] px-3 py-2 rounded"
                style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', color: 'var(--accent-red)' }}
              >
                ✗ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 font-mono text-sm font-medium mt-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '// authenticating...' : '→ Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center font-mono text-[10px] mt-6" style={{ color: 'var(--text-muted)' }}>
          Public portfolio →{' '}
          <a href="/" style={{ color: 'var(--accent-cyan)' }} className="hover:underline">
            huuvy.dev
          </a>
        </p>
      </motion.div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
