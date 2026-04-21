// Journey section — bilingual
// Exports: JourneySection to window

const { useState } = React;

const nodes = [
  {
    id: 'kiland',
    period: { en: 'Oct 2025 — Present', vi: 'Tháng 10/2025 — Hiện Tại' },
    company: 'KiLand',
    subtitle: { en: 'Freelance', vi: 'Tự do' },
    role: { en: 'QC Engineer (Sole)', vi: 'QC Engineer (Duy Nhất)' },
    badge: { en: 'AI-Powered QA', vi: 'QA Dùng AI' },
    accentVar: 'accent2',
    desc: {
      en: 'Sole QC Engineer for KiLand.com.vn — a B2B SaaS CRM platform for real estate agencies. Built the entire QA process from scratch: test strategy, test plan, and automation framework using modern AI-powered tooling.',
      vi: 'QC Engineer duy nhất cho KiLand.com.vn — nền tảng B2B SaaS CRM cho agency bất động sản. Xây dựng toàn bộ quy trình QC từ đầu: chiến lược test, test plan, automation framework với bộ công cụ AI hiện đại.',
    },
    tags: ['Playwright MCP', 'Cursor AI', 'Claude AI', 'GitHub Actions', 'POM'],
    link: { label: 'KiLand.com.vn', url: 'https://kiland.com.vn' },
    visual: [
      { icon: '⬡', en: { label:'Cursor AI', sub:'Code generation · Refactor' }, vi: { label:'Cursor AI', sub:'Sinh code · Refactor tự động' } },
      { icon: '◈', en: { label:'Claude AI', sub:'Requirement analysis · Test cases' }, vi: { label:'Claude AI', sub:'Phân tích yêu cầu · Sinh test case' } },
      { icon: '▶', en: { label:'Playwright MCP', sub:'E2E automation' }, vi: { label:'Playwright MCP', sub:'Tự động hóa E2E' } },
      { icon: '⚙', en: { label:'GitHub Actions', sub:'CI/CD pipeline' }, vi: { label:'GitHub Actions', sub:'CI/CD pipeline' } },
    ],
    visualLabel: { en:'// AI Stack', vi:'// Bộ Công Cụ AI' },
  },
  {
    id: 'seedcom-senior',
    period: { en: 'Jan 2025 — Oct 2025', vi: 'Tháng 1/2025 — Tháng 10/2025' },
    company: 'Seedcom Food',
    subtitle: { en: 'Seedcom Group', vi: 'Seedcom Group' },
    role: { en: 'Senior QC Engineer', vi: 'Senior QC Engineer' },
    badge: { en: 'Zero Critical Bugs', vi: 'Không Bug Nghiêm Trọng' },
    accentVar: 'accent',
    desc: {
      en: 'Implemented Playwright automation reducing regression effort by ~40%. End-to-end quality ownership across 4 core modules: HRM, E-Signature, Recruitment, and Payroll on the Odoo platform.',
      vi: 'Triển khai Playwright automation giảm ~40% công effort regression. Phụ trách chất lượng E2E cho 4 module cốt lõi: HRM, E-Signature, Tuyển dụng, Lương thưởng trên nền tảng Odoo.',
    },
    tags: ['Playwright', 'Odoo', 'E2E', 'Regression', 'Integration', 'API Testing'],
    link: { label: 'Sieuthisi.vn', url: 'https://sieuthisi.vn' },
    metrics: [
      { en:{ label:'Regression effort', value:'−40%' }, vi:{ label:'Giảm công regression', value:'−40%' } },
      { en:{ label:'Critical bugs in prod', value:'0' }, vi:{ label:'Bug nghiêm trọng lọt prod', value:'0' } },
      { en:{ label:'Modules covered', value:'4' },       vi:{ label:'Module phụ trách', value:'4' } },
      { en:{ label:'Systems integrated', value:'5+' },   vi:{ label:'Hệ thống tích hợp', value:'5+' } },
    ],
    metricsLabel: { en:'// QA Metrics', vi:'// Chỉ Số QA' },
  },
  {
    id: 'qc-lead',
    period: { en: 'Jan 2024 — Dec 2024', vi: 'Tháng 1/2024 — Tháng 12/2024' },
    company: 'Seedcom Food',
    subtitle: { en: 'Seedcom Group', vi: 'Seedcom Group' },
    role: { en: 'QC Lead (+ Senior QCE)', vi: 'QC Lead (kiêm Senior QCE)' },
    badge: { en: '95%+ On-time', vi: '95%+ Đúng Hạn' },
    accentVar: 'accent',
    desc: {
      en: 'Led the QC team at Seedcom Food with 95%+ on-time delivery rate. Built a KPI dashboard for quality tracking. Concurrently contributed as Senior QCE for sieuthisi.vn.',
      vi: 'Dẫn dắt QC team Seedcom Food — tỷ lệ đúng hạn 95%+. Xây dựng KPI dashboard theo dõi chất lượng. Tham gia với vai trò Senior QCE cho sieuthisi.vn.',
    },
    tags: ['Jira', 'KPI Dashboard', 'Test Strategy', 'Team Lead'],
    link: { label: 'Sieuthisi.vn', url: 'https://sieuthisi.vn' },
  },
  {
    id: 'haravan-specialist',
    period: { en: 'Mar 2022 — Dec 2023', vi: 'Tháng 3/2022 — Tháng 12/2023' },
    company: 'Haravan',
    subtitle: { en: 'Seedcom Group', vi: 'Seedcom Group' },
    role: { en: 'QC Specialist', vi: 'QC Specialist' },
    badge: { en: '−25% Triage Time', vi: '−25% Thời Gian Triage' },
    accentVar: 'accent3',
    desc: {
      en: 'Improved triage and cross-module testing on Haraworks.vn. Owned integration testing across complex modules: HRM, BPM, IoT, SCM, CRM, and external systems (Acumatica ERP, WMS, GHN).',
      vi: 'Cải thiện quy trình triage và cross-module testing trên Haraworks.vn. Phụ trách kiểm thử tích hợp giữa các module phức tạp: HRM, BPM, IoT, SCM, CRM và hệ thống ngoài (Acumatica ERP, WMS, GHN).',
    },
    tags: ['HRM', 'BPM', 'IoT', 'SCM', 'Postman', 'Jira'],
    link: { label: 'Haraworks.vn', url: 'https://like.haraworks.vn' },
  },
  {
    id: 'haravan-engineer',
    period: { en: 'Jan 2019 — Feb 2022', vi: 'Tháng 1/2019 — Tháng 2/2022' },
    company: 'Haravan',
    subtitle: { en: 'Seedcom Group', vi: 'Seedcom Group' },
    role: { en: 'QC Engineer', vi: 'QC Engineer' },
    badge: { en: 'Day One', vi: 'Ngày Đầu Tiên' },
    accentVar: 'accent3',
    desc: {
      en: 'Joined from day one to build Haraworks.vn — serving GHN (11,000+ employees), The Coffee House (~100 stores), CellphoneS, and JUNO. Built test plans, test cases, and checklists from scratch.',
      vi: 'Tham gia từ ngày đầu xây dựng Haraworks.vn phục vụ GHN (11.000+ nhân viên), The Coffee House (~100 cửa hàng), CellphoneS, JUNO. Xây dựng test plan, test case, checklist từ con số không.',
    },
    tags: ['Manual Testing', 'Test Planning', 'Checklist', 'Regression'],
    link: { label: 'Haraworks.vn', url: 'https://like.haraworks.vn' },
    award: {
      en: { title: 'Employee of the Year 2019', note: 'Outstanding contribution to product quality and cross-team collaboration' },
      vi: { title: 'Nhân Viên Xuất Sắc Năm 2019', note: 'Ghi nhận đóng góp nổi bật cho chất lượng sản phẩm và phối hợp liên nhóm' },
    },
  },
];

