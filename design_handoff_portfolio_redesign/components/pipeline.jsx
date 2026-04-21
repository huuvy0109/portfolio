// Pipeline section — bilingual
// Exports: PipelineSection, usePipeline to window

const { useState, useEffect, useRef, useCallback } = React;

function makeLog(level, msg) {
  return { id: Math.random().toString(36).slice(2), level, msg, ts: new Date().toLocaleTimeString('en-US',{hour12:false}) };
}

const LEVEL_COLOR = {
  info:    'var(--text-dim)',
  success: 'var(--accent)',
  warn:    'var(--warn)',
  error:   'var(--danger)',
  system:  'var(--text-secondary)',
  agent:   'var(--accent2)',
};

const EN_LOGS = [
  { level:'system', msg:'> Initiating pipeline run...' },
  { level:'agent',  msg:'[BA-Agent] Requirement analysis complete — 2 user stories' },
  { level:'info',   msg:'US-001 → Hero Section render test' },
  { level:'info',   msg:'US-002 → Pipeline board state transitions' },
  { level:'info',   msg:'Handoff to QC layer...' },
  { level:'agent',  msg:'[QC-Agent] Generating test scenarios from spec...' },
  { level:'success',msg:'playwright test hero.spec.ts — PASS (341ms)' },
  { level:'warn',   msg:'playwright test pipeline.spec.ts — FAIL (timeout @2000ms)' },
  { level:'warn',   msg:'Auto-retry 1/2 — [data-testid="card-ba-analyzing"] not found' },
  { level:'warn',   msg:'playwright test pipeline.spec.ts — FAIL (timeout @2000ms)' },
  { level:'warn',   msg:'Auto-retry 2/2...' },
  { level:'error',  msg:'pipeline.spec.ts BLOCKED after 2 retries — escalating to Quality Gate' },
];

const VI_LOGS = [
  { level:'system', msg:'> Khởi tạo pipeline run...' },
  { level:'agent',  msg:'[BA-Agent] Phân tích yêu cầu hoàn tất — 2 user story' },
  { level:'info',   msg:'US-001 → Kiểm tra render Hero Section' },
  { level:'info',   msg:'US-002 → Kiểm tra chuyển trạng thái Pipeline Board' },
  { level:'info',   msg:'Chuyển sang lớp QC...' },
  { level:'agent',  msg:'[QC-Agent] Đang sinh test scenario từ spec...' },
  { level:'success',msg:'playwright test hero.spec.ts — PASS (341ms)' },
  { level:'warn',   msg:'playwright test pipeline.spec.ts — FAIL (timeout @2000ms)' },
  { level:'warn',   msg:'Tự retry 1/2 — [data-testid="card-ba-analyzing"] không tìm thấy' },
  { level:'warn',   msg:'playwright test pipeline.spec.ts — FAIL (timeout @2000ms)' },
  { level:'warn',   msg:'Tự retry 2/2...' },
  { level:'error',  msg:'pipeline.spec.ts BLOCKED sau 2 lần retry — chuyển lên Quality Gate' },
];

const OVERRIDE_LOGS = {
  en: [
    { level:'warn',   msg:'⚠ Override authorized by QC Lead' },
    { level:'info',   msg:'Rationale: flakiness due to animation timing — known issue #QC-88' },
    { level:'system', msg:'Merging to staging with override flag...' },
    { level:'success',msg:'Pipeline completed (override) — monitoring for regression' },
  ],
  vi: [
    { level:'warn',   msg:'⚠ Override được QC Lead phê duyệt' },
    { level:'info',   msg:'Lý do: test flaky do timing animation — issue đã biết #QC-88' },
    { level:'system', msg:'Merge lên staging với cờ override...' },
    { level:'success',msg:'Pipeline hoàn thành (override) — đang theo dõi regression' },
  ],
};

const REJECT_LOGS = {
  en: [
    { level:'agent',  msg:'[QC-Agent] Root cause: missing data-testid in v1 board' },
    { level:'info',   msg:'Generating fix recommendation...' },
    { level:'system', msg:'Ticket created: QC-89 — retrain pipeline with v2 spec' },
    { level:'error',  msg:'Build rejected — rollback initiated' },
  ],
  vi: [
    { level:'agent',  msg:'[QC-Agent] Nguyên nhân: thiếu data-testid trong v1 board' },
    { level:'info',   msg:'Đang sinh khuyến nghị fix...' },
    { level:'system', msg:'Ticket đã tạo: QC-89 — retrain pipeline với spec v2' },
    { level:'error',  msg:'Build bị từ chối — rollback đã khởi động' },
  ],
};

