'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface User { id: string; username: string; role: string; createdAt: Date }

function SlidePanel({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 h-full z-50 flex flex-col"
            style={{
              width: '400px',
              background: 'var(--surface-lowest)',
              borderLeft: '1px solid var(--border-subtle)',
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--accent-purple)' }}>
                  // NEW USER
                </div>
                <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  Create Account
                </h2>
              </div>
              <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function UsersClient({ initialUsers, currentUserId }: { initialUsers: User[]; currentUserId: string }) {
  const [userList, setUserList] = useState(initialUsers)
  const [panelOpen, setPanelOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [role, setRole] = useState<'member' | 'owner'>('member')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role }),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json() as { error?: string }
      setError(data.error || 'Failed to create user')
      return
    }
    const user = await res.json()
    setUserList(prev => [...prev, user])
    setUsername('')
    setPassword('')
    setPanelOpen(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
    setUserList(prev => prev.filter(u => u.id !== id))
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--accent-pink)' }}>
            // USERS
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            User Management
          </h1>
        </div>
        <button
          data-testid="btn-new-user"
          onClick={() => setPanelOpen(true)}
          className="flex items-center gap-2 font-mono text-xs px-4 py-2.5 rounded-lg transition-all duration-200"
          style={{
            border: '1px solid rgba(192,132,252,0.3)',
            color: 'var(--accent-purple)',
            background: 'rgba(192,132,252,0.06)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New User
        </button>
      </div>

      {/* Users table */}
      <div
        data-testid="users-table"
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface-low)', border: '1px solid var(--border-subtle)' }}
      >
        {/* Table header */}
        <div
          className="grid px-5 py-3 border-b font-mono text-[10px] uppercase tracking-widest"
          style={{
            gridTemplateColumns: '1fr 110px 130px 80px',
            borderColor: 'var(--border-subtle)',
            background: 'var(--surface-lowest)',
            color: 'var(--text-muted)',
          }}
        >
          <span>Username</span>
          <span>Role</span>
          <span>Created</span>
          <span className="text-right">Action</span>
        </div>

        {userList.length === 0 ? (
          <div className="flex items-center justify-center py-12 font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
            No users found
          </div>
        ) : (
          <AnimatePresence>
            {userList.map(u => (
              <motion.div
                key={u.id}
                data-testid={`user-row-${u.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: 16 }}
                className="grid px-5 py-4 items-center border-b last:border-0"
                style={{
                  gridTemplateColumns: '1fr 110px 130px 80px',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                {/* Username */}
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: u.role === 'owner' ? 'rgba(192,132,252,0.1)' : 'rgba(96,165,250,0.08)',
                      border: `1px solid ${u.role === 'owner' ? 'rgba(192,132,252,0.2)' : 'rgba(96,165,250,0.15)'}`,
                    }}
                  >
                    <span
                      className="font-mono text-[10px] font-bold uppercase"
                      style={{ color: u.role === 'owner' ? 'var(--accent-purple)' : 'var(--accent-blue)' }}
                    >
                      {u.username.slice(0, 1)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono text-sm font-bold block truncate" style={{ color: 'var(--text-primary)' }}>
                      {u.username}
                    </span>
                    {u.id === currentUserId && (
                      <span
                        className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(0,229,255,0.08)', color: 'var(--accent-cyan)', border: '1px solid rgba(0,229,255,0.2)' }}
                      >
                        YOU
                      </span>
                    )}
                  </div>
                </div>

                {/* Role */}
                <div>
                  <span
                    className="font-mono text-[10px] px-2 py-0.5 rounded"
                    style={{
                      background: u.role === 'owner' ? 'rgba(192,132,252,0.1)' : 'rgba(96,165,250,0.08)',
                      border: `1px solid ${u.role === 'owner' ? 'rgba(192,132,252,0.25)' : 'rgba(96,165,250,0.2)'}`,
                      color: u.role === 'owner' ? 'var(--accent-purple)' : 'var(--accent-blue)',
                    }}
                  >
                    {u.role.toUpperCase()}
                  </span>
                </div>

                {/* Created */}
                <div>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                {/* Action */}
                <div className="text-right">
                  {u.id === currentUserId ? (
                    <span
                      className="font-mono text-[10px] px-2.5 py-1 rounded"
                      style={{ color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
                      title="Cannot delete your own account"
                    >
                      —
                    </span>
                  ) : (
                    <button
                      data-testid={`btn-delete-user-${u.id}`}
                      onClick={() => handleDelete(u.id)}
                      className="p-1.5 rounded-lg transition-all duration-150"
                      style={{ border: '1px solid rgba(255,68,68,0.15)', color: 'var(--accent-red)', background: 'rgba(255,68,68,0.03)' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                      </svg>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Create user slide panel */}
      <SlidePanel open={panelOpen} onClose={() => { setPanelOpen(false); setError('') }}>
        <form data-testid="form-create-user" onSubmit={handleCreate} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Username
            </label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              placeholder="john.doe"
              className="px-3 py-2.5 rounded-lg font-mono text-sm outline-none"
              style={{ background: 'var(--surface-mid)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg font-mono text-sm outline-none pr-10"
                style={{ background: 'var(--surface-mid)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {showPw
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                  }
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Role
            </label>
            <div className="flex gap-2">
              {(['member', 'owner'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="flex-1 font-mono text-xs py-2 rounded-lg transition-all duration-150"
                  style={{
                    background: role === r
                      ? r === 'owner' ? 'rgba(192,132,252,0.1)' : 'rgba(96,165,250,0.08)'
                      : 'transparent',
                    border: `1px solid ${role === r
                      ? r === 'owner' ? 'rgba(192,132,252,0.3)' : 'rgba(96,165,250,0.25)'
                      : 'var(--border-dim)'}`,
                    color: role === r
                      ? r === 'owner' ? 'var(--accent-purple)' : 'var(--accent-blue)'
                      : 'var(--text-muted)',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div
              className="font-mono text-[11px] px-3 py-2.5 rounded-lg"
              style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', color: 'var(--accent-red)' }}
            >
              ✗ {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setPanelOpen(false); setError('') }}
              className="flex-1 font-mono text-xs py-2.5 rounded-lg"
              style={{ border: '1px solid var(--border-dim)', color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 font-mono text-xs py-2.5 rounded-lg disabled:opacity-50"
              style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.3)', color: 'var(--accent-purple)' }}
            >
              {saving ? '// creating...' : '→ Create User'}
            </button>
          </div>
        </form>
      </SlidePanel>
    </div>
  )
}
