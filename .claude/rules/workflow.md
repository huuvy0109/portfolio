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

| Agent | Vai trò | Chuyên môn |
|-------|---------|-----------|
| **Agent PO** | Product Owner: Phân tích yêu cầu, định hình feature, chốt Scope. | Scope Management, User Stories |
| **Agent BA** | Business Analyst: Phân tích logic chi tiết, xác định Edge cases, lập plan. | Acceptance Criteria, Business Logic |
| **Agent DEV** | Developer: Viết code, fix bug, thêm `data-testid` trước khi bàn giao. | Diff-only output, Coding Standard |
| **Agent QC** | Quality Control: Audit `data-testid` → Generate spec → Chạy Playwright. | Automated Testing, Phân loại lỗi |
| **Tracking/Trello** | Theo dõi tiến trình, ghi log jsonl, cập nhật trạng thái Trello. | Structured logging, Workflow Automation |


---

## 1b. Agent QC — Trách nhiệm & Quy trình BẮT BUỘC

> **Agent QC PHẢI thực hiện đủ 4 bước sau theo thứ tự. Bỏ bước nào = vi phạm.**

### Bước T1 — Audit `data-testid`
Trước khi viết bất kỳ test nào, Agent QC **phải** kiểm tra toàn bộ component trong scope:
- Liệt kê các element cần test
- Xác nhận `data-testid` đã có hay chưa
- Nếu thiếu → **STOP**, yêu cầu Agent DEV thêm `data-testid` trước
- **KHÔNG ĐƯỢC** dùng CSS class selector hoặc text selector thay thế khi testid bị thiếu

### Bước T2 — Generate Spec (theo scope đầy đủ)

Agent QC phải cover **toàn bộ** các luồng sau khi có thay đổi liên quan:

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

```text
npx playwright test --reporter=list
```

Sau khi chạy, Agent QC phải báo cáo theo format:

```
[PASS]  hero.spec.ts             4/4
[PASS]  auth.spec.ts             5/5
[FLAKY] pipeline.spec.ts         1/2  ← AI Agent Error — Simulated (có chủ đích)
[FAIL]  projects.spec.ts         2/4  ← Code Bug / Test Issue / Env Issue
```

Phân loại failure:
- **Code Bug** → báo Agent DEV fix → retry (max 3)
- **Test Issue** → fix test spec → rerun (KHÔNG sửa code)
- **Env Issue** → STOP, label `[BLOCKED]`, báo user
- **Intentional Flaky** → giữ nguyên, label rõ `(AI Agent Error — Simulated)`

### Bước T4 — Coverage Report

Sau mỗi run, Agent QC phải xuất tổng kết:

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
[1] Agent DEV → implement
[2] Agent QC → generate + run Playwright test case cho thay đổi (tối thiểu 1 critical case)
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
[1] Agent PO → phân tích yêu cầu, chốt Scope
[2] Agent BA → lập implementation plan và Acceptance Criteria
──────────────────────────────────────────────────────
⚠️ CONFIRM 1: Trình bày plan → CHỜ USER DUYỆT
    → Nếu KHÔNG duyệt: yêu cầu BA chỉnh lại plan
    → Nếu duyệt: MỚI được tiếp tục bước [3]
──────────────────────────────────────────────────────
[3] Agent DEV → implement theo đúng plan đã duyệt
[4] Agent QC → generate Playwright test case tương ứng với thay đổi ở bước [3]
        → Viết test cover: happy path + edge case + negative case
        → Chạy test → Xuất run_report + screenshot nếu fail
[5] Failure Classification:
        - Code Bug   → Agent DEV fix → retry (max 3)
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

### Quy tắc Generate Test Case (Agent QC — BẮT BUỘC)

Mỗi khi Agent DEV hoàn thành bước implement, Agent QC **phải** thực hiện đủ Bước T1→T4 (xem mục 1b).

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

- **Selector:** Ưu tiên `data-testid`. Nếu chưa có → STOP, yêu cầu Agent DEV thêm trước.
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

## 7. Quy tắc vận hành QA Automation Workspace (Command Center)

QA Workspace được quản lý tập trung thông qua hệ thống **QA Command Center** (Giao diện Dashboard tại `/dashboard/[slug]`).

### Quản lý Artifacts & Reports
- **Upload Report:** Sau khi chạy test automation hoàn tất, kết quả sẽ được tự động đồng bộ lên Dashboard thông qua endpoint `POST /api/reports/upload`. Việc này giúp hệ thống tracking toàn bộ Project Runs.
- **Visual Artifacts:** Với các test case FAIL, bắt buộc phải capture **Screenshot** và **Trace file**, sau đó nhúng vào HTML Report (blobUrl). Dashboard UI cung cấp nút `Open HTML Report ↗` cho phép mở file report này.
- Các file artifacts local nằm ở `test-results/` tuyệt đối không commit lên Git, mà được upload lên storage và liên kết với Dashboard.

### CI/CD Triggering
- **Manual Trigger:** Người quản trị có thể kích hoạt luồng CI Pipeline ngay từ giao diện QA Command Center thông qua nút **▶ Trigger CI** (gọi API `POST /api/projects/:id/trigger`).
- **Gatekeeper:** Mọi lượt đẩy code mới (Merge/Push) lên nhánh `main` cũng tự động chạy Playwright E2E tests trên CI.

### Phân tích và Bảo trì Script
- Giao diện **Run Detail Modal** cung cấp thống kê chi tiết tới từng test case, bao gồm trạng thái (Passed/Failed/Skipped), Error message, Thời gian chạy, và **Retry count** (giúp dễ dàng phát hiện test có xu hướng flaky).
- **Self-Healing:** Khi UI thay đổi khiến test bị gãy do sai locator (Test Issue), **Agent QC** phải tự động tìm locator mới và vá lại script test. KHÔNG bắt DEV phải sửa code chính chỉ để test pass.
- **Anti-Flaky:** Cấm lạm dụng hàm sleep tĩnh (ví dụ `page.waitForTimeout()`). Bắt buộc dùng auto-waiting (ví dụ `expect(locator).toBeVisible()`) để đảm bảo test ổn định.

---

*(Ghi chú: Thông tin các Sprints đã được tách sang file `.claude/sprints.md` để tiện theo dõi. Khi cần tra cứu, tạo mới sprint (ở Full Mode) hoặc cập nhật status, hãy đọc/chỉnh sửa file đó.)*
