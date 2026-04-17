'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

/* ── Timeline nodes (mới → cũ) ───────────────────────────────── */

const nodes = [
  {
    id: 'kiland',
    year: 'Oct 2025',
    yearSub: 'Hiện tại',
    company: 'KiLand',
    subtitle: 'Freelance · Phát triển bản thân',
    role: 'QC Engineer (Sole)',
    highlight: 'AI-Powered QA',
    accent: 'var(--accent-purple)',
    accentRgb: '192,132,252',
    note: 'Freelance',
    desc: 'QC Engineer duy nhất cho KiLand.com.vn — nền tảng B2B SaaS giúp các agency bất động sản quản lý CRM, danh mục sản phẩm, hiệu suất nhóm và báo cáo thời gian thực. Xây dựng toàn bộ quy trình QC từ đầu: chiến lược test, test plan, automation framework. Ứng dụng bộ công cụ AI-powered QA hiện đại.',
    tags: ['Playwright MCP', 'Cursor AI', 'Claude AI', 'GitHub Actions', 'POM'],
    project: { name: 'KiLand.com.vn', url: 'https://kiland.com.vn' },
    visual: 'kiland',
  },
  {
    id: 'seedcom-senior',
    year: 'Jan 2025',
    yearSub: 'Oct 2025',
    company: 'Seedcom Food',
    subtitle: 'Seedcom Group',
    role: 'Senior QC Engineer',
    highlight: 'Zero Critical Bugs',
    accent: 'var(--accent-cyan)',
    accentRgb: '0,229,255',
    note: 'Playwright automation · Giảm 40% regression',
    desc: 'Triển khai Playwright automation giảm ~40% công effort regression. Phụ trách chất lượng E2E cho 4 module cốt lõi: HRM, E-Signature, Tuyển dụng, Lương thưởng trên nền tảng siêu thị Odoo.',
    tags: ['Playwright', 'Odoo', 'E2E', 'Regression', 'Integration', 'API Testing'],
    project: { name: 'Sieuthisi.vn', url: 'https://sieuthisi.vn' },
    visual: 'pipeline',
  },
  {
    id: 'qc-lead',
    year: 'Jan 2024',
    yearSub: 'Dec 2024',
    company: 'Seedcom Food',
    subtitle: 'Seedcom Group',
    role: 'QC Lead (kiêm Senior QCE)',
    highlight: '95%+ On-time',
    accent: 'var(--accent-cyan)',
    accentRgb: '0,229,255',
    //note: 'Kiêm nhiệm song song hai đơn vị',
    desc: 'Dẫn dắt QC team QC của Seedcom Food. Tỷ lệ đúng hạn 95%+, xây dựng KPI dashboard theo dõi chất lượng. Tham gia với vai trò Senior QCE cho sieuthisi.vn.',
    tags: ['Jira', 'KPI Dashboard', 'Test Strategy', 'Team Lead'],
    project: { name: 'Sieuthisi.vn', url: 'https://sieuthisi.vn' },
    visual: null,
  },
  {
    id: 'haravan-specialist',
    year: 'Mar 2022',
    yearSub: 'Dec 2023',
    company: 'Haravan',
    subtitle: 'Seedcom Group',
    role: 'QC Specialist',
    highlight: '-25% Triage Time',
    accent: 'var(--accent-blue)',
    accentRgb: '96,165,250',
    note: 'Rút ngắn 25% thời gian triage · Tích hợp đa module',
    desc: 'Cải thiện quy trình triage và cross-module testing trên Haraworks.vn. Phụ trách kiểm thử tích hợp giữa các module phức tạp: HRM, BPM, IoT, SCM, CRM và hệ thống ngoài (Acumatica ERP, WMS, GHN).',
    tags: ['HRM', 'BPM', 'IoT', 'SCM', 'Postman', 'Jira'],
    project: { name: 'Haraworks.vn', url: 'https://like.haraworks.vn' },
    visual: 'metrics',
  },
  {
    id: 'haravan-engineer',
    year: 'Jan 2019',
    yearSub: 'Feb 2022',
    company: 'Haravan',
    subtitle: 'Seedcom Group',
    role: 'QC Engineer',
    highlight: 'Day One',
    accent: 'var(--accent-blue)',
    accentRgb: '96,165,250',
    note: 'Ngày đầu tiên · 6 module · Xây QA process từ đầu',
    desc: 'Tham gia từ ngày đầu xây dựng Haraworks.vn phục vụ GHN (11.000+ nhân viên), The Coffee House (~100 cửa hàng), CellphoneS, JUNO. Xây dựng test plan, test case, checklist từ con số không.',
    tags: ['Manual Testing', 'Test Planning', 'Checklist', 'Regression'],
    project: { name: 'Haraworks.vn', url: 'https://like.haraworks.vn' },
    visual: null,
    award: { title: 'Nhân viên xuất sắc năm 2019', note: 'Ghi nhận đóng góp nổi bật cho chất lượng sản phẩm và phối hợp liên nhóm' },
  },
]

