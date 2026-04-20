# Portfolio Workflow (Strict Process Edition)

Quy chuẩn quy trình làm việc cho "Living Portfolio" — tối ưu cost · stability · quality.  
Concept: trang web IS the Subject Under Test. Triết lý "Imperfect Reality".

---

## 0. QUY TẮC BẮT BUỘC — CLAUDE PHẢI TUÂN THỦ TUYỆT ĐỐI

> **VI PHẠM BẤT KỲ QUY TẮC NÀO DƯỚI ĐÂY LÀ KHÔNG CHẤP NHẬN.**

### 🔴 HARD STOP Rules

1. **KHÔNG ĐƯỢC viết code / chỉnh sửa file trước khi có CONFIRM tương ứng.**
   - FAST MODE: KHÔNG implement trước khi user yêu cầu.
   - FULL MODE: KHÔNG implement trước khi có **CONFIRM 1** (user duyệt plan).

2. **Mỗi CONFIRM là một điểm DỪNG HOÀN TOÀN.** Claude phải:
   - Trình bày rõ output của bước hiện tại.
   - Đặt câu hỏi xác nhận với prefix `⚠️ CONFIRM [N]:`.
   - **Chờ user gõ xác nhận** — KHÔNG tự tiếp tục bước tiếp theo.

3. **Thứ tự các bước là bắt buộc, không được bỏ qua bất kỳ bước nào.**
   - FULL MODE: Planning → **CONFIRM 1** → Dev → Test → **CONFIRM 2** → **CONFIRM 3**.

4. **Nếu user interrupt (yêu cầu dừng / thay đổi):**
   - Dừng ngay lập tức.
   - Revert mọi thay đổi chưa được CONFIRM 2.
   - Quay lại bước phù hợp.

5. **Không được tự ý mở rộng scope** ngoài những gì đã được duyệt trong plan (CONFIRM 1).

---

## 1. Agent System

| Agent | Vai trò | Chiến lược |
|-------|---------|-----------|
| **Researcher** | Phân tích yêu cầu, lập plan, đọc codebase | Cached codebase map |
| **Reviewer** | Validate plan theo DoD trước khi implement | Scale theo độ dài plan |
| **Agent Dev** | Viết code, fix bug, thêm `data-testid` trước khi bàn giao | Diff-only output |
| **Agent Tester** | Audit `data-testid` → Generate spec → Chạy Playwright → Báo kết quả | Artifacts + log truncation |
| **Tracking Agent** | Theo dõi tiến trình, retry, ghi log | Structured logging |

### Reviewer Mode Selection
```
IF thay đổi < 50 dòng AND single component:
    review nhanh, không cần agent riêng
ELSE:
    spawn Explore agent để review độc lập
```

---

## 1b. Agent Tester — Trách nhiệm & Quy trình BẮT BUỘC

> **Agent Tester PHẢI thực hiện đủ 4 bước sau theo thứ tự. Bỏ bước nào = vi phạm.**

### Bước T1 — Audit `data-testid`
Trước khi viết bất kỳ test nào, Agent Tester **phải** kiểm tra toàn bộ component trong scope:
- Liệt kê các element cần test
- Xác nhận `data-testid` đã có hay chưa
- Nếu thiếu → **STOP**, yêu cầu Agent Dev thêm `data-testid` trước
- **KHÔNG ĐƯỢC** dùng CSS class selector hoặc text selector thay thế khi testid bị thiếu

### Bước T2 — Generate Spec (theo scope đầy đủ)

Agent Tester phải cover **toàn bộ** các luồng sau khi có thay đổi liên quan:

