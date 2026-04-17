'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface User { id: string; username: string; role: string; createdAt: Date }

export default function UsersClient({ initialUsers, currentUserId }: { initialUsers: User[]; currentUserId: string }) {
  const [userList, setUserList] = useState(initialUsers)
  const [showForm, setShowForm] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
    if (!res.ok) { setError((await res.json()).error || 'Failed'); return }
    const user = await res.json()
    setUserList(prev => [...prev, user])
    setUsername(''); setPassword(''); setShowForm(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa user này?')) return
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
    setUserList(prev => prev.filter(u => u.id !== id))
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--accent-purple)' }}>
            // USERS
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            User Management
          </h1>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="font-mono text-sm px-4 py-2 rounded"
          style={{ border: '1px solid rgba(192,132,252,0.3)', color: 'var(--accent-purple)', background: 'rgba(192,132,252,0.05)' }}>
          {showForm ? '✕ Cancel' : '+ New User'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            onSubmit={handleCreate}
            className="rounded-xl p-5 mb-6 flex flex-col gap-4"
            style={{ background: 'var(--surface-low)', border: '1px solid rgba(192,132,252,0.1)' }}>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)} required
                  className="px-3 py-2 rounded font-mono text-sm outline-none"
                  style={{ background: 'var(--surface-mid)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="px-3 py-2 rounded font-mono text-sm outline-none"
                  style={{ background: 'var(--surface-mid)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Role</label>
                <select value={role} onChange={e => setRole(e.target.value as 'member' | 'owner')}
                  className="px-3 py-2 rounded font-mono text-sm outline-none"
                  style={{ background: 'var(--surface-mid)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
                  <option value="member">member</option>
                  <option value="owner">owner</option>
                </select>
              </div>
            </div>
            {error && (
              <div className="font-mono text-[11px] px-3 py-2 rounded"
                style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', color: 'var(--accent-red)' }}>
                ✗ {error}
              </div>
            )}
            <button type="submit" disabled={saving} className="btn-primary font-mono text-sm py-2 rounded self-start px-6 disabled:opacity-50">
              {saving ? '// creating...' : '→ Create User'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        {userList.map(u => (
          <div key={u.id} className="flex items-center justify-between px-5 py-4 rounded-xl"
            style={{ background: 'var(--surface-low)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {u.username}
                {u.id === currentUserId && (
                  <span className="font-mono text-[9px] ml-2 px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(0,229,255,0.08)', color: 'var(--accent-cyan)', border: '1px solid rgba(0,229,255,0.2)' }}>
                    YOU
                  </span>
                )}
              </div>
              <div className="font-mono text-[10px]" style={{ color: u.role === 'owner' ? 'var(--accent-purple)' : 'var(--text-muted)' }}>
                {u.role}
              </div>
            </div>
            {u.id !== currentUserId && (
              <button onClick={() => handleDelete(u.id)}
                className="font-mono text-[11px] px-3 py-1.5 rounded"
                style={{ border: '1px solid rgba(255,68,68,0.2)', color: 'var(--accent-red)', background: 'rgba(255,68,68,0.04)' }}>
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
