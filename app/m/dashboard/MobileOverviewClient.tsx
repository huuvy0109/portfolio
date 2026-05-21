'use client'

import MTopBar from '@/components/mobile/MTopBar'
import MBottomTabs from '@/components/mobile/MBottomTabs'
import MCard from '@/components/mobile/MCard'
import MBadge from '@/components/mobile/MBadge'
import { M } from '@/components/mobile/tokens'

interface RecentRun {
  id: string
  status: string
  projectName: string
  projectSlug: string
  createdAt: string
}

interface Props {
  username: string
  totalProjects: number
  totalRuns: number
  passRate: number
  totalUsers: number
  recentRuns: RecentRun[]
}

const STATS = (p: number, r: number, rate: number, u: number) => [
  {
    label: 'Projects', value: String(p), sub: 'Total owned', color: M.accent, rgb: M.accentRgb,
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    label: 'Total Runs', value: String(r), sub: 'Last 50 runs', color: M.accent2, rgb: M.accent2Rgb,
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  },
  {
    label: 'Pass Rate', value: `${rate}%`, sub: 'Last 50 runs', color: M.accent3, rgb: M.accent3Rgb,
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>,
  },
  {
    label: 'Active Users', value: String(u), sub: 'Workspace', color: M.info, rgb: M.infoRgb,
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  },
]

export default function MobileOverviewClient({ username, totalProjects, totalRuns, passRate, totalUsers, recentRuns }: Props) {
  const stats = STATS(totalProjects, totalRuns, passRate, totalUsers)

  return (
    <>
      <MTopBar />
      <div style={{ paddingTop: 52, paddingBottom: 104, paddingLeft: 16, paddingRight: 16, fontFamily: M.sans }}>
        {/* Header */}
        <div style={{ paddingTop: 20 }}>
          <div style={{ fontFamily: M.mono, fontSize: 10, color: M.accent, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>
            // Overview
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: M.text, lineHeight: 1.15, letterSpacing: '-.02em', marginBottom: 4 }}>
            Welcome back,<br/>
            <span style={{ color: M.accent }}>{username}</span>
          </h1>
          <div style={{ fontFamily: M.mono, fontSize: 11, color: M.textDim, marginBottom: 22 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Stats 2×2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 26 }}>
          {stats.map(s => (
            <MCard key={s.label} style={{ padding: 14 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 7, marginBottom: 12,
                background: `rgba(${s.rgb},.1)`, border: `1px solid rgba(${s.rgb},.2)`,
                color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{s.icon}</div>
              <div style={{ fontFamily: M.mono, fontSize: 9, color: M.textDim, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: M.mono, fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontFamily: M.mono, fontSize: 9, color: M.textDim }}>{s.sub}</div>
            </MCard>
          ))}
        </div>

        {/* Recent Activity */}
        <div style={{ fontFamily: M.mono, fontSize: 10, color: M.accent, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
          // Recent Activity
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recentRuns.map(r => (
            <MCard key={r.id} style={{ padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <MBadge status={r.status} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: M.text, marginBottom: 3 }}>{r.projectName}</div>
                  <div style={{ fontFamily: M.mono, fontSize: 10, color: M.textDim }}>Run #{r.id.slice(0, 8)}</div>
                  <div style={{ fontFamily: M.mono, fontSize: 10, color: M.textDim }}>{new Date(r.createdAt).toLocaleString()}</div>
                </div>
                <a
                  href={`/m/dashboard/${r.projectSlug}`}
                  style={{
                    fontFamily: M.mono, fontSize: 10, fontWeight: 600, padding: '5px 10px', borderRadius: 6,
                    border: `1px solid rgba(${M.accentRgb},.4)`, background: `rgba(${M.accentRgb},.08)`,
                    color: M.accent, textDecoration: 'none', whiteSpace: 'nowrap',
                  }}
                >View ↗</a>
              </div>
            </MCard>
          ))}
          {recentRuns.length === 0 && (
            <div style={{ fontFamily: M.mono, fontSize: 11, color: M.textDim, textAlign: 'center', padding: '24px 0' }}>
              No runs yet
            </div>
          )}
        </div>
      </div>
      <MBottomTabs />
    </>
  )
}