| Scope | File spec | Test cases bắt buộc |
|-------|-----------|---------------------|
| **Login / Auth** | `auth.spec.ts` | Valid login → redirect dashboard · Invalid credentials → error msg · Empty fields → block submit · Unauthenticated → redirect /login · Session guard trên mọi /dashboard/* route |
| **Dashboard Home** | `dashboard.spec.ts` | Welcome + username render · Link Projects → /dashboard/projects · Link Users → /dashboard/users |
| **Projects** | `projects.spec.ts` | List render (empty state + có data) · New Project btn → show form · Slug auto-generate từ name · Create success → append list · Create duplicate slug → error · Delete → confirm dialog → remove khỏi list |
| **Project Runs / Trigger CI** | `project-runs.spec.ts` | Run table render (status badge, timestamp, passed/failed/skipped) · Detail modal open → load results · Detail modal close · Trigger CI btn visible khi có ciConfig · Trigger CI → success/error message |
| **Hero Section** | `hero.spec.ts` | Heading · CTA button · Stats 4 items · Page title |
| **Pipeline Board** | `pipeline.spec.ts` | 4 cột render · Trigger pipeline · Intentional flaky (có label AI Agent Error) |
| **Journey / Accordion** | `journey.spec.ts` | Section render · Accordion expand/collapse · Company names visible · Year labels · Project links |
| **Sanitizer** | `sanitizer.spec.ts` | Section render · Heading · Re-scan btn → SCANNING state |
| **History** | `history.spec.ts` | Hidden ban đầu · Hiện sau ≥ 2 runs · Heading text |
| **Footer** | `footer.spec.ts` | Visible · Email · Tech stack text |
| **Theme / Language** | `theme-lang.spec.ts` | 3 theme buttons tồn tại · Switch theme → class thay đổi · EN/VI toggle → text thay đổi |
| **Sidebar** | `sidebar.spec.ts` | Render desktop · Collapse/expand mobile · Active link state |

### Bước T3 — Chạy test & phân loại kết quả

```
npx playwright test --reporter=list
```

Sau khi chạy, Agent Tester phải báo cáo theo format:

```
[PASS]  hero.spec.ts             4/4
[PASS]  auth.spec.ts             5/5
[FLAKY] pipeline.spec.ts         1/2  ← AI Agent Error — Simulated (có chủ đích)
[FAIL]  projects.spec.ts         2/4  ← Code Bug / Test Issue / Env Issue
```

Phân loại failure:
- **Code Bug** → báo Agent Dev fix → retry (max 3)
- **Test Issue** → fix test spec → rerun (KHÔNG sửa code)
- **Env Issue** → STOP, label `[BLOCKED]`, báo user
- **Intentional Flaky** → giữ nguyên, label rõ `(AI Agent Error — Simulated)`

### Bước T4 — Coverage Report

Sau mỗi run, Agent Tester phải xuất tổng kết:

```
Total specs : N files
Total cases : X cases
Passed      : X
Failed      : X  (Code Bug: n | Test Issue: n | Env: n)
Flaky       : X  (Simulated — intentional)
Coverage gap: [list spec files còn thiếu nếu có]
```

### Coverage Threshold (HARD RULE)

- **Critical paths** (auth, dashboard, projects, runs): **100% must pass**
- **Public portfolio** (hero, pipeline, journey, sanitizer, footer, history): **100% must pass** (trừ intentional flaky)
- **Không được submit CONFIRM 2 nếu còn unclassified FAIL**

---

## 2. Mode Selection & Workflow

### ⚡ FAST MODE (Cấp tốc)
**Tiêu chí:** UI minor, logic thay đổi < 20 dòng, không ảnh hưởng store/pipeline state.

```
[1] Agent Dev → implement
[2] Agent Tester → generate + run Playwright test case cho thay đổi (tối thiểu 1 critical case)
[3] npm run build → TypeScript check
─────────────────────────────────────────
⚠️ CONFIRM DUY NHẤT: Trình bày diff + test result → CHỜ USER
─────────────────────────────────────────
[4] Commit (chỉ sau khi user confirm)
```
Max retry: 1. Nếu fail → escalate lên FULL MODE.

---

### 🛡️ FULL MODE (Toàn diện)
**Tiêu chí:** Tính năng mới, refactor lớn, thay đổi Zustand store, thêm component mới.

```
[1] Researcher → đọc codebase liên quan, lập implementation plan
[2] Reviewer → validate plan theo DoD
──────────────────────────────────────────────────────
⚠️ CONFIRM 1: Trình bày plan → CHỜ USER DUYỆT
    → Nếu KHÔNG duyệt: chỉnh plan, lặp lại bước này
    → Nếu duyệt: MỚI được tiếp tục bước [3]
──────────────────────────────────────────────────────
[3] Agent Dev → implement theo đúng plan đã duyệt
[4] Agent Tester → generate Playwright test case tương ứng với thay đổi ở bước [3]
        → Viết test cover: happy path + edge case + negative case
        → Chạy test → Xuất run_report + screenshot nếu fail
[5] Failure Classification:
        - Code Bug   → Agent Dev fix → retry (max 3)
        - Test Issue → fix test → rerun (không sửa code)
        - Env Issue  → STOP, label [Blocked]
──────────────────────────────────────────────────────
⚠️ CONFIRM 2: Trình bày Code Diff + Test Report → CHỜ USER
    → Nếu KHÔNG duyệt: quay lại bước [3]
    → Nếu duyệt: MỚI được tiếp tục bước [6]
──────────────────────────────────────────────────────
⚠️ CONFIRM 3: Xác nhận commit → CHỜ USER
    → Nếu KHÔNG duyệt: DỪNG
    → Nếu duyệt: git commit
──────────────────────────────────────────────────────
```

---

## 3. Playwright & Artifact Rules

- **Cấu trúc:** `test-results/screenshots/{run_id}/` và `test-results/{run_id}.md`
- **Rules:** Screenshot bắt buộc khi fail. Log lỗi trích xuất tối đa 50 dòng.
- **Env Check:** `IF localhost:3000 not available → return [BLOCKED] Env Issue`
- **Flaky test:** KHÔNG fix để pass — đây là "Imperfect Reality" có chủ đích. Label rõ `(AI Agent Error — Simulated)` trong UI.

### Quy tắc Generate Test Case (Agent Tester — BẮT BUỘC)

Mỗi khi Agent Dev hoàn thành bước implement, Agent Tester **phải** thực hiện đủ Bước T1→T4 (xem mục 1b).

**Quy tắc viết spec:**

| Loại thay đổi | Test case bắt buộc |
|--------------|-------------------|
| Component UI mới | Render test + interaction test + responsive check |
| Logic / state thay đổi | Happy path + edge case + negative case |
| Form / input | Validation test + error state + submit flow |
| Animation / scroll | Visibility test (whileInView, AnimatePresence) |
| Navigation / routing | Link đúng target + scroll-to behavior |
| Auth / protected route | Valid login · Invalid login · Unauthenticated redirect · Session guard |
| CRUD (projects, users) | Create success · Create error · Delete confirm · List render |
| CI trigger | Button hiển thị đúng điều kiện · Trigger success · Trigger error |

- **Selector:** Ưu tiên `data-testid`. Nếu chưa có → STOP, yêu cầu Agent Dev thêm trước.
- **Auth fixture:** Dashboard tests dùng `storageState` (Playwright auth setup) — KHÔNG login thủ công trong mỗi test.
- **Naming:** `describe('[ComponentName]') → it('should [behavior] when [condition]')`
- **Không hardcode** delay — dùng `waitFor` / `expect().toBeVisible()`
- File test đặt tại `tests/e2e/`, đặt tên theo component: `journey.spec.ts`, `hero.spec.ts`…
- **Auth setup file:** `tests/e2e/setup/auth.setup.ts` — chạy 1 lần trước toàn bộ dashboard tests

---

## 4. Definition of Done (DoD)

| Loại | Tiêu chí |
|------|---------|
| **Build** | `npm run build` pass, 0 TypeScript error |
| **UI** | Layout không vỡ. Không overflow. Responsive mobile Chrome. |
| **Animation** | Không flash < 150ms. Cards animate đúng phase. |
| **State** | `runId` guard hoạt động — reset không gây stale callback. |
| **Test** | Pass 100% critical test case. Flaky test có label rõ ràng. |
| **Accessibility** | Contrast ratio đạt WCAG AA. |

---

## 5. Token Optimization

- **Context Isolation:** Không truyền chat history thừa vào agent.
- **Diff-Only Output:** Trả format diff khi sửa file lớn.
- **Mock-first:** Sprint 1–2 dùng mock JSON. Không gọi real API/CI trước Sprint 2.

---

## 6. Quy tắc vận hành Portfolio

### Imperfect Reality
- Test fail, retry, flaky là **có chủ đích** — không fix để chúng pass.
- Luôn có context label cho visitor: `(AI Agent Error — Simulated)`.
- Quality Gate là tính năng, không phải bug.

### Consequence UI
- Override → card stamp đỏ `RISK`, audit log ghi timestamp + action.
- Reject → card quay về cột QC, log ghi "retrain queued".
- Mọi quyết định human phải để lại "vết" rõ ràng — không được mất state sau reload.

### Scope Control
- Không tự ý thêm feature ngoài sprint plan.
- Mọi ý tưởng mới → ghi vào backlog, không implement ngay.

---

## 7. Sprint Status

### ✅ Sprint 1 — Foundation (DONE)
- [x] Next.js 16 + TypeScript + Tailwind v4
- [x] Dark theme + film grain CSS
- [x] Hero Section, PipelineBoard, TerminalUI, QualityGate
- [x] Zustand store + simulation timeline ~15s
- [x] `lib/decision-engine.ts` rule-based gate
- **DoD đạt:** `npm run build` pass, 0 lỗi TypeScript

### ✅ Sprint 2 — Evidence & Flaky Logic (DONE)
- [x] `tests/e2e/hero.spec.ts` (expect PASS)
- [x] `tests/e2e/pipeline.spec.ts` — locator sai có chủ đích (expect FLAKY)
- [x] `.github/workflows/playwright.yml` — CI export HTML report
- [x] `SanitizerVisualizer` — code diff UI + masking `[REDACTED]`
- [ ] Nhúng Playwright report link vào TerminalUI footer
- **DoD:** CI chạy trên GitHub, có ≥ 1 flaky scenario visible trong UI

### 🔲 Sprint 3 — Polish & Human Loop
- [ ] Glow effect chiaroscuro refinement
- [ ] History Log: Test v1 (lỗi) vs v2 (đã sửa)
- [ ] Mobile: Terminal collapse → Summary card
- [ ] Error boundary cho Pipeline section
- **DoD:** Override/Reject hoạt động đúng. Chạy tốt mobile Chrome.

### 🔲 Sprint 4 — Go-Live
- [ ] Lighthouse ≥ 85 Performance, ≥ 90 Accessibility
- [ ] SEO metadata + OG image + sitemap
- [ ] Vercel Analytics
- [ ] Custom domain live
- **DoD:** Lighthouse pass, domain live, mobile Chrome OK
