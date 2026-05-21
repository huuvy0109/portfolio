import { CSSProperties, ReactNode } from 'react'
import { M } from './tokens'

export default function MCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: M.surf2, border: `1px solid ${M.border}`, borderRadius: 12, ...style }}>
      {children}
    </div>
  )
}
