'use client'

import { usePathname, useRouter } from 'next/navigation'
import { M } from './tokens'

const TABS = [
  {
    id: 'overview',
    label: 'Overview',
    path: '/m/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/m/dashboard/projects',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    id: 'users',
    label: 'Users',
    path: '/m/dashboard/users',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function MBottomTabs() {
  const pathname = usePathname()
  const router = useRouter()

  function isActive(tabId: string) {
    if (tabId === 'overview') return pathname === '/m/dashboard'
    if (tabId === 'users') return pathname.startsWith('/m/dashboard/users')
    // projects: everything else under /m/dashboard/
    return pathname !== '/m/dashboard' && !pathname.startsWith('/m/dashboard/users')
  }

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: 70,
      background: M.surf1, borderTop: `1px solid ${M.border}`,
      display: 'flex', alignItems: 'flex-start', paddingTop: 10, zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map(t => {
        const a = isActive(t.id)
        return (
          <button
            key={t.id}
            onClick={() => router.push(t.path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, padding: '4px 0', position: 'relative',
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            {a && (
              <div style={{ position: 'absolute', top: -11, width: 24, height: 2, borderRadius: 2, background: M.accent }} />
            )}
            <div style={{ color: a ? M.accent : M.textDim, display: 'flex' }}>{t.icon}</div>
            <div style={{ fontFamily: M.mono, fontSize: 9.5, color: a ? M.accent : M.textDim, fontWeight: a ? 600 : 500 }}>
              {t.label}
            </div>
          </button>
        )
      })}
    </div>
  )
}
