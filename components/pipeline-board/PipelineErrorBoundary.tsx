'use client'

import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; errorMessage: string }

export default class PipelineErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message }
  }

  componentDidCatch(error: Error) {
    console.error('[PipelineErrorBoundary]', error)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        className="rounded-xl p-6 my-4 font-mono"
        style={{ background: 'rgba(255,68,68,0.05)', border: '1px solid rgba(255,68,68,0.3)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[var(--accent-red)]">⛔</span>
          <span className="text-sm font-semibold text-[var(--accent-red)]">PIPELINE RENDER ERROR</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mb-4">{this.state.errorMessage}</p>
        <button
          className="text-[10px] px-3 py-1.5 rounded transition-colors"
          style={{ border: '1px solid rgba(0,255,157,0.3)', color: 'var(--accent-green)' }}
          onClick={() => this.setState({ hasError: false, errorMessage: '' })}
        >
          ↺ Reset Pipeline
        </button>
      </div>
    )
  }
}
