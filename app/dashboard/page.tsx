import { auth } from '@/auth'
import { db } from '@/lib/db'
import { projects, testRuns, users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const [projectRows, userRows, runRows] = await Promise.all([
    db.select().from(projects).where(eq(projects.ownerId, userId)),
    db.select().from(users),
    db
      .select({
        id: testRuns.id,
        status: testRuns.status,
        env: testRuns.env,
        passed: testRuns.passed,
        failed: testRuns.failed,
        skipped: testRuns.skipped,
        totalTests: testRuns.totalTests,
        durationMs: testRuns.durationMs,
        createdAt: testRuns.createdAt,
        projectId: testRuns.projectId,
      })
      .from(testRuns)
      .orderBy(desc(testRuns.createdAt))
      .limit(50),
  ])

  const totalRuns = runRows.length
  const passedRuns = runRows.filter(r => r.status === 'passed').length
  const passRate = totalRuns > 0 ? Math.round((passedRuns / totalRuns) * 100) : 0

  const recentRuns = runRows.slice(0, 6)
  const projectMap = new Map(projectRows.map(p => [p.id, p]))

  const passAccent = passRate >= 80 ? 'var(--accent-green)' : passRate >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)'
  const passBorder = passRate >= 80 ? 'rgba(0,229,160,0.3)' : passRate >= 50 ? 'rgba(245,197,24,0.3)' : 'rgba(255,68,68,0.3)'
  const passBg = passRate >= 80 ? 'rgba(0,229,160,0.1)' : passRate >= 50 ? 'rgba(245,197,24,0.1)' : 'rgba(255,68,68,0.1)'

  const stats = [
    {
      label: 'Projects',
      value: projectRows.length,
      color: 'var(--accent-orange)',
      border: 'rgba(249,115,22,0.3)',
      bg: 'rgba(249,115,22,0.1)',
      iconBg: 'rgba(249,115,22,0.15)',
      iconBorder: 'rgba(249,115,22,0.3)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="1.5">
          <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        </svg>
      ),
    },
    {
      label: 'Total Runs',
      value: totalRuns,
      color: 'var(--accent-purple)',
      border: 'rgba(168,85,247,0.3)',
      bg: 'rgba(168,85,247,0.1)',
      iconBg: 'rgba(168,85,247,0.15)',
      iconBorder: 'rgba(168,85,247,0.3)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="1.5">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
    },
    {
      label: 'Pass Rate',
      value: `${passRate}%`,
      color: passAccent,
      border: passBorder,
      bg: passBg,
      iconBg: passBg,
      iconBorder: passBorder,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={passAccent} strokeWidth="1.5">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: 'Active Users',
      value: userRows.length,
      color: 'var(--accent-pink)',
      border: 'rgba(244,114,182,0.3)',
      bg: 'rgba(244,114,182,0.1)',
      iconBg: 'rgba(244,114,182,0.15)',
      iconBorder: 'rgba(244,114,182,0.3)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-pink)" strokeWidth="1.5">
          <circle cx="9" cy="7" r="4" />
          <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
          <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" />
        </svg>
      ),
    },
  ]

  return (
    <div data-testid="dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Header ── */}
      <div data-testid="dashboard-welcome">
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
          // OVERVIEW
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 800, lineHeight: 1.1 }}>
            Welcome back,
          </span>
          <span style={{ color: 'var(--accent-orange)', fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 800, lineHeight: 1.1 }}>
            {session?.user?.name}
          </span>
        </div>
      </div>

      {/* ── Stats row (4 cards) ── */}
      <div
        data-testid="dashboard-stats"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
        }}
        className="dashboard-stats-grid"
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              borderRadius: '20px',
              padding: '20px 20px 22px',
              background: s.bg,
              border: `1px solid ${s.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              minWidth: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
                background: s.iconBg, border: `1px solid ${s.iconBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {s.icon}
              </div>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.label}
              </span>
            </div>
            <div style={{ color: s.color, fontFamily: 'var(--font-mono)', fontSize: '38px', fontWeight: 700, lineHeight: 1 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Activity ── */}
      {recentRuns.length > 0 && (
        <div>
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>
            Recent Activity
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }} className="dashboard-activity-grid">
            {recentRuns.map((run) => {
              const proj = projectMap.get(run.projectId)
              const sColor = run.status === 'passed' ? 'var(--accent-green)' : run.status === 'failed' ? 'var(--accent-red)' : 'var(--accent-yellow)'
              const sBg = run.status === 'passed' ? 'rgba(0,229,160,0.12)' : run.status === 'failed' ? 'rgba(255,68,68,0.12)' : 'rgba(245,197,24,0.12)'
              const sBorder = run.status === 'passed' ? 'rgba(0,229,160,0.35)' : run.status === 'failed' ? 'rgba(255,68,68,0.35)' : 'rgba(245,197,24,0.35)'

              return (
                <div
                  key={run.id}
                  style={{
                    borderRadius: '16px',
                    padding: '16px 18px',
                    background: 'var(--surface-low)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                >
                  {/* Pill badge */}
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700,
                    padding: '5px 12px', borderRadius: '999px', flexShrink: 0,
                    background: sBg, border: `1px solid ${sBorder}`, color: sColor,
                    letterSpacing: '0.08em', whiteSpace: 'nowrap',
                  }}>
                    {run.status.toUpperCase()}
                  </span>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {proj?.name ?? 'Unknown'}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Test run ID: #{run.id.slice(0, 22)}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px', marginTop: '2px' }}>
                      Created {new Date(run.createdAt).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                  </div>

                  {/* View link */}
                  {proj && (
                    <a
                      href={`/dashboard/${proj.slug}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '7px 14px', borderRadius: '10px', flexShrink: 0,
                        background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.22)',
                        color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
                        textDecoration: 'none', whiteSpace: 'nowrap',
                      }}
                    >
                      View
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
