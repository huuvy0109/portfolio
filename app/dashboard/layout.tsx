import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { signOut } from '@/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Top nav */}
      <header
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-lowest)' }}
      >
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-cyan)', boxShadow: '0 0 8px var(--accent-cyan)' }} />
          <span className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--accent-cyan)' }}>
            QA Command Center
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {session.user?.name}
          </span>
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }) }}>
            <button
              type="submit"
              className="font-mono text-[11px] px-3 py-1.5 rounded transition-all duration-200"
              style={{ border: '1px solid var(--border-dim)', color: 'var(--text-muted)' }}
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <main className="p-6">{children}</main>
    </div>
  )
}
