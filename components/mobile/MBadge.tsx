import { M } from './tokens'

export default function MBadge({ status }: { status: string }) {
  const c = status === 'passed' ? M.accent3 : status === 'failed' ? M.danger : M.warn
  const r = status === 'passed' ? M.accent3Rgb : status === 'failed' ? M.dangerRgb : M.warnRgb
  return (
    <span style={{
      fontFamily: M.mono, fontSize: 9, fontWeight: 600,
      padding: '3px 8px', borderRadius: 4,
      background: `rgba(${r},.1)`, border: `1px solid rgba(${r},.25)`,
      color: c, letterSpacing: '.04em', whiteSpace: 'nowrap',
    }}>
      {status.toUpperCase()}
    </span>
  )
}
