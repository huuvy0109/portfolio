import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      <DashboardSidebar
        username={session.user?.name ?? 'unknown'}
        role={(session.user as { role?: string })?.role ?? 'member'}
      />

      <main className="flex-1 min-w-0 min-h-screen overflow-auto">
        <div className="dashboard-content max-w-5xl mx-auto px-4 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  )
}
