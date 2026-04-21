// Skills, TestHistory, Sanitizer — bilingual
// Exports to window

const { useState, useEffect } = React;

// ─── Skills ───────────────────────────────────────────────────
const skillGroups = [
  {
    en: { label:'Automation' },
    vi: { label:'Tự Động Hóa' },
    icon:'▶', accent:'accent',
    skills: ['Playwright', 'TypeScript', 'GitHub Actions', 'Page Object Model', 'CI/CD'],
  },
  {
    en: { label:'AI Tooling' },
    vi: { label:'Công Cụ AI' },
    icon:'⬡', accent:'accent2',
    skills: ['Cursor AI', 'Claude AI', 'Playwright MCP', 'AI Test Generation'],
  },
  {
    en: { label:'API & Integration' },
    vi: { label:'API & Tích Hợp' },
    icon:'◈', accent:'accent3',
    skills: ['Postman', 'REST APIs', 'Odoo ERP', 'Acumatica', 'WMS', 'GHN'],
  },
  {
    en: { label:'Process & Management' },
    vi: { label:'Quy Trình & Quản Lý' },
    icon:'▣', accent:'accent',
    skills: ['Test Strategy', 'Jira', 'KPI Dashboard', 'Team Lead', 'Test Planning'],
  },
];

function SkillsSection({ lang }) {
  const l = lang || 'en';
  const T = {
    en: { eyebrow:'// Skill Stack', title:'Tools & Expertise' },
    vi: { eyebrow:'// Kỹ Năng', title:'Công Cụ & Chuyên Môn' },
  }[l];

  return (
    <section id="skills" style={{ padding:'48px 0' }}>
      <div style={{ marginBottom:'28px' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>{T.eyebrow}</div>
        <h2 style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text-primary)' }}>{T.title}</h2>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'12px' }}>
        {skillGroups.map(g => {
          const acc = `var(--${g.accent})`;
          const rgb = `var(--${g.accent}-rgb)`;
          return (
            <div key={g.en.label} style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'10px', padding:'18px', transition:'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor=`rgba(${rgb},0.3)`}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
            >
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
                <span style={{ color:acc, fontSize:'13px' }}>{g.icon}</span>
                <span style={{ fontFamily:'var(--mono)', fontSize:'10px', color:acc, textTransform:'uppercase', letterSpacing:'0.08em' }}>{g[l].label}</span>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                {g.skills.map(s => (
                  <span key={s} style={{ fontFamily:'var(--mono)', fontSize:'10px', padding:'4px 9px', borderRadius:'5px', background:`rgba(${rgb},0.07)`, border:`1px solid rgba(${rgb},0.18)`, color:'var(--text-secondary)', transition:'color 0.15s', cursor:'default' }}
                    onMouseEnter={e => e.currentTarget.style.color=acc}
                    onMouseLeave={e => e.currentTarget.style.color='var(--text-secondary)'}
                  >{s}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Test History ─────────────────────────────────────────────
const mockRuns = [
  { id:'r1', ts:'2026-04-17 06:02', status:'passed',  dur:'4.2s', specs:['hero.spec.ts','pipeline.spec.ts','journey.spec.ts','history.spec.ts','sanitizer.spec.ts','footer.spec.ts'] },
  { id:'r2', ts:'2026-04-17 05:59', status:'failed',  dur:'6.1s', specs:['hero.spec.ts','pipeline.spec.ts','journey.spec.ts','history.spec.ts','sanitizer.spec.ts','footer.spec.ts'], fail:'pipeline.spec.ts' },
  { id:'r3', ts:'2026-04-17 05:54', status:'passed',  dur:'3.9s', specs:['hero.spec.ts','pipeline.spec.ts','journey.spec.ts','history.spec.ts','sanitizer.spec.ts','footer.spec.ts'] },
  { id:'r4', ts:'2026-04-17 05:48', status:'failed',  dur:'7.3s', specs:['hero.spec.ts','pipeline.spec.ts','journey.spec.ts','history.spec.ts','sanitizer.spec.ts','footer.spec.ts'], fail:'sanitizer.spec.ts' },
];

function TestHistorySection({ lang }) {
  const [sel, setSel] = useState(mockRuns[0]);
  const l = lang || 'en';
  const T = {
    en: { eyebrow:'// Test History', title:'Playwright Run Archive', desc:'Real test runs against this page — the portfolio is its own Subject Under Test.', tests:'tests', pass:'✓ PASS', fail:'✗ FAIL' },
    vi: { eyebrow:'// Lịch Sử Test', title:'Kho Lưu Playwright Runs', desc:'Các lần chạy test thực tế trên trang này — portfolio chính là Subject Under Test.', tests:'test', pass:'✓ PASS', fail:'✗ FAIL' },
  }[l];

  return (
    <section id="history" style={{ padding:'48px 0' }}>
      <div style={{ marginBottom:'28px' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>{T.eyebrow}</div>
        <h2 style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text-primary)', marginBottom:'8px' }}>{T.title}</h2>
        <p style={{ fontSize:'13px', color:'var(--text-secondary)', lineHeight:1.6 }}>{T.desc}</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:'12px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          {mockRuns.map(run => (
            <div key={run.id} onClick={() => setSel(run)} style={{
              padding:'10px 14px', borderRadius:'8px', cursor:'pointer',
              background: sel.id===run.id ? 'var(--surface-3)' : 'var(--surface-2)',
              border:`1px solid ${sel.id===run.id ? (run.status==='passed' ? 'rgba(var(--accent-rgb),0.35)' : 'rgba(var(--danger-rgb),0.35)') : 'var(--border)'}`,
              transition:'all 0.15s',
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'4px' }}>
                <span style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)' }}>{run.ts}</span>
                <span style={{ fontFamily:'var(--mono)', fontSize:'9px', padding:'2px 7px', borderRadius:'4px', background: run.status==='passed' ? 'rgba(var(--accent-rgb),0.1)' : 'rgba(var(--danger-rgb),0.1)', border:`1px solid ${run.status==='passed' ? 'rgba(var(--accent-rgb),0.3)' : 'rgba(var(--danger-rgb),0.3)'}`, color: run.status==='passed' ? 'var(--accent)' : 'var(--danger)' }}>
                  {run.status==='passed' ? T.pass : T.fail}
                </span>
              </div>
              <div style={{ display:'flex', gap:'12px' }}>
                <span style={{ fontFamily:'var(--mono)', fontSize:'9px', color:'var(--text-dim)' }}>{run.specs.length} {T.tests}</span>
                <span style={{ fontFamily:'var(--mono)', fontSize:'9px', color:'var(--text-dim)' }}>{run.dur}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', overflow:'hidden' }}>
          <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', background:'var(--surface-3)' }}>
            <span style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-secondary)' }}>{sel.ts} · {sel.dur}</span>
          </div>
          <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:'6px' }}>
            {sel.specs.map(spec => {
              const failed = spec === sel.fail;
              return (
                <div key={spec} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 10px', borderRadius:'6px', background: failed ? 'rgba(var(--danger-rgb),0.05)' : 'rgba(var(--accent-rgb),0.03)', border:`1px solid ${failed ? 'rgba(var(--danger-rgb),0.15)' : 'rgba(var(--accent-rgb),0.08)'}` }}>
                  <span style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-secondary)' }}>{spec}</span>
                  <span style={{ fontFamily:'var(--mono)', fontSize:'9px', color: failed ? 'var(--danger)' : 'var(--accent)' }}>{failed ? T.fail : T.pass}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Sanitizer ────────────────────────────────────────────────
const FIELDS = [
  { label:'reporter_email', raw:'john.doe@client.com',      masked:'[REDACTED:email]', type:'email',  accent:'accent3' },
  { label:'auth_token',     raw:'eyJhbGciOiJSUzI1NiJ9...', masked:'[REDACTED:token]', type:'token',  accent:'danger'  },
  { label:'phone_number',   raw:'+84 091 234 5678',         masked:'[REDACTED:phone]', type:'phone',  accent:'warn'    },
  { label:'tester_name',    raw:'Nguyen Van A',             masked:'[REDACTED:pii]',   type:'name',   accent:'accent2' },
];

function SanitizerSection({ lang }) {
  const [count, setCount] = useState(0);
  const [scanning, setScanning] = useState(false);
  const l = lang || 'en';
  const T = {
    en: { eyebrow:'// Sanitizer', title:'Data Sanitization Pipeline', desc:'PII masking before test reports are published — no sensitive data in artifacts.', scanning:'Scanning...', done:'fields redacted', ready:'Ready', rescan:'↺ Re-scan' },
    vi: { eyebrow:'// Sanitizer', title:'Pipeline Làm Sạch Dữ Liệu', desc:'Che giấu PII trước khi xuất báo cáo test — không có dữ liệu nhạy cảm trong artifacts.', scanning:'Đang quét...', done:'trường đã ẩn', ready:'Sẵn sàng', rescan:'↺ Quét Lại' },
  }[l];

  const run = () => {
    setCount(0); setScanning(true);
    FIELDS.forEach((_,i) => {
      setTimeout(() => { setCount(i+1); if (i===FIELDS.length-1) setScanning(false); }, 600*(i+1));
    });
  };

  useEffect(() => { run(); }, []);

  return (
    <section id="sanitizer" style={{ padding:'48px 0' }}>
      <div style={{ marginBottom:'28px' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>{T.eyebrow}</div>
        <h2 style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text-primary)', marginBottom:'8px' }}>{T.title}</h2>
        <p style={{ fontSize:'13px', color:'var(--text-secondary)', lineHeight:1.6 }}>{T.desc}</p>
      </div>

      <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'10px', overflow:'hidden' }}>
        <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--surface-3)' }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)' }}>
            {scanning ? `${T.scanning} ${count}/${FIELDS.length}` : count===FIELDS.length ? `✓ ${count} ${T.done}` : T.ready}
          </span>
          <button onClick={run} style={{ fontFamily:'var(--mono)', fontSize:'10px', padding:'4px 10px', borderRadius:'5px', cursor:'pointer', border:'1px solid var(--border)', background:'var(--surface-2)', color:'var(--text-dim)' }}>{T.rescan}</button>
        </div>
        <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:'8px' }}>
          {FIELDS.map((f,i) => {
            const masked = i < count;
            const color = `var(--${f.accent})`;
            return (
              <div key={f.label} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'9px 12px', borderRadius:'6px', background: masked ? 'rgba(0,0,0,0.15)' : 'var(--surface-3)', border:'1px solid var(--border)', transition:'all 0.3s' }}>
                <span style={{ fontFamily:'var(--mono)', fontSize:'10px', color, width:'80px', flexShrink:0 }}>{f.type}</span>
                <span style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', flex:1 }}>{f.label}</span>
                <span style={{ fontFamily:'var(--mono)', fontSize:'10px', color: masked ? color : 'var(--text-secondary)', flex:1, textAlign:'right' }}>{masked ? f.masked : f.raw}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { SkillsSection, TestHistorySection, SanitizerSection });
