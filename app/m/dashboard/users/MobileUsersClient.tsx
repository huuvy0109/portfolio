'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MTopBar from '@/components/mobile/MTopBar'
import MBottomTabs from '@/components/mobile/MBottomTabs'
import MCard from '@/components/mobile/MCard'
import { M } from '@/components/mobile/tokens'

interface MUser {
  id: string
  username: string
  role: string
  createdAt: string
  isYou: boolean
}

export default function MobileUsersClient({ users, currentUserId }: { users: MUser[]; currentUserId: string }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('member')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  async function handleDelete(id: string) {
    if (!confirm('Delete this user?')) return
    setDeletingId(id)
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
    router.refresh()
    setDeletingId(null)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true); setCreateError('')
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole }),
    })
    setCreating(false)
    if (res.ok) {
      setNewUsername(''); setNewPassword(''); setNewRole('member')
      setShowCreate(false)
      router.refresh()
    } else {
      const d = await res.json() as { error?: string }
      setCreateError(d.error ?? 'Create failed')
    }
  }

  return (
    <>
      <MTopBar />
      <div style={{ paddingTop: 52, paddingBottom: 104, paddingLeft: 16, paddingRight: 16, fontFamily: M.sans }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: M.mono, fontSize: 10, color: M.accent2, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>// Users</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: M.text }}>User Management</h1>
          </div>
          <button
            onClick={() => setShowCreate(v => !v)}
            style={{
              fontFamily: M.mono, fontSize: 11, fontWeight: 600, padding: '8px 14px', borderRadius: 7, cursor: 'pointer',
              border: `1px solid rgba(${M.accent2Rgb},.5)`, background: `rgba(${M.accent2Rgb},.1)`, color: M.accent2,
            }}
          >{showCreate ? '✕ Cancel' : '+ New'}</button>
        </div>

        {/* Create form */}
        {showCreate && (
          <MCard style={{ padding: 16, marginBottom: 14 }}>
            <div style={{ fontFamily: M.mono, fontSize: 9.5, color: M.textSec, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>// New User</div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Username', value: newUsername, onChange: setNewUsername, type: 'text', ph: 'qa_bot' },
                { label: 'Password', value: newPassword, onChange: setNewPassword, type: 'password', ph: '••••••••' },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontFamily: M.mono, fontSize: 9.5, color: M.textDim, textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={f.value}
                    onChange={e => f.onChange(e.target.value)}
                    placeholder={f.ph}
                    required
                    style={{ width: '100%', background: M.surf3, border: `1px solid ${M.borderStrong}`, borderRadius: 7, padding: '10px 12px', fontFamily: M.mono, fontSize: 12, color: M.text, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontFamily: M.mono, fontSize: 9.5, color: M.textDim, textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 5 }}>Role</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  style={{ width: '100%', background: M.surf3, border: `1px solid ${M.borderStrong}`, borderRadius: 7, padding: '10px 12px', fontFamily: M.mono, fontSize: 12, color: M.text, outline: 'none' }}
                >
                  <option value="member">member</option>
                  <option value="owner">owner</option>
                </select>
              </div>
              {createError && (
                <div style={{ fontFamily: M.mono, fontSize: 11, color: M.danger }}>✗ {createError}</div>
              )}
              <button
                type="submit"
                disabled={creating}
                style={{ width: '100%', padding: '11px', borderRadius: 7, cursor: 'pointer', border: `1px solid rgba(${M.accent2Rgb},.4)`, background: `rgba(${M.accent2Rgb},.1)`, color: M.accent2, fontFamily: M.mono, fontSize: 12, fontWeight: 600, opacity: creating ? 0.6 : 1 }}
              >{creating ? '// creating...' : '→ Create User'}</button>
            </form>
          </MCard>
        )}

        {/* User list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map(u => {
            const c   = u.role === 'owner' ? M.accent2 : M.info
            const rgb = u.role === 'owner' ? M.accent2Rgb : M.infoRgb
            return (
              <MCard key={u.id} style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: `rgba(${rgb},.12)`, border: `1px solid rgba(${rgb},.3)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: M.mono, fontSize: 13, fontWeight: 700, color: c,
                }}>{u.username[0].toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: M.text }}>{u.username}</span>
                    {u.isYou && (
                      <span style={{ fontFamily: M.mono, fontSize: 8, padding: '2px 6px', borderRadius: 3, background: `rgba(${M.accentRgb},.1)`, border: `1px solid rgba(${M.accentRgb},.25)`, color: M.accent, fontWeight: 600 }}>YOU</span>
                    )}
                  </div>
                  <div style={{ fontFamily: M.mono, fontSize: 10, color: c, marginBottom: 1 }}>{u.role}</div>
                  <div style={{ fontFamily: M.mono, fontSize: 10, color: M.textDim }}>joined {new Date(u.createdAt).toLocaleDateString('en-GB')}</div>
                </div>
                {!u.isYou && (
                  <button
                    onClick={() => handleDelete(u.id)}
                    disabled={deletingId === u.id}
                    style={{ fontFamily: M.mono, fontSize: 11, padding: '6px 10px', borderRadius: 6, cursor: 'pointer', border: `1px solid rgba(${M.dangerRgb},.25)`, background: `rgba(${M.dangerRgb},.05)`, color: M.danger, opacity: deletingId === u.id ? 0.5 : 1 }}
                  >Delete</button>
                )}
              </MCard>
            )
          })}
        </div>
      </div>
      <MBottomTabs />
    </>
  )
}