const COLUMNS = {
  en: [
    { id:'ba',  label:'BA Analyzing',  short:'BA'  },
    { id:'dev', label:'Ready for Dev', short:'DEV' },
    { id:'qc',  label:'QC Generating', short:'QC'  },
    { id:'ci',  label:'CI Running',    short:'CI'  },
  ],
  vi: [
    { id:'ba',  label:'BA Phân Tích',   short:'BA'  },
    { id:'dev', label:'Sẵn sàng Dev',   short:'DEV' },
    { id:'qc',  label:'QC Sinh Test',   short:'QC'  },
    { id:'ci',  label:'CI Đang Chạy',   short:'CI'  },
  ],
};

function usePipeline() {
  const [phase, setPhase]     = useState('idle');
  const [logs, setLogs]       = useState([]);
  const [failCount, setFail]  = useState(0);
  const [retries, setRetries] = useState(0);
  const [decision, setDec]    = useState(null);
  const timers = useRef([]);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const addLog = useCallback((l) => setLogs(p => [...p, l]), []);

  const trigger = useCallback((lang='en') => {
    clear();
    setLogs([]); setFail(0); setRetries(0); setDec(null); setPhase('ba');
    const src = lang === 'vi' ? VI_LOGS : EN_LOGS;
    let d = 0;
    const schedule = (logList, delay, afterCb) => {
      logList.forEach((l, i) => {
        const t = setTimeout(() => addLog(makeLog(l.level, l.msg)), delay + i * 700);
        timers.current.push(t);
      });
      const end = delay + logList.length * 700;
      if (afterCb) timers.current.push(setTimeout(afterCb, end));
      return end;
    };
    d = schedule(src.slice(0,2), d, () => setPhase('dev'));
    d = schedule(src.slice(2,4), d+300, () => setPhase('qc'));
    d = schedule(src.slice(4,6), d+300, () => setPhase('ci'));
    d = schedule(src.slice(6), d+300, () => { setFail(2); setRetries(2); setPhase('gate'); });
  }, []);

  const makeDecision = useCallback((d, lang='en') => {
    setDec(d);
    const src = d === 'override' ? OVERRIDE_LOGS[lang] : REJECT_LOGS[lang];
    src.forEach((l, i) => {
      const t = setTimeout(() => addLog(makeLog(l.level, l.msg)), i * 600);
      timers.current.push(t);
    });
    timers.current.push(setTimeout(() => setPhase(d === 'override' ? 'completed' : 'rejected'), src.length * 600));
  }, []);

  const reset = useCallback(() => { clear(); setPhase('idle'); setLogs([]); setFail(0); setRetries(0); setDec(null); }, []);

  useEffect(() => () => clear(), []);
  return { phase, logs, failCount, retries, decision, trigger, makeDecision, reset };
}

function cardColumn(cardId, phase, decision) {
  if (phase === 'idle') return null;
  if (cardId === 'US-001') return ['ba'].includes(phase) ? 'ba' : 'ci';
  if (phase === 'ba') return 'ba';
  if (phase === 'dev') return 'dev';
  if (phase === 'qc') return 'qc';
  if (['ci','gate'].includes(phase)) return 'ci';
  if (phase === 'completed' && decision === 'override') return 'ci';
  if (phase === 'rejected') return 'qc';
  return 'ci';
}

