import { auth } from '@/auth'

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--accent-cyan)' }}>
          // DASHBOARD
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          Welcome back, {session?.user?.name}
        </h1>
        <p className="font-mono text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          QA Command Center
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="/dashboard/projects"
          className="rounded-xl p-5 transition-colors duration-200 hover:border-[rgba(0,229,255,0.2)]"
          style={{ background: 'var(--surface-low)', border: '1px solid var(--border-subtle)' }}>
          <div className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Projects →
          </div>
          <div className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>Quản lý dự án & settings</div>
        </a>
        <a href="/dashboard/users"
          className="rounded-xl p-5 transition-colors duration-200 hover:border-[rgba(192,132,252,0.2)]"
          style={{ background: 'var(--surface-low)', border: '1px solid var(--border-subtle)' }}>
          <div className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Users →
          </div>
          <div className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>Quản lý tài khoản & phân quyền</div>
        </a>
      </div>
    </div>
  )
}
