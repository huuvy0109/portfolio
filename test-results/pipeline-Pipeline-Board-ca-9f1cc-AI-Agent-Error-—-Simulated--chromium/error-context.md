# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pipeline.spec.ts >> Pipeline Board >> card moves to BA Analyzing column on trigger [AI Agent Error — Simulated]
- Location: tests\e2e\pipeline.spec.ts:31:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('card-ba-analyzing')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('card-ba-analyzing')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]: portfolio_v2.1.0
        - generic [ref=e8]: SYSTEM ONLINE
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]: ⬡
          - generic [ref=e12]: QA Lead · AI Automation Engineer
        - heading "HUU VY" [level=1] [ref=e13]
        - paragraph [ref=e14]:
          - text: "> This page is not just a portfolio — it is a Subject Under Test"
          - generic [ref=e15]: ▊
        - paragraph [ref=e16]: Building intelligent QA systems that model real-world failures, enforce quality gates, and leave an auditable trail of every human decision.
        - generic [ref=e17]:
          - generic [ref=e18]:
            - generic [ref=e19]: "7"
            - generic [ref=e20]: YRS EXP
          - generic [ref=e21]:
            - generic [ref=e22]: 30–40
            - generic [ref=e23]: TEAM SIZE
          - generic [ref=e24]:
            - generic [ref=e25]: 5+
            - generic [ref=e26]: ENTERPRISES
          - generic [ref=e27]:
            - generic [ref=e28]: AI
            - generic [ref=e29]: PIPELINE
        - generic [ref=e30]:
          - button "▶ Run Pipeline" [active] [ref=e31]:
            - generic [ref=e32]: ▶ Run Pipeline
          - button "View Journey →" [ref=e33]
        - generic [ref=e34]:
          - generic [ref=e35]: Playwright
          - generic [ref=e36]: TypeScript
          - generic [ref=e37]: AI Multi-Agent
          - generic [ref=e38]: Jira
          - generic [ref=e39]: GitHub Actions
          - generic [ref=e40]: Postman
          - generic [ref=e41]: SQL
      - generic [ref=e43]: scroll
    - generic [ref=e47]:
      - generic [ref=e48]:
        - generic [ref=e49]:
          - generic [ref=e50]:
            - generic [ref=e51]: // META-PIPELINE
            - heading "Enterprise QA Pipeline" [level=2] [ref=e52]
            - paragraph [ref=e53]: This page is the Subject Under Test. Watch a real-time simulation of BA → QC → CI with intentional failures and human override.
          - generic [ref=e54]:
            - generic [ref=e55]: How to read
            - generic [ref=e58]: Active / Pass
            - generic [ref=e61]: ⚠ Flaky (retry > 1)
            - generic [ref=e64]: ⛔ Blocked (fail > 0)
        - generic [ref=e65]:
          - generic [ref=e66]:
            - generic [ref=e73]: "META-PIPELINE — Board #47"
            - generic [ref=e74]:
              - generic [ref=e77]:
                - generic [ref=e78]: 🤖
                - generic [ref=e79]: BA Analyzing
              - generic [ref=e84]:
                - generic [ref=e85]: 📋
                - generic [ref=e86]: Ready for Dev
              - generic [ref=e89]:
                - generic [ref=e91]:
                  - generic [ref=e92]: 🔬
                  - generic [ref=e93]: QC Generating
                - generic [ref=e96]:
                  - generic [ref=e98]: US-002
                  - paragraph [ref=e99]: Pipeline Board state transitions
                  - generic [ref=e100]: pipeline.spec.ts
              - generic [ref=e101]:
                - generic [ref=e103]:
                  - generic [ref=e104]: ⚡
                  - generic [ref=e105]: CI Running
                - generic [ref=e108]:
                  - generic [ref=e110]: US-001
                  - paragraph [ref=e111]: Hero Section renders correctly
                  - generic [ref=e112]: hero.spec.ts
            - generic [ref=e113]:
              - generic [ref=e115]: "retryCount: 0 | failCount: 0"
              - button "↺ Reset" [ref=e117]
          - generic [ref=e118]:
            - generic [ref=e119]:
              - generic [ref=e125]: "ci-runner — Run #1"
              - generic [ref=e129]: RUNNING
            - generic [ref=e130]:
              - generic [ref=e131]:
                - generic [ref=e132]: 12:24:58.990
                - generic [ref=e133]: agent-ba
                - generic [ref=e134]: ▶ Agent BA initializing — reading requirement doc...
              - generic [ref=e135]:
                - generic [ref=e136]: 12:24:59.690
                - generic [ref=e137]: agent-ba
                - generic [ref=e138]: "✓ Parsed: US-001 \"Hero Section renders with correct heading\""
              - generic [ref=e139]:
                - generic [ref=e140]: 12:25:00.294
                - generic [ref=e141]: agent-ba
                - generic [ref=e142]: "✓ Parsed: US-002 \"Pipeline Board transitions between phases\""
              - generic [ref=e143]:
                - generic [ref=e144]: 12:25:00.995
                - generic [ref=e145]: agent-ba
                - generic [ref=e146]: ✓ Acceptance Criteria generated for 2 user stories
              - generic [ref=e147]:
                - generic [ref=e148]: 12:25:01.592
                - generic [ref=e149]: system
                - generic [ref=e150]: "━━━ Phase: READY FOR DEV ━━━"
              - generic [ref=e151]:
                - generic [ref=e152]: 12:25:01.995
                - generic [ref=e153]: agent-ba
                - generic [ref=e154]: → Cards US-001, US-002 moved to Ready for Dev
              - generic [ref=e155]:
                - generic [ref=e156]: 12:25:03.291
                - generic [ref=e157]: system
                - generic [ref=e158]: "━━━ Phase: QC GENERATING ━━━"
              - generic [ref=e159]:
                - generic [ref=e160]: 12:25:03.593
                - generic [ref=e161]: agent-qc
                - generic [ref=e162]: "▶ Agent QC: Generating test scripts from Acceptance Criteria..."
              - generic [ref=e163]:
                - generic [ref=e164]: 12:25:03
                - generic [ref=e165]: system
                - generic [ref=e166]: processing▊
            - generic [ref=e167]:
              - generic [ref=e168]:
                - generic [ref=e169]: "fails: 0"
                - generic [ref=e170]: "retries: 0"
                - generic [ref=e171]: "lines: 8"
              - generic [ref=e172]:
                - generic [ref=e173]: "workers: 2 · Playwright v1.48"
                - link "CI Report →" [ref=e174] [cursor=pointer]:
                  - /url: https://github.com/huuvy0109/portfolio/actions
        - button "↺ Simulate Again" [ref=e176]
      - generic [ref=e177]:
        - generic [ref=e178]:
          - generic [ref=e179]: // SANITIZER VISUALIZER
          - generic [ref=e180]:
            - generic [ref=e181]:
              - heading "Data Sanitization Pipeline" [level=2] [ref=e182]
              - paragraph [ref=e183]: External project reports are scanned before display. PII and credentials are automatically masked — no raw data is ever exposed.
            - generic [ref=e184]:
              - generic [ref=e185]: NDA Protected
              - generic [ref=e186]: OWASP Compliant
        - generic [ref=e187]:
          - generic [ref=e188]:
            - generic [ref=e189]:
              - generic [ref=e192]: raw_report.json — UNSAFE
              - generic [ref=e193]: ⚠ CONTAINS PII
            - generic [ref=e194]:
              - generic [ref=e195]:
                - generic [ref=e196]: "reporter_email:"
                - generic [ref=e197]: "\"john.doe@client.com\""
              - generic [ref=e198]:
                - generic [ref=e199]: "auth_token:"
                - generic [ref=e200]: "\"eyJhbGciOiJSUzI1NiJ9...\""
              - generic [ref=e201]:
                - generic [ref=e202]: "phone_number:"
                - generic [ref=e203]: "\"+84 091 234 5678\""
              - generic [ref=e204]:
                - generic [ref=e205]: "tester_name:"
                - generic [ref=e206]: "\"Nguyen Van A\""
          - generic [ref=e207]:
            - generic [ref=e208]:
              - generic [ref=e211]: sanitized_report.json — SAFE
              - generic [ref=e212]: ✓ 4 fields masked
            - generic [ref=e213]:
              - generic [ref=e214]:
                - generic [ref=e215]: "reporter_email:"
                - generic [ref=e216]: "\"[REDACTED:email]\""
              - generic [ref=e217]:
                - generic [ref=e218]: "auth_token:"
                - generic [ref=e219]: "\"[REDACTED:token]\""
              - generic [ref=e220]:
                - generic [ref=e221]: "phone_number:"
                - generic [ref=e222]: "\"[REDACTED:phone]\""
              - generic [ref=e223]:
                - generic [ref=e224]: "tester_name:"
                - generic [ref=e225]: "\"[REDACTED:pii]\""
        - generic [ref=e226]:
          - generic [ref=e227]:
            - generic [ref=e228]: Agent Sanitizer Log
            - button "↺ Re-scan" [ref=e229]
          - generic [ref=e230]:
            - generic [ref=e231]:
              - generic [ref=e232]: 12:25:01
              - generic [ref=e233]: ✓ Masked field "reporter_email" → [REDACTED:email]
            - generic [ref=e234]:
              - generic [ref=e235]: 12:25:01
              - generic [ref=e236]: ✓ Masked field "auth_token" → [REDACTED:token]
            - generic [ref=e237]:
              - generic [ref=e238]: 12:25:01
              - generic [ref=e239]: ✓ Masked field "phone_number" → [REDACTED:phone]
            - generic [ref=e240]:
              - generic [ref=e241]: 12:25:01
              - generic [ref=e242]: ✓ Masked field "tester_name" → [REDACTED:pii]
            - generic [ref=e243]:
              - generic [ref=e244]: 12:25:01
              - generic [ref=e245]: ✓ Sanitization complete. Report cleared for display.
      - generic [ref=e246]:
        - generic [ref=e247]:
          - generic [ref=e248]: // PROFESSIONAL JOURNEY
          - heading "7 Years in the Trenches" [level=2] [ref=e249]
        - generic [ref=e250]:
          - generic [ref=e251]:
            - generic [ref=e255]:
              - generic [ref=e256]:
                - generic [ref=e257]: Haraworks
                - generic [ref=e258]: ·
                - generic [ref=e259]: QA Lead
                - generic [ref=e260]: Team 30–40
              - generic [ref=e261]: 2022 — Present
            - paragraph [ref=e262]: Led quality strategy across multi-team product releases. Established QA processes for 4 product lines, reduced critical bug leakage by 40%.
            - generic [ref=e263]:
              - generic [ref=e264]: Jira
              - generic [ref=e265]: Playwright
              - generic [ref=e266]: API Testing
              - generic [ref=e267]: Risk Management
          - generic [ref=e268]:
            - generic [ref=e272]:
              - generic [ref=e273]:
                - generic [ref=e274]: Techland
                - generic [ref=e275]: ·
                - generic [ref=e276]: Senior QA Engineer
                - generic [ref=e277]: AI Pipeline
              - generic [ref=e278]: 2020 — 2022
            - paragraph [ref=e279]: Designed and operated multi-agent test automation pipeline. First to introduce AI-generated test scripts in production QA workflow.
            - generic [ref=e280]:
              - generic [ref=e281]: GitHub Actions
              - generic [ref=e282]: Python
              - generic [ref=e283]: LLM Integration
              - generic [ref=e284]: CI/CD
          - generic [ref=e285]:
            - generic [ref=e289]:
              - generic [ref=e290]:
                - generic [ref=e291]: Various
                - generic [ref=e292]: ·
                - generic [ref=e293]: QA Engineer
                - generic [ref=e294]: 5+ Projects
              - generic [ref=e295]: 2017 — 2020
            - paragraph [ref=e296]: Built foundational automation frameworks, API test suites, and performance testing pipelines across e-commerce and fintech domains.
            - generic [ref=e297]:
              - generic [ref=e298]: Selenium
              - generic [ref=e299]: Postman
              - generic [ref=e300]: JMeter
              - generic [ref=e301]: MySQL
    - generic [ref=e302]:
      - paragraph [ref=e303]: Huu Vy · QA Lead · huuvy0109@gmail.com
      - paragraph [ref=e304]: Built with Next.js · TypeScript · Tailwind · Playwright · this page is the SUT
  - button "Open Next.js Dev Tools" [ref=e310] [cursor=pointer]:
    - img [ref=e311]
  - alert [ref=e314]
