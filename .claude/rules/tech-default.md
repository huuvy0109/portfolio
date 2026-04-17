# Tech Defaults

## Stack
| Layer | Tool | Version |
|-------|------|---------|
| Framework | Next.js App Router | 16.2.4 |
| Language | TypeScript strict | 5.x |
| Styling | TailwindCSS v4 + CSS Variables | 4.x |
| Animation | Framer Motion | 12.x |
| State | Zustand | 5.x |
| Charts | Recharts | 3.x |
| Testing | Playwright | — |
| Hosting | Vercel (CI/CD) | — |

## Cấu trúc thư mục
```
app/
  layout.tsx          # Root layout + metadata SEO
  page.tsx            # Main SPA — compose tất cả sections
  globals.css         # CSS variables + film grain + animations
components/
  hero/               # HeroSection
  pipeline-board/     # PipelineBoard (Kanban 4 cột)
  terminal/           # TerminalUI (log stream realtime)
  quality-gate/       # QualityGate (Override / Reject + audit trail)
  sanitizer/          # SanitizerVisualizer (Sprint 2)
  journey/            # Professional Journey
lib/
  store/pipelineStore.ts    # Zustand — simulation engine + log state
  hooks/useRandomDelay.ts   # randomDelay(min, max) + nowTimestamp()
  decision-engine.ts        # evaluate(failCount, retryCount) → GateResult
mock-data/                  # JSON (Sprint 1 dùng, Sprint 2 thay bằng real report)
tests/e2e/                  # Playwright scripts
.github/workflows/          # CI pipeline YAML
```

## State Management — Zustand
- Store duy nhất: `usePipelineStore` tại `lib/store/pipelineStore.ts`
- Không tạo thêm store riêng — mở rộng interface hiện tại nếu cần
- Dùng `usePipelineStore.getState()` trong event handler (ngoài React tree)
- `runId` guard bắt buộc trong mọi `setTimeout` closure để tránh stale callback sau reset

## Pipeline Phase Machine
```
idle → ba-analyzing → ready-for-dev → qc-generating → ci-running → quality-gate → completed
                                                                                  → rejected
```

## Simulation Timeline (pipelineStore trigger())
| Thời điểm | Sự kiện |
|-----------|---------|
| 0ms | Phase: ba-analyzing |
| 2800ms | Phase: ready-for-dev |
| 4500ms | Phase: qc-generating |
| 7500ms | Phase: ci-running |
| 11500ms | retryCount +1 (retry #1) |
| 13000ms | retryCount +1, isFlaky=true (retry #2) |
| 15400ms | failCount +1, phase: quality-gate |

## Decision Engine Rules
```ts
failCount > 0   → GATE_BLOCKED    // Block pipeline, yêu cầu human decision
retryCount > 1  → FLAKY_DETECTED  // Flag ⚠️, log audit trail
default         → PASS
```

## Coding Conventions
- Mọi component dùng hook hoặc browser API → `'use client'` ở đầu file
- Không hardcode `setTimeout` delay < 100ms (gây layout thrash)
- Không dùng `any` — TypeScript strict phải pass
- Không swallow error trong store actions — log rõ ràng
- Selector Playwright: ưu tiên `data-testid`, tránh CSS class selector

## Decisions đã chốt (không revert)
| Quyết định | Lý do |
|-----------|-------|
| Zustand thay Context | Dễ debug, ít boilerplate, `.getState()` dùng được ngoài React |
| Mobile Terminal: Collapse + Summary | Terminal log khó đọc trên mobile nhỏ |
| Label AI error rõ ràng trong UI | Tránh visitor nhầm lỗi simulation là bug thật của trang |
