/**
 * Upload Playwright test results to Portfolio dashboard after CI run.
 * Requires Node 20+ (built-in fetch + FormData).
 *
 * Env vars:
 *   PORTFOLIO_API_KEY  — from dashboard project settings
 *   PORTFOLIO_URL      — e.g. https://huuvy-portfolio.vercel.app
 *   RUN_ENV            — 'ci' | 'local' (default: 'ci')
 */

import fs from 'fs'
import path from 'path'

const API_KEY = process.env.PORTFOLIO_API_KEY
const BASE_URL = (process.env.PORTFOLIO_URL || '').replace(/\/$/, '')
const ENV = process.env.RUN_ENV || 'ci'
const PROJECT_SLUG = 'portfolio'

if (!API_KEY || !BASE_URL) {
  console.error('❌ Missing PORTFOLIO_API_KEY or PORTFOLIO_URL')
  process.exit(1)
}

const jsonReportPath = path.resolve('playwright-report/results.json')
const htmlReportPath = path.resolve('playwright-report/index.html')

// Parse JSON report → summary
let summary = { status: 'passed', total: 0, passed: 0, failed: 0, skipped: 0, durationMs: 0, results: [] }

if (fs.existsSync(jsonReportPath)) {
  const raw = JSON.parse(fs.readFileSync(jsonReportPath, 'utf-8'))
  const results = []
  let totalDuration = 0

  for (const suite of raw.suites || []) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const allResults = test.results || []
        const last = allResults[allResults.length - 1]
        const status = last?.status === 'passed' ? 'passed'
          : last?.status === 'skipped' ? 'skipped'
          : allResults.length > 1 ? 'flaky'
          : 'failed'
        totalDuration += last?.duration || 0
        results.push({
          title: test.title,
          file: spec.file || suite.title,
          status,
          durationMs: last?.duration || 0,
          errorMessage: last?.error?.message || null,
          retryCount: allResults.length - 1,
        })
      }
    }
  }

  const passed  = results.filter(r => r.status === 'passed').length
  const failed  = results.filter(r => r.status === 'failed').length
  const skipped = results.filter(r => r.status === 'skipped').length

  summary = { status: failed > 0 ? 'failed' : 'passed', total: results.length, passed, failed, skipped, durationMs: totalDuration, results }
}

// Build multipart form using Node 20 built-in FormData
const form = new FormData()
form.append('projectSlug', PROJECT_SLUG)
form.append('env', ENV)
form.append('summary', JSON.stringify(summary))

if (fs.existsSync(htmlReportPath)) {
  const blob = new Blob([fs.readFileSync(htmlReportPath)], { type: 'text/html' })
  form.append('htmlReport', blob, 'index.html')
}
if (fs.existsSync(jsonReportPath)) {
  const blob = new Blob([fs.readFileSync(jsonReportPath)], { type: 'application/json' })
  form.append('jsonReport', blob, 'results.json')
}

console.log(`Uploading report → ${BASE_URL}/api/reports/upload (env=${ENV}, total=${summary.total})`)

const res = await fetch(`${BASE_URL}/api/reports/upload`, {
  method: 'POST',
  headers: { 'X-Api-Key': API_KEY },
  body: form,
})

if (!res.ok) {
  const text = await res.text()
  console.error(`❌ Upload failed [${res.status}]:`, text)
  process.exit(1)
}

const data = await res.json()
console.log(`✓ Report uploaded: runId=${data.runId}`)
if (data.blobUrl) console.log(`  HTML: ${data.blobUrl}`)
