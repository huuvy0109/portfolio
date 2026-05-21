'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MTopBar from '@/components/mobile/MTopBar'
import MBottomTabs from '@/components/mobile/MBottomTabs'
import MCard from '@/components/mobile/MCard'
import { M } from '@/components/mobile/tokens'

interface MProject {
  id: string
  name: string
  slug: string
  createdAt: string
  hasCi: boolean
  hasTask: boolean
}

interface Props {
  projects: MProject[]
}

export default function MobileProjectsClient({ projects }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Delete this project?')) return
    setDeletingId(id)
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    router.refresh()
    setDeletingId(null)
  }

  return (
    <>
      <MTopBar />
      <div style={{ paddingTop: 52, paddingBottom: 104, paddingLeft: 16, paddingRight: 16, fontFamily: M.sans }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, marginBottom: 18, gap: 10 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: M.text }}>Manage Projects</h1>
          <a
            href="/m/dashboard/projects/new"
            style={{
              fontFamily: M.mono, fontSize: 11, fontWeight: 600, padding: '8px 14px', borderRadius: 7,
              border: `1px solid rgba(${M.accentRgb},.5)`, background: `rgba(${M.accentRgb},.1)`,
              color: M.accent, textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >+ New</a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {projects.map(p => (
            <MCard key={p.id} style={{ padding: 14, position: 'relative' }}>
              {/* Integration tags */}
              {(p.hasCi || p.hasTask) && (
                <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 4 }}>
                  {p.hasCi && (
                    <span style={{ fontFamily: M.mono, fontSize: 8, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: `rgba(${M.accent3Rgb},.1)`, border: `1px solid rgba(${M.accent3Rgb},.25)`, color: M.accent3, textTransform: 'uppercase' }}>CI</span>
                  )}
                  {p.hasTask && (
                    <span style={{ fontFamily: M.mono, fontSize: 8, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: `rgba(${M.infoRgb},.1)`, border: `1px solid rgba(${M.infoRgb},.25)`, color: M.info, textTransform: 'uppercase' }}>TASK</span>
                  )}
                </div>
              )}

              <div style={{ fontWeight: 700, fontSize: 16, color: M.text, marginBottom: 3, paddingRight: 60 }}>{p.name}</div>
              <div style={{ fontFamily: M.mono, fontSize: 11, color: M.accent, marginBottom: 6 }}>/{p.slug}</div>
              <div style={{ fontFamily: M.mono, fontSize: 10, color: M.textDim, marginBottom: 12 }}>
                Created {new Date(p.createdAt).toLocaleDateString('en-GB')}
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <a
                  href={`/m/dashboard/${p.slug}`}
                  style={{
                    flex: 1, fontFamily: M.mono, fontSize: 11, fontWeight: 600, padding: '8px 0',
                    borderRadius: 6, border: `1px solid rgba(${M.accentRgb},.35)`,
                    background: `rgba(${M.accentRgb},.06)`, color: M.accent,
                    textDecoration: 'none', textAlign: 'center',
                  }}
                >View Runs</a>
                <a
                  href={`/m/dashboard/projects/${p.id}/settings`}
                  style={{
                    flex: 1, fontFamily: M.mono, fontSize: 11, fontWeight: 600, padding: '8px 0',
                    borderRadius: 6, border: `1px solid ${M.borderStrong}`,
                    background: 'transparent', color: M.textSec,
                    textDecoration: 'none', textAlign: 'center',
                  }}
                >⚙ Settings</a>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  style={{
                    width: 36, fontFamily: M.mono, fontSize: 12, padding: '8px 0', borderRadius: 6,
                    border: `1px solid rgba(${M.dangerRgb},.25)`, background: `rgba(${M.dangerRgb},.05)`,
                    color: M.danger, cursor: 'pointer', opacity: deletingId === p.id ? 0.5 : 1,
                  }}
                >✕</button>
              </div>
            </MCard>
          ))}

          {projects.length === 0 && (
            <div style={{ fontFamily: M.mono, fontSize: 11, color: M.textDim, textAlign: 'center', padding: '32px 0' }}>
              No projects yet
            </div>
          )}
        </div>
      </div>
      <MBottomTabs />
    </>
  )
}