```

# Test source

```ts
  1  | /**
  2  |  * pipeline.spec.ts — Agent QC Generated (AI Agent Error — Simulated)
  3  |  *
  4  |  * Script này được sinh tự động bởi Agent QC từ Acceptance Criteria.
  5  |  * Locator [data-testid="card-ba-analyzing"] là lỗi của AI agent:
  6  |  *   - DOM thực tế dùng data-testid="card-US-002"
  7  |  *   - Card chỉ xuất hiện sau khi pipeline được trigger (~async)
  8  |  * → Expected behavior: FLAKY (timeout sau 2 lần retry)
  9  |  */
  10 | import { test, expect } from '@playwright/test'
  11 | 
  12 | test.describe('Pipeline Board', () => {
  13 |   test.beforeEach(async ({ page }) => {
  14 |     await page.goto('/')
  15 |   })
  16 | 
  17 |   test('pipeline board renders 4 columns', async ({ page }) => {
  18 |     await page.getByTestId('btn-run-pipeline').click()
  19 |     await expect(page.getByTestId('column-ba-analyzing')).toBeVisible()
  20 |     await expect(page.getByTestId('column-ready-for-dev')).toBeVisible()
  21 |     await expect(page.getByTestId('column-qc-generating')).toBeVisible()
  22 |     await expect(page.getByTestId('column-ci-running')).toBeVisible()
  23 |   })
  24 | 
  25 |   /**
  26 |    * ⚠️ AI AGENT ERROR — SIMULATED
  27 |    * Agent QC sinh sai locator: dùng "card-ba-analyzing" thay vì "card-US-002".
  28 |    * Test này sẽ FLAKY: locator không tồn tại trong DOM → timeout → FAIL.
  29 |    * Đây là hành vi có chủ đích để demo Quality Gate workflow.
  30 |    */
  31 |   test('card moves to BA Analyzing column on trigger [AI Agent Error — Simulated]', async ({ page }) => {
  32 |     await page.getByTestId('btn-run-pipeline').click()
  33 | 
  34 |     // ⚠️ Wrong locator generated by Agent QC
  35 |     // Actual testid is: card-US-002 (not card-ba-analyzing)
  36 |     const card = page.getByTestId('card-ba-analyzing')
> 37 |     await expect(card).toBeVisible({ timeout: 5000 })
     |                        ^ Error: expect(locator).toBeVisible() failed
  38 |   })
  39 | })
  40 | 
```