function PipelineSection({ pipeline, lang }) {
  const { phase, logs, failCount, retries, decision, trigger, makeDecision, reset } = pipeline;
  const t = {
    en: { eyebrow:'// meta-pipeline', title:'Enterprise QA Pipeline', desc:'This page is the Subject Under Test. Watch a live simulation of BA → QC → CI with intentional failures and human override.', run:'▶ Run Pipeline', again:'↺ Run Again', await:'$ awaiting pipeline trigger...', running:'RUNNING', done:'✓ DONE', retrain:'↩ RETRAIN', blocked:'⛔ BLOCKED', gate_title:'Quality Gate — Human Decision Required', override_btn:'⚠ Override — merge anyway', reject_btn:'↩ Reject — retrain', override_done:'Merged to staging with override flag · monitoring for regression', reject_done:'Rollback initiated · ticket QC-89 created for v2 fix', fail_label:'fail', retry_label:'retries', threshold:'threshold exceeded', override_auth:'⚠ Override Authorized', build_rejected:'↩ Build Rejected' },
    vi: { eyebrow:'// meta-pipeline', title:'Pipeline QA Doanh Nghiệp', desc:'Trang này chính là Subject Under Test. Xem mô phỏng BA → QC → CI với lỗi có chủ ý và override thủ công.', run:'▶ Chạy Pipeline', again:'↺ Chạy Lại', await:'$ đang chờ kích hoạt pipeline...', running:'ĐANG CHẠY', done:'✓ XONG', retrain:'↩ RETRAIN', blocked:'⛔ BLOCKED', gate_title:'Quality Gate — Cần Quyết Định Thủ Công', override_btn:'⚠ Override — merge luôn', reject_btn:'↩ Từ Chối — retrain', override_done:'Merge lên staging với cờ override · đang theo dõi regression', reject_done:'Rollback đã khởi động · ticket QC-89 đã tạo cho bản fix v2', fail_label:'lỗi', retry_label:'retry', threshold:'vượt ngưỡng cho phép', override_auth:'⚠ Override Đã Được Phê Duyệt', build_rejected:'↩ Build Bị Từ Chối' },
  }[lang] || {};

  const cols = COLUMNS[lang] || COLUMNS.en;
  const isIdle = phase === 'idle';
  const isDone = ['completed','rejected'].includes(phase);
  const isGate = ['gate','completed','rejected'].includes(phase) && failCount > 0;
  const decided = phase !== 'gate';
  const isRunning = !['idle','completed','rejected'].includes(phase);

  const cards = [
    { id:'US-001', title: lang==='vi' ? 'Hero renders đúng' : 'Hero renders correctly', file:'hero.spec.ts' },
    { id:'US-002', title: lang==='vi' ? 'Chuyển trạng thái Pipeline Board' : 'Pipeline state transitions', file:'pipeline.spec.ts' },
  ];

  const statusLabel = isRunning ? t.running : phase==='completed' ? t.done : phase==='rejected' ? t.retrain : null;

  return (
    <section id="pipeline" style={{ padding:'48px 0' }}>
      <div style={{ marginBottom:'24px' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>{t.eyebrow}</div>
        <h2 style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text-primary)', marginBottom:'8px' }}>{t.title}</h2>
        <p style={{ fontSize:'13px', color:'var(--text-secondary)', maxWidth:'600px', lineHeight:1.6 }}>{t.desc}</p>
      </div>

      <div style={{ display:'flex', gap:'10px', marginBottom:'20px' }}>
        {isIdle && <button onClick={() => trigger(lang)} style={{ fontFamily:'var(--mono)', fontSize:'12px', padding:'8px 18px', borderRadius:'6px', cursor:'pointer', border:'1px solid rgba(var(--accent-rgb),0.4)', background:'rgba(var(--accent-rgb),0.08)', color:'var(--accent)' }}>{t.run}</button>}
        {isDone && <button onClick={() => { reset(); setTimeout(() => trigger(lang), 100); }} style={{ fontFamily:'var(--mono)', fontSize:'12px', padding:'8px 18px', borderRadius:'6px', cursor:'pointer', border:'1px solid var(--border)', background:'var(--surface-2)', color:'var(--text-dim)' }}>{t.again}</button>}
      </div>

      {/* Board */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'12px' }}>
        {cols.map(col => {
          const colCards = cards.filter(c => cardColumn(c.id, phase, decision) === col.id);
          const isActive = phase === col.id;
          return (
            <div key={col.id} style={{ background: isActive ? 'rgba(var(--accent-rgb),0.05)' : 'var(--surface-2)', border:`1px solid ${isActive ? 'rgba(var(--accent-rgb),0.25)' : 'var(--border)'}`, borderRadius:'8px', padding:'12px', minHeight:'130px', transition:'all 0.3s' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'10px' }}>
                {isActive && <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', animation:'pulseDot 1.5s ease infinite' }} />}
                <span style={{ fontFamily:'var(--mono)', fontSize:'9px', color: isActive ? 'var(--accent)' : 'var(--text-dim)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{col.short}</span>
              </div>
              <div style={{ fontSize:'10px', color:'var(--text-dim)', marginBottom:'8px', lineHeight:1.3 }}>{col.label}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {colCards.map(c => {
                  const s = c.id==='US-002' && phase==='gate' ? 'blocked' : c.id==='US-002' && retries>0 && phase==='ci' ? 'flaky' : 'ok';
                  return (
                    <div key={c.id} style={{ background: s==='blocked' ? 'rgba(var(--danger-rgb),0.08)' : s==='flaky' ? 'rgba(var(--warn-rgb),0.08)' : 'var(--surface-3)', border:`1px solid ${s==='blocked' ? 'rgba(var(--danger-rgb),0.25)' : s==='flaky' ? 'rgba(var(--warn-rgb),0.2)' : 'var(--border)'}`, borderRadius:'6px', padding:'8px' }}>
                      <div style={{ fontFamily:'var(--mono)', fontSize:'8px', color:'var(--accent)', marginBottom:'3px' }}>{c.id}</div>
                      <div style={{ fontSize:'10px', color:'var(--text-secondary)', lineHeight:1.3 }}>{c.title}</div>
                      <div style={{ marginTop:'5px', fontFamily:'var(--mono)', fontSize:'8px', color: s==='blocked' ? 'var(--danger)' : s==='flaky' ? 'var(--warn)' : 'var(--text-dim)' }}>
                        {s==='blocked' ? `⛔ ${failCount} ${t.fail_label}` : s==='flaky' ? `⚠ FLAKY ×${retries}` : c.file}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal */}
      <TerminalLog logs={logs} phase={phase} isRunning={isRunning} statusLabel={statusLabel} awaitMsg={t.await} />

      {/* Quality Gate */}
      {isGate && (
        <div style={{ marginTop:'14px', border:`1px solid ${decided ? (decision==='override' ? 'rgba(var(--danger-rgb),0.3)' : 'rgba(var(--accent2-rgb),0.3)') : 'rgba(var(--danger-rgb),0.4)'}`, background: decided ? 'rgba(var(--danger-rgb),0.03)' : 'rgba(var(--danger-rgb),0.05)', borderRadius:'8px', overflow:'hidden' }}>
          <div style={{ padding:'10px 14px', borderBottom:'1px solid rgba(var(--danger-rgb),0.15)', background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', gap:'10px' }}>
            {!decided && <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--danger)', animation:'pulseDot 1s ease infinite' }} />}
            <span style={{ fontFamily:'var(--mono)', fontSize:'11px', fontWeight:600, color: decided ? (decision==='override' ? 'var(--danger)' : 'var(--accent2)') : 'var(--danger)' }}>
              {decided ? (decision==='override' ? t.override_auth : t.build_rejected) : t.gate_title}
            </span>
          </div>
          <div style={{ padding:'12px 14px' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', marginBottom:'10px' }}>
              pipeline.spec.ts · {failCount} {t.fail_label} · {retries} {t.retry_label} · {t.threshold}
            </div>
            {!decided ? (
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                <button onClick={() => makeDecision('override', lang)} style={{ fontFamily:'var(--mono)', fontSize:'11px', padding:'6px 14px', borderRadius:'6px', cursor:'pointer', border:'1px solid rgba(var(--danger-rgb),0.4)', background:'rgba(var(--danger-rgb),0.08)', color:'var(--danger)' }}>{t.override_btn}</button>
                <button onClick={() => makeDecision('reject', lang)} style={{ fontFamily:'var(--mono)', fontSize:'11px', padding:'6px 14px', borderRadius:'6px', cursor:'pointer', border:'1px solid rgba(var(--accent2-rgb),0.4)', background:'rgba(var(--accent2-rgb),0.06)', color:'var(--accent2)' }}>{t.reject_btn}</button>
              </div>
            ) : (
              <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-secondary)' }}>
                {decision==='override' ? t.override_done : t.reject_done}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function TerminalLog({ logs, phase, isRunning, statusLabel, awaitMsg }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [logs]);
  return (
    <div style={{ background:'var(--surface-1)', border:'1px solid var(--border)', borderRadius:'8px', overflow:'hidden' }}>
      <div style={{ padding:'8px 12px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'8px', background:'var(--surface-2)' }}>
        <div style={{ display:'flex', gap:'5px' }}>{['#ff5f56','#ffbd2e','#27c93f'].map(c => <div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }} />)}</div>
        <span style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)' }}>pipeline.log</span>
        {statusLabel && <span style={{ marginLeft:'auto', fontFamily:'var(--mono)', fontSize:'9px', color: phase==='gate'||phase==='rejected' ? 'var(--danger)' : 'var(--accent)' }}>{statusLabel}</span>}
      </div>
      <div ref={ref} style={{ padding:'10px 12px', minHeight:'160px', maxHeight:'200px', overflowY:'auto', fontFamily:'var(--mono)', fontSize:'11px', lineHeight:1.7 }}>
        {logs.length === 0 ? <span style={{ color:'var(--text-dim)' }}>{awaitMsg}</span> : logs.map(l => (
          <div key={l.id}><span style={{ color:'var(--text-dim)', marginRight:'8px' }}>{l.ts}</span><span style={{ color: LEVEL_COLOR[l.level] }}>{l.msg}</span></div>
        ))}
        {isRunning && <span style={{ color:'var(--accent)', animation:'blink 1s step-end infinite' }}>▊</span>}
      </div>
    </div>
  );
}

Object.assign(window, { PipelineSection, usePipeline });
