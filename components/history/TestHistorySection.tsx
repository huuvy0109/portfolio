'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface RunEntry {
  id: string
  timestamp: string
  status: 'passed' | 'failed'
  reportPath: string
  jsonPath: string
}

interface TestResult {
  title: string
  file: string
  status: 'passed' | 'failed' | 'skipped' | 'timedOut'
  duration: number
}

export default function TestHistorySection() {
  const [history, setHistory] = useState<RunEntry[]>([])
  const [selectedRun, setSelectedRun] = useState<RunEntry | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    fetch('/reports/registry.json')
      .then(res => res.json())
      .then(data => {
        setHistory(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load test history:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (selectedRun) {
      setReportLoading(true)
      fetch(selectedRun.jsonPath)
        .then(res => res.json())
        .then(data => {
          const results: TestResult[] = []
          
          // Recursive function to flatten Playwright suites
          const processSuite = (suite: any) => {
            if (suite.specs) {
              suite.specs.forEach((spec: any) => {
                spec.tests.forEach((test: any) => {
                  results.push({
                    title: spec.title,
                    file: suite.file || data.suites[0]?.file || 'unknown',
                    status: test.status === 'expected' ? 'passed' : (test.status === 'skipped' ? 'skipped' : 'failed'),
                    duration: test.results[0]?.duration || 0
                  })
                })
              })
            }
            if (suite.suites) {
              suite.suites.forEach(processSuite)
            }
          }

          if (data.suites) {
            data.suites.forEach(processSuite)
          }
          
          setTestResults(results)
          setReportLoading(false)
        })
        .catch(err => {
          console.error('Failed to load report data:', err)
          setTestResults([]) // Clear previous results
          setReportLoading(false)
        })
    }
  }, [selectedRun])

  if (loading) return null
  if (history.length === 0) return null

  return (
    <section id="test-history" className="py-12 px-4 max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <div className="font-mono text-[10px] text-[var(--accent-green)] uppercase tracking-widest mb-2">
          // PLAYWRIGHT TEST ARCHIVE
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Real-world Execution History</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Actual reports from Playwright test runs. Click any run to view the summarized results.
        </p>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        <div
          className="grid grid-cols-4 text-[10px] font-mono uppercase tracking-widest border-b px-4 py-2.5"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}
        >
          <span className="text-[var(--text-muted)] col-span-2">Run ID / Timestamp</span>
          <span className="text-[var(--text-muted)]">Status</span>
          <span className="text-[var(--text-muted)] text-right">Summary</span>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {history.map((run) => (
            <div
              key={run.id}
              className="grid grid-cols-4 px-4 py-4 items-center gap-2 hover:bg-[var(--bg-card-hover)] transition-colors group"
            >
              <div className="col-span-2">
                <div className="font-mono text-[11px] text-[var(--text-primary)]">{run.id}</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  {new Date(run.timestamp).toLocaleString()}
                </div>
              </div>

              <div>
                <span
                  className="font-mono text-[10px] px-2 py-0.5 rounded"
                  style={{
                    background: run.status === 'passed' ? 'rgba(0,255,157,0.08)' : 'rgba(255,68,68,0.1)',
                    border: run.status === 'passed' ? '1px solid rgba(0,255,157,0.25)' : '1px solid rgba(255,68,68,0.3)',
                    color: run.status === 'passed' ? 'var(--accent-green)' : 'var(--accent-red)'
                  }}
                >
                  {run.status.toUpperCase()}
                </span>
              </div>

              <div className="text-right">
                <button
                  onClick={() => setSelectedRun(run)}
                  className="font-mono text-[10px] text-[var(--accent-blue)] hover:underline flex items-center gap-1 justify-end ml-auto"
                >
                  View Details ↗
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {selectedRun && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRun(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl h-[80vh] bg-[var(--bg-primary)] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
              style={{ border: '1px solid var(--border-active)' }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent-blue)]" />
                  <div>
                    <span className="font-mono text-sm font-bold text-[var(--text-primary)] block">Run Details: {selectedRun.id}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">{new Date(selectedRun.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href={selectedRun.reportPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] text-[var(--accent-green)] hover:underline"
                  >
                    Open Full HTML Report ↗
                  </a>
                  <button
                    onClick={() => setSelectedRun(null)}
                    className="p-2 hover:bg-[var(--bg-card-hover)] rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6">
                {reportLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="font-mono text-sm text-[var(--accent-blue)] animate-pulse">Loading report data...</div>
                  </div>
                ) : testResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] px-3 mb-2">
                      <span className="col-span-5">Test Case / Spec</span>
                      <span className="col-span-4">File</span>
                      <span className="col-span-2">Status</span>
                      <span className="col-span-1 text-right">Time</span>
                    </div>
                    {testResults.map((test, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-12 px-3 py-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] items-center gap-4"
                      >
                        <div className="col-span-5">
                          <span className="font-mono text-xs text-[var(--text-primary)]">{test.title}</span>
                        </div>
                        <div className="col-span-4">
                          <span className="font-mono text-[10px] text-[var(--text-muted)] truncate block">{test.file}</span>
                        </div>
                        <div className="col-span-2">
                          <span
                            className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                            style={{
                              background: test.status === 'passed' ? 'rgba(0,255,157,0.08)' : (test.status === 'skipped' ? 'rgba(255,170,0,0.1)' : 'rgba(255,68,68,0.1)'),
                              border: test.status === 'passed' ? '1px solid rgba(0,255,157,0.2)' : (test.status === 'skipped' ? '1px solid rgba(255,170,0,0.2)' : '1px solid rgba(255,68,68,0.2)'),
                              color: test.status === 'passed' ? 'var(--accent-green)' : (test.status === 'skipped' ? 'var(--accent-yellow)' : 'var(--accent-red)')
                            }}
                          >
                            {test.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="col-span-1 text-right">
                          <span className="font-mono text-[10px] text-[var(--text-muted)]">{test.duration}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4 border border-[var(--border-subtle)]">
                      <span className="text-xl">!</span>
                    </div>
                    <div className="font-mono text-sm text-[var(--text-primary)] mb-1">No JSON Data Available</div>
                    <p className="text-xs text-[var(--text-muted)] max-w-xs">
                      This run might have been created before the JSON reporter was enabled. 
                      Try viewing the <strong>Full HTML Report</strong> instead.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
