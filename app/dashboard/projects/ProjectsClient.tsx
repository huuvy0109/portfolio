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
  ciConfig: string | null
  createdAt: Date
}

function SlidePanel({ open, onClose, title, children }: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
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
              width: '420px',
              background: 'var(--surface-lowest)',
              borderLeft: '1px solid var(--border-subtle)',
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {title}
              </h2>
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

function ConfirmModal({ open, onConfirm, onCancel, projectName }: {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  projectName: string
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="relative rounded-2xl p-6 w-full max-w-sm"
            style={{ background: 'var(--surface-lowest)', border: '1px solid rgba(255,68,68,0.2)' }}
          >
            <div className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--accent-red)' }}>
              // CONFIRM DELETE
            </div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Xóa project <strong>&quot;{projectName}&quot;</strong>?
            </p>
            <p className="font-mono text-[11px] mb-5" style={{ color: 'var(--text-muted)' }}>
              Tất cả test runs và results sẽ bị xóa vĩnh viễn.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 font-mono text-xs py-2 rounded transition-colors"
                style={{ border: '1px solid var(--border-dim)', color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 font-mono text-xs py-2 rounded transition-colors"
                style={{ background: 'rgba(255,68,68,0.12)', border: '1px solid rgba(255,68,68,0.3)', color: 'var(--accent-red)' }}
              >
                Delete Project
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function ProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects)
  const [panelOpen, setPanelOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

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
    setPanelOpen(false)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    await fetch(`/api/projects/${deleteTarget.id}`, { method: 'DELETE' })
    setProjects(prev => prev.filter(p => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const hasCI = (p: Project) => !!p.ciConfig
  const hasTask = (p: Project) => !!(p.jiraConfig || p.trelloConfig)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          Manage Projects
        </h1>
        <button
          data-testid="btn-new-project"
          onClick={() => setPanelOpen(true)}
          className="flex items-center gap-2 font-mono text-xs px-5 py-2.5 transition-all duration-200"
          style={{
            border: '1px solid rgba(249,115,22,0.35)',
            color: 'var(--accent-orange)',
            background: 'rgba(249,115,22,0.07)',
            borderRadius: '999px',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Project
        </button>
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div
          data-testid="projects-empty"
          className="flex flex-col items-center justify-center py-24 rounded-2xl"
          style={{ border: '1px dashed var(--border-subtle)' }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.2)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="1.5">
              <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </div>
          <p className="font-mono text-sm mb-1" style={{ color: 'var(--text-muted)' }}>No projects yet</p>
          <p className="font-mono text-[11px] mb-5" style={{ color: 'var(--text-muted)' }}>
            Create your first project to start tracking test runs
          </p>
          <button
            onClick={() => setPanelOpen(true)}
            className="font-mono text-xs px-5 py-2 rounded-lg"
            style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)', color: 'var(--accent-orange)' }}
          >
            + Create Project
          </button>
        </div>
      ) : (
        <div data-testid="projects-list" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {projects.map(p => (
              <motion.div
                key={p.id}
                data-testid={`project-card-${p.slug}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="rounded-2xl flex flex-col gap-4 transition-all duration-200 relative overflow-hidden"
                style={{
                  background: 'var(--surface-low)',
                  border: '1px solid rgba(249,115,22,0.18)',
                  padding: '22px 20px 18px',
                  backgroundImage: 'radial-gradient(ellipse at top right, rgba(249,115,22,0.07) 0%, transparent 65%)',
                }}
              >
                {/* Badge absolute top-right */}
                <div className="absolute top-3 right-3 flex gap-1.5">
                  {hasCI(p) && (
                    <span
                      className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.25)', color: 'var(--accent-purple)' }}
                    >
                      CI
                    </span>
                  )}
                  {hasTask(p) && (
                    <span
                      className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: 'var(--accent-blue)' }}
                    >
                      TASK
                    </span>
                  )}
                </div>

                {/* Card header */}
                <div className="flex flex-col gap-1 pr-10">
                  <div className="font-bold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: '16px' }}>
                    {p.name}
                  </div>
                  <span className="font-mono text-[11px]" style={{ color: 'var(--accent-orange)' }}>
                    /{p.slug}
                  </span>
                </div>

                {/* Created date */}
                <div className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Created {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={`/dashboard/${p.slug}`}
                    className="flex-1 text-center font-mono text-[11px] py-2 rounded-lg transition-all duration-150"
                    style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.25)', color: 'var(--accent-orange)' }}
                  >
                    View Runs
                  </a>
                  <a
                    href={`/dashboard/projects/${p.id}/settings`}
                    className="flex-1 text-center font-mono text-[11px] py-2 rounded-lg transition-all duration-150"
                    style={{ border: '1px solid var(--border-dim)', color: 'var(--text-secondary)' }}
                  >
                    Settings
                  </a>
                  <button
                    data-testid={`btn-delete-project-${p.id}`}
                    onClick={() => setDeleteTarget(p)}
                    className="p-2 rounded-lg transition-all duration-150 flex items-center justify-center"
                    style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', background: 'transparent' }}
                    title="Delete project"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 5v14M5 12h14" transform="rotate(45 12 12)" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create project slide panel */}
      <SlidePanel open={panelOpen} onClose={() => { setPanelOpen(false); setError('') }} title="New Project">
        <form data-testid="form-create-project" onSubmit={handleCreate} className="flex flex-col gap-5">
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
              placeholder="KiLand E2E"
              className="px-3 py-2.5 rounded-lg font-mono text-sm outline-none"
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
              placeholder="kiland-e2e"
              className="px-3 py-2.5 rounded-lg font-mono text-sm outline-none"
              style={{ background: 'var(--surface-mid)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
            />
            <span className="font-mono text-[9px]" style={{ color: 'var(--text-muted)' }}>
              URL: /dashboard/{slug || 'slug'}
            </span>
          </div>

          {error && (
            <div
              data-testid="project-form-error"
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
              data-testid="btn-create-project"
              type="submit"
              disabled={saving}
              className="flex-1 font-mono text-xs py-2.5 rounded-lg disabled:opacity-50"
              style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: 'var(--accent-orange)' }}
            >
              {saving ? '// creating...' : '→ Create Project'}
            </button>
          </div>
        </form>
      </SlidePanel>

      {/* Delete confirm modal */}
      <ConfirmModal
        open={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        projectName={deleteTarget?.name ?? ''}
      />
    </div>
  )
}
