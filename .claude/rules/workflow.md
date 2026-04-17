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
| **Agent Dev** | Viết code, fix bug | Diff-only output |
| **Agent Tester** | Viết + chạy Playwright test, báo lỗi | Artifacts + log truncation |
| **Tracking Agent** | Theo dõi tiến trình, retry, ghi log | Structured logging |

### Reviewer Mode Selection
```
IF thay đổi < 50 dòng AND single component:
    review nhanh, không cần agent riêng
ELSE:
    spawn Explore agent để review độc lập
```

---

## 2. Mode Selection & Workflow

### ⚡ FAST MODE (Cấp tốc)
**Tiêu chí:** UI minor, logic thay đổi < 20 dòng, không ảnh hưởng store/pipeline state.

```
[1] Agent Dev → implement
[2] Agent Tester → run 1 critical test case
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
[4] Agent Tester → viết + chạy Playwright test
        → Xuất run_report + screenshot nếu fail
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

### 🔲 Sprint 2 — Evidence & Flaky Logic
- [ ] `tests/e2e/hero.spec.ts` (expect PASS)
- [ ] `tests/e2e/pipeline.spec.ts` — locator sai có chủ đích (expect FLAKY)
- [ ] `.github/workflows/playwright.yml` — CI export HTML report
- [ ] `SanitizerVisualizer` — code diff UI + masking `[REDACTED]`
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