/* ── Visual panels ────────────────────────────────────────────── */

function KiLandVisual({ accent, accentRgb }: { accent: string; accentRgb: string }) {
  const stack = [
    { label: 'Cursor AI', role: 'Sinh test code · Refactor tự động', icon: '⬡' },
    { label: 'Claude AI', role: 'Phân tích yêu cầu · Sinh test case', icon: '◈' },
    { label: 'Playwright MCP', role: 'Tự động hóa E2E trên web', icon: '▶' },
    { label: 'GitHub Actions', role: 'CI/CD pipeline', icon: '⚙' },
  ]
  return (
    <div className="flex flex-col gap-2 mt-3">
      <div className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: accent }}>
        // AI STACK
      </div>
      {stack.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="flex items-center gap-2.5 p-2 rounded"
          style={{ background: `rgba(${accentRgb},0.04)`, border: `1px solid rgba(${accentRgb},0.1)` }}
        >
          <span className="font-mono text-xs shrink-0" style={{ color: accent }}>{s.icon}</span>
          <div>
            <div className="font-mono text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>{s.label}</div>
            <div className="font-mono text-[8px]" style={{ color: 'var(--text-muted)' }}>{s.role}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function PipelineVisual({ accent }: { accent: string; accentRgb?: string }) {
  const rows = [
    { label: 'Test Suite', value: 'PASS', color: 'var(--accent-green)' },
    { label: 'Bug nghiêm trọng', value: '0 lọt prod', color: 'var(--accent-green)' },
    { label: 'Regression', value: 'Giảm 40%', color: accent },
    { label: 'Tích hợp', value: '5+ hệ thống', color: accent },
  ]
  return (
    <div className="flex flex-col gap-2 mt-3">
      <div className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: accent }}>
        // QA METRICS
      </div>
      {rows.map((row, i) => (
        <motion.div
          key={row.label}
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.07, duration: 0.3 }}
          className="flex items-center justify-between px-2 py-1.5 rounded"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{row.label}</span>
          <span className="font-mono text-[10px] font-medium" style={{ color: row.color }}>{row.value}</span>
        </motion.div>
      ))}
    </div>
  )
}

function MiniDonut({ pct, accent, accentRgb }: { pct: number; accent: string; accentRgb: string }) {
  const r = 18, circ = 2 * Math.PI * r
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
      <circle cx="22" cy="22" r={r} fill="none" stroke={`rgba(${accentRgb},0.12)`} strokeWidth="4" />
      <motion.circle
        cx="22" cy="22" r={r} fill="none"
        stroke={accent} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        whileInView={{ strokeDashoffset: circ - (pct / 100) * circ }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, delay: 0.2, ease: 'easeOut' }}
        style={{ transformOrigin: '22px 22px', rotate: '-90deg' }}
      />
      <text x="22" y="26" textAnchor="middle" fontSize="9" fontFamily="monospace" fill={accent} fontWeight="700">
        {pct}%
      </text>
    </svg>
  )
}

