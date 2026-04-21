# Portfolio Sprints & Roadmap

> **Quy trình Quản lý Sprint:**
> - Khi có Big Update hoặc chạy task ở **FULL MODE**, bắt buộc gọi **Agent PO** và **Agent BA** để phân tích yêu cầu.
> - Sau khi phân tích, phải khởi tạo thêm một Sprint/Task lớn mới vào file này.
> - Khi mọi task trong Sprint đã được xử lý và đạt DoD, phải cập nhật trạng thái Sprint thành `✅ (DONE)` và tick `[x]` tất cả các đầu mục.

---

## Danh sách Sprints

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
- [x] Nhúng Playwright report link vào TerminalUI footer
- **DoD đạt:** CI chạy trên GitHub, có ≥ 1 flaky scenario visible trong UI

### ✅ Sprint 3 — Polish & Human Loop (DONE)
- [x] Glow effect chiaroscuro refinement
- [x] History Log: Test v1 (lỗi) vs v2 (đã sửa)
- [x] Mobile: Terminal collapse → Summary card
- [x] Error boundary cho Pipeline section
- **DoD đạt:** Override/Reject hoạt động đúng. Chạy tốt mobile Chrome.

### ✅ Sprint 4 — Go-Live (DONE)
- [x] Lighthouse ≥ 85 Performance, ≥ 90 Accessibility
- [x] SEO metadata + OG image + sitemap
- [x] Vercel Analytics
- [x] Custom domain live
- **DoD đạt:** Lighthouse pass, domain live, mobile Chrome OK
