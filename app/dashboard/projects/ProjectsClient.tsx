'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Project {
  id: string
  name: string
  slug: string
  ownerId: string
  jiraConfig: string | null
  trelloConfig: string | null
  createdAt: Date
}

export default function ProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug }),
    })

    setSaving(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to create project')
      return
    }

    const project = await res.json()
    setProjects(prev => [project, ...prev])
    setName('')
    setSlug('')
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa project này?')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--accent-cyan)' }}>
            // PROJECTS
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Manage Projects
          </h1>
        </div>
        <button
          data-testid="btn-new-project"
          onClick={() => setShowForm(v => !v)}
          className="font-mono text-sm px-4 py-2 rounded transition-all duration-200"
          style={{
            border: '1px solid rgba(0,229,255,0.3)',
            color: 'var(--accent-cyan)',
            background: 'rgba(0,229,255,0.05)',
          }}
        >
          {showForm ? '✕ Cancel' : '+ New Project'}
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            data-testid="form-new-project"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onSubmit={handleCreate}
            className="rounded-xl p-5 mb-6 flex flex-col gap-4"
            style={{ background: 'var(--surface-low)', border: '1px solid rgba(0,229,255,0.1)' }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Project Name
                </label>
                <input
                  data-testid="input-project-name"
                  value={name}
                  onChange={e => {
                    setName(e.target.value)
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                  }}
                  required
                  placeholder="KiLand"
                  className="px-3 py-2 rounded font-mono text-sm outline-none"
                  style={{ background: 'var(--surface-mid)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Slug
                </label>
                <input
                  data-testid="input-project-slug"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  required
                  placeholder="kiland"
                  className="px-3 py-2 rounded font-mono text-sm outline-none"
                  style={{ background: 'var(--surface-mid)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
            {error && (
              <div data-testid="project-form-error" className="font-mono text-[11px] px-3 py-2 rounded" style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', color: 'var(--accent-red)' }}>
                ✗ {error}
              </div>
            )}
            <button
              data-testid="btn-create-project"
              type="submit"
              disabled={saving}
              className="btn-primary font-mono text-sm py-2 rounded self-start px-6 disabled:opacity-50"
            >
              {saving ? '// creating...' : '→ Create Project'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Project list */}
      {projects.length === 0 ? (
        <div data-testid="projects-empty" className="text-center py-16 font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
          No projects yet — create one above
        </div>
      ) : (
        <div data-testid="projects-list" className="flex flex-col gap-3">
          {projects.map(p => (
            <motion.div
              key={p.id}
              data-testid={`project-row-${p.slug}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-5 py-4 rounded-xl"
              style={{ background: 'var(--surface-low)', border: '1px solid var(--border-subtle)' }}
            >
              <div>
                <div className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  {p.name}
                </div>
                <div className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  /{p.slug}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a href={`/dashboard/${p.slug}`}
                  className="font-mono text-[11px] px-3 py-1.5 rounded"
                  style={{ border: '1px solid var(--border-dim)', color: 'var(--text-secondary)' }}>
                  View Runs →
                </a>
                <a href={`/dashboard/projects/${p.id}/settings`}
                  className="font-mono text-[11px] px-3 py-1.5 rounded"
                  style={{ border: '1px solid rgba(0,229,255,0.15)', color: 'var(--accent-cyan)', background: 'rgba(0,229,255,0.03)' }}>
                  ⚙ Settings
                </a>
                <button
                  data-testid={`btn-delete-${p.slug}`}
                  onClick={() => handleDelete(p.id)}
                  className="font-mono text-[11px] px-3 py-1.5 rounded transition-all duration-200"
                  style={{ border: '1px solid rgba(255,68,68,0.2)', color: 'var(--accent-red)', background: 'rgba(255,68,68,0.04)' }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
