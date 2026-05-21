import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { M } from '@/components/mobile/tokens'
import { ToDesktopIfLarge } from '@/components/ViewportRedirect'

export default async function MobileDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/m/login')

  return (
    <ToDesktopIfLarge>
      <div style={{ background: M.bg, color: M.text, minHeight: '100svh', overflowX: 'hidden' }}>
        {children}
      </div>
    </ToDesktopIfLarge>
  )
}
