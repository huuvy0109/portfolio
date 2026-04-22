'use client'

import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface Props {
  username: string
  role: string
}

const navItems = [
  {
    href: '/dashboard',
    label: 'Overview',
    id: 'overview',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/dashboard/projects',
    label: 'Projects',
    id: 'projects',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
        <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/users',
    label: 'Users',
    id: 'users',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
        <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" />
      </svg>
    ),
  },
]

export default function DashboardSidebar({ username, role }: Props) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* ── DESKTOP sidebar — sticky in flex flow ── */}
      <aside
        data-testid="sidebar-nav"
        className="hidden lg:flex flex-col flex-shrink-0"
        style={{
          width: '220px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          background: 'var(--surface-lowest)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 px-4 py-4 border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-mono font-bold"
            style={{
              background: 'rgba(249,115,22,0.15)',
              border: '1px solid rgba(249,115,22,0.35)',
              color: 'var(--accent-orange)',
              fontSize: '10px',
            }}
          >
            {'{}'}
          </div>
          <span className="font-mono text-[11px] font-bold tracking-wide truncate" style={{ color: 'var(--text-primary)' }}>
            Command Center
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          {navItems.map(item => {
            const active = isActive(item.href)
            return (
              <a
                key={item.id}
                href={item.href}
                data-testid={`nav-link-${item.id}`}
                className="flex items-center gap-3 py-2.5 rounded-lg transition-all duration-150"
                style={{
                  background: active ? 'rgba(249,115,22,0.08)' : 'transparent',
                  color: active ? 'var(--accent-orange)' : 'var(--text-muted)',
                  borderLeft: active ? '2px solid var(--accent-orange)' : '2px solid transparent',
                  paddingLeft: active ? '10px' : '12px',
                  paddingRight: '12px',
                }}
              >
                <span className="flex-shrink-0">{item.icon(active)}</span>
                <span className="font-mono text-[11px]">{item.label}</span>
              </a>
            )
          })}
        </nav>

        {/* User info + sign out */}
        <div className="px-3 py-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-mono font-bold"
              style={{
                background: 'rgba(249,115,22,0.18)',
                border: '2px solid rgba(249,115,22,0.35)',
                color: 'var(--accent-orange)',
                fontSize: '13px',
              }}
            >
              {username.slice(0, 1).toUpperCase()}
            </div>

            {/* Name + role */}
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[12px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                {username}
              </div>
              <div className="font-mono text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                {role === 'owner' ? "Personal'd profile" : role}
              </div>
            </div>

            {/* Sign out icon */}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-1.5 rounded-lg flex-shrink-0 transition-all duration-150"
              style={{ color: 'var(--text-muted)' }}
              title="Sign Out"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE: top bar ── */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center px-4 gap-3"
        style={{
          height: '52px',
          background: 'var(--surface-lowest)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.35)' }}
        >
          <span className="font-mono text-[9px] font-bold" style={{ color: 'var(--accent-orange)' }}>QA</span>
        </div>
        <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>
          Command Center
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span
            className="font-mono text-[9px] px-1.5 py-0.5 rounded"
            style={{
              background: role === 'owner' ? 'rgba(192,132,252,0.12)' : 'rgba(96,165,250,0.1)',
              color: role === 'owner' ? 'var(--accent-purple)' : 'var(--accent-blue)',
              border: `1px solid ${role === 'owner' ? 'rgba(192,132,252,0.25)' : 'rgba(96,165,250,0.2)'}`,
            }}
          >
            {role.toUpperCase()}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1.5 rounded-lg"
            style={{ color: 'var(--text-muted)' }}
            title="Sign Out"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── MOBILE: bottom tab bar ── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center"
        style={{
          height: '62px',
          background: 'var(--surface-lowest)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        {navItems.map(item => {
          const active = isActive(item.href)
          return (
            <a
              key={item.id}
              href={item.href}
              data-testid={`nav-link-${item.id}`}
              className="flex-1 flex flex-col items-center justify-center gap-1.5 transition-all duration-150 relative"
              style={{
                color: active ? 'var(--accent-orange)' : 'var(--text-muted)',
                paddingTop: '10px',
                paddingBottom: '8px',
              }}
            >
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '32px',
                    height: '2px',
                    borderRadius: '0 0 4px 4px',
                    background: 'var(--accent-orange)',
                  }}
                />
              )}
              {item.icon(active)}
              <span className="font-mono text-[10px] tracking-wide">{item.label}</span>
            </a>
          )
        })}
      </nav>
    </>
  )
}