function MetricsVisual({ accent, accentRgb }: { accent: string; accentRgb: string }) {
  const cards = [
    { icon: '▣', title: 'Tỷ lệ bắt bug', sub: 'Trước khi release', pct: 92 },
    { icon: '⬡', title: 'Độ phủ test', sub: 'Web + Mobile · 8 mod', pct: 78 },
  ]
  return (
    <div className="flex flex-col gap-2 mt-3">
      <div className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: accent }}>
        // QA IMPACT
      </div>
      <div className="grid grid-cols-2 gap-2">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.09, duration: 0.3 }}
            className="rounded p-2.5 flex flex-col gap-1.5"
            style={{ background: `rgba(${accentRgb},0.04)`, border: `1px solid rgba(${accentRgb},0.1)` }}
          >
            <div className="flex items-center justify-between gap-1">
              <div className="font-mono text-[8px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                {c.icon} {c.title}
              </div>
              <MiniDonut pct={c.pct} accent={accent} accentRgb={accentRgb} />
            </div>
            <div className="font-mono text-[8px]" style={{ color: 'var(--text-muted)' }}>{c.sub}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ── Timeline node card ───────────────────────────────────────── */

function TimelineNode({ node, index }: { node: typeof nodes[0]; index: number }) {
  const isLeft = index % 2 === 0

  return (
    <div className="relative flex items-start gap-0 min-h-0">

      {/* ── Desktop: Left side content ── */}
      <div className="hidden lg:flex flex-1 justify-end pr-8 pt-1 self-start">
        {isLeft ? (
          <NodeCard node={node} />
        ) : (
          <YearLabel node={node} align="right" />
        )}
      </div>

      {/* ── Center: dot ── */}
      <div className="flex flex-col items-center shrink-0 z-10 self-start pt-1">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, ease: 'backOut' }}
          className="w-3 h-3 rounded-full border-2 flex items-center justify-center"
          style={{
            borderColor: node.accent,
            background: 'var(--surface-lowest)',
            boxShadow: `0 0 12px rgba(${node.accentRgb},0.5), 0 0 24px rgba(${node.accentRgb},0.2)`,
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: node.accent }} />
        </motion.div>
      </div>

      {/* ── Desktop: Right side content ── */}
      <div className="hidden lg:flex flex-1 pl-8 pt-1 self-start">
        {isLeft ? (
          <YearLabel node={node} align="left" />
        ) : (
          <NodeCard node={node} />
        )}
      </div>

      {/* ── Mobile: always right ── */}
      <div className="lg:hidden flex-1 pl-5 pt-0">
        <div className="mb-2">
          <YearLabel node={node} align="left" />
        </div>
        <NodeCard node={node} />
      </div>

    </div>
  )
}

function YearLabel({ node, align }: { node: typeof nodes[0]; align: 'left' | 'right' }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: align === 'left' ? -12 : 12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className={`flex flex-col ${align === 'right' ? 'items-end' : 'items-start'}`}
    >
      <span
        className="font-mono font-bold leading-none"
        style={{
          fontSize: '1.75rem',
          color: node.accent,
          textShadow: `0 0 20px rgba(${node.accentRgb},0.6), 0 0 40px rgba(${node.accentRgb},0.25)`,
          letterSpacing: '-0.02em',
        }}
      >
        {node.year}
      </span>
      <span className="font-mono text-[10px] mt-0.5" style={{ color: `rgba(${node.accentRgb},0.5)` }}>
        → {node.yearSub}
      </span>
    </motion.div>
  )
}