function NodeCard({ node, isOpen, onToggle, lang }) {
  const l = lang || 'en';
  const acc = `var(--${node.accentVar})`;
  const rgb = `var(--${node.accentVar}-rgb)`;

  return (
    <div style={{ background:'var(--surface-2)', border:`1px solid ${isOpen ? `rgba(${rgb},0.25)` : 'var(--border)'}`, borderRadius:'10px', overflow:'hidden', transition:'border-color 0.2s', cursor:'pointer' }} onClick={onToggle}>
      <div style={{ height:'2px', background:`linear-gradient(90deg, ${acc}, transparent 70%)` }} />
      <div style={{ padding:'14px 16px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'10px' }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap', marginBottom:'4px' }}>
              <span style={{ fontWeight:700, fontSize:'15px', color:'var(--text-primary)' }}>{node.company}</span>
              <span style={{ fontFamily:'var(--mono)', fontSize:'9px', color:'var(--text-dim)' }}>{node.subtitle[l]}</span>
              <span style={{ fontFamily:'var(--mono)', fontSize:'8px', padding:'2px 7px', borderRadius:'4px', background:`rgba(${rgb},0.1)`, border:`1px solid rgba(${rgb},0.25)`, color:acc }}>{node.badge[l]}</span>
            </div>
            <div style={{ fontFamily:'var(--mono)', fontSize:'11px', color:acc, marginBottom:'2px' }}>{node.role[l]}</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)' }}>{node.period[l]}</div>
          </div>
          <div style={{ fontFamily:'var(--mono)', fontSize:'16px', color:'var(--text-dim)', transition:'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>⌄</div>
        </div>

        {isOpen && (
          <div style={{ marginTop:'14px', borderTop:'1px solid var(--border)', paddingTop:'14px' }}>
            <p style={{ fontSize:'12px', color:'var(--text-secondary)', lineHeight:1.7, marginBottom:'14px' }}>{node.desc[l]}</p>

            {/* AI Stack visual */}
            {node.visual && (
              <div style={{ marginBottom:'14px' }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:'9px', color:acc, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px' }}>{node.visualLabel[l]}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  {node.visual.map(v => (
                    <div key={v[l].label} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'7px 10px', borderRadius:'6px', background:`rgba(${rgb},0.05)`, border:`1px solid rgba(${rgb},0.12)` }}>
                      <span style={{ fontFamily:'var(--mono)', fontSize:'12px', color:acc }}>{v.icon}</span>
                      <div>
                        <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-primary)', fontWeight:600 }}>{v[l].label}</div>
                        <div style={{ fontFamily:'var(--mono)', fontSize:'9px', color:'var(--text-dim)' }}>{v[l].sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics */}
            {node.metrics && (
              <div style={{ marginBottom:'14px' }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:'9px', color:acc, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px' }}>{node.metricsLabel[l]}</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'6px' }}>
                  {node.metrics.map((m,i) => (
                    <div key={i} style={{ padding:'8px 10px', borderRadius:'6px', background:'var(--surface-3)', border:'1px solid var(--border)' }}>
                      <div style={{ fontFamily:'var(--mono)', fontSize:'14px', fontWeight:700, color:acc }}>{m[l].value}</div>
                      <div style={{ fontFamily:'var(--mono)', fontSize:'9px', color:'var(--text-dim)' }}>{m[l].label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Award */}
            {node.award && (
              <div style={{ display:'flex', gap:'10px', padding:'10px 12px', borderRadius:'6px', marginBottom:'12px', background:'rgba(var(--warn-rgb),0.05)', border:'1px solid rgba(var(--warn-rgb),0.15)' }}>
                <span style={{ color:'var(--warn)', fontSize:'14px' }}>★</span>
                <div>
                  <div style={{ fontFamily:'var(--mono)', fontSize:'10px', fontWeight:600, color:'var(--warn)' }}>{node.award[l].title}</div>
                  <div style={{ fontFamily:'var(--mono)', fontSize:'9px', color:'var(--text-dim)', marginTop:'2px' }}>{node.award[l].note}</div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:'5px', marginBottom:'10px' }}>
              {node.tags.map(t => <span key={t} style={{ fontFamily:'var(--mono)', fontSize:'9px', padding:'3px 8px', borderRadius:'4px', background:'var(--surface-3)', border:'1px solid var(--border)', color:'var(--text-dim)' }}>{t}</span>)}
            </div>

            {node.link && (
              <a href={node.link.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                style={{ fontFamily:'var(--mono)', fontSize:'10px', color:acc, textDecoration:'none' }}
                onMouseEnter={e => e.currentTarget.style.opacity='0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity='1'}
              >{node.link.label} ↗</a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function JourneySection({ lang }) {
  const [openId, setOpenId] = useState('kiland');
  const l = lang || 'en';
  const T = {
    en: { eyebrow:'// Professional Journey', title:'7 Years in QA', desc:'From day-one manual tester to AI-powered automation — building quality across three enterprise platforms.' },
    vi: { eyebrow:'// Hành Trình Nghề Nghiệp', title:'7 Năm Trong Nghề', desc:'Từ QC Engineer ngày đầu đến tự động hóa AI — xây dựng chất lượng trên ba nền tảng enterprise.' },
  }[l];

  return (
    <section id="journey" style={{ padding:'48px 0' }}>
      <div style={{ marginBottom:'28px' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>{T.eyebrow}</div>
        <h2 style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text-primary)', marginBottom:'8px' }}>{T.title}</h2>
        <p style={{ fontSize:'13px', color:'var(--text-secondary)', lineHeight:1.6, maxWidth:'520px' }}>{T.desc}</p>
      </div>

      <div style={{ position:'relative', paddingLeft:'24px' }}>
        <div style={{ position:'absolute', left:'5px', top:0, bottom:0, width:'1px', background:'linear-gradient(180deg, var(--accent2), var(--accent) 40%, var(--accent3))', opacity:0.3 }} />
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {nodes.map(node => (
            <div key={node.id} style={{ position:'relative' }}>
              <div style={{
                position:'absolute', left:'-20px', top:'20px', width:'10px', height:'10px', borderRadius:'50%',
                border:`2px solid var(--${node.accentVar})`,
                background: openId===node.id ? `var(--${node.accentVar})` : 'var(--surface-1)',
                boxShadow: openId===node.id ? `0 0 10px rgba(var(--${node.accentVar}-rgb),0.6)` : 'none',
                transition:'all 0.3s', zIndex:1,
              }} />
              <NodeCard node={node} isOpen={openId===node.id} onToggle={() => setOpenId(openId===node.id ? null : node.id)} lang={l} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { JourneySection });