function NodeCard({ node }: { node: typeof nodes[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md rounded-xl overflow-hidden"
      style={{
        background: 'var(--surface-low)',
        border: `1px solid rgba(${node.accentRgb},0.12)`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 1px rgba(${node.accentRgb},0.2)`,
      }}
    >
      {/* Accent top line */}
      <div className="h-px" style={{ background: `linear-gradient(90deg, ${node.accent}, transparent 70%)` }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-bold text-base" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {node.company}
          </span>
          <span className="font-mono text-[9px]" style={{ color: 'var(--text-muted)' }}>{node.subtitle}</span>
          <span
            className="font-mono text-[8px] px-1.5 py-0.5 rounded"
            style={{
              background: `rgba(${node.accentRgb},0.08)`,
              border: `1px solid rgba(${node.accentRgb},0.2)`,
              color: node.accent,
            }}
          >
            {node.highlight}
          </span>
        </div>

        {/* Role */}
        <div className="font-mono text-[11px] font-medium mb-1" style={{ color: node.accent }}>
          {node.role}
        </div>
        <div className="font-mono text-[9px] mb-3" style={{ color: 'var(--text-muted)' }}>{node.note}</div>

        {/* Description */}
        <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{node.desc}</p>

        {/* Visual panel */}
        {node.visual === 'kiland' && <KiLandVisual accent={node.accent} accentRgb={node.accentRgb} />}
        {node.visual === 'pipeline' && <PipelineVisual accent={node.accent} accentRgb={node.accentRgb} />}
        {node.visual === 'metrics' && <MetricsVisual accent={node.accent} accentRgb={node.accentRgb} />}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {node.tags.map(t => (
            <span key={t} className="font-mono text-[8px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-high)', color: 'var(--text-muted)' }}>
              {t}
            </span>
          ))}
        </div>

        {/* Project link */}
        {node.project && (
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-ghost)' }}>
            <a
              href={node.project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] font-medium"
              style={{ color: node.accent }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.7' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              {node.project.name} ↗
            </a>
          </div>
        )}

        {/* Award */}
        {'award' in node && node.award && (
          <div
            className="flex items-start gap-2 p-2.5 rounded mt-3"
            style={{ background: 'rgba(245,197,24,0.05)', border: '1px solid rgba(245,197,24,0.15)' }}
          >
            <span style={{ color: 'var(--accent-yellow)', fontSize: '12px' }}>★</span>
            <div>
              <div className="font-mono text-[10px] font-medium" style={{ color: 'var(--accent-yellow)' }}>
                {node.award.title}
              </div>
              <div className="font-mono text-[8px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{node.award.note}</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ── Main component ───────────────────────────────────────────── */

export default function JourneySection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 20%'],
  })
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section id="journey" data-testid="journey-section" className="py-20 px-4 max-w-5xl mx-auto w-full">

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <div className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--accent-cyan)' }}>
          // PROFESSIONAL JOURNEY
        </div>
        <h2
          data-testid="journey-heading"
          className="text-3xl font-bold mb-3"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
        >
          7 Năm Trong Nghề
        </h2>
        <p className="text-sm max-w-lg" style={{ color: 'var(--text-secondary)' }}>
          Từ QC Engineer ngày đầu đến AI-powered automation — hành trình xây dựng chất lượng trên ba nền tảng enterprise.
        </p>
      </motion.div>

      {/* Timeline */}
      <div ref={containerRef} className="relative">

        {/* Background line — desktop */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden lg:block"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        />
        {/* Background line — mobile */}
        <div
          className="absolute left-[5px] top-0 bottom-0 w-px lg:hidden"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        />

        {/* Scroll-fill line — desktop */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden lg:block overflow-hidden">
          <motion.div
            className="w-full origin-top"
            style={{
              height: lineHeight,
              background: 'linear-gradient(180deg, var(--accent-purple), var(--accent-cyan) 40%, var(--accent-blue))',
              opacity: 0.6,
            }}
          />
        </div>
        {/* Scroll-fill line — mobile */}
        <div className="absolute left-[5px] top-0 bottom-0 w-px overflow-hidden lg:hidden">
          <motion.div
            className="w-full origin-top"
            style={{
              height: lineHeight,
              background: 'linear-gradient(180deg, var(--accent-purple), var(--accent-cyan) 40%, var(--accent-blue))',
              opacity: 0.6,
            }}
          />
        </div>

        {/* Nodes */}
        <div className="flex flex-col gap-14">
          {nodes.map((node, i) => (
            <TimelineNode key={node.id} node={node} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}
