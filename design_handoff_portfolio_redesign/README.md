# Handoff: Portfolio Redesign

## Overview
This is a high-fidelity redesign of the QC Engineer portfolio for **Vy Quang Huu**. The redesign introduces a **fixed sidebar navigation + scrollable main content** layout, a **bilingual EN/VI language switcher**, and **3 selectable color themes**. All interactive sections (pipeline simulation, journey timeline, test history, sanitizer) are fully functional in the prototype.

## About the Design Files
The files in this bundle are **design references built in HTML/React** — they are prototypes showing intended look and behavior. The task is to **recreate these designs inside the existing Next.js + TypeScript + Tailwind codebase**, using its established patterns, components, and file structure. Do **not** ship the HTML files directly.

- `Portfolio Redesign.html` — full prototype (open in browser to see the design)
- `components/pipeline.jsx` — pipeline simulation logic + UI
- `components/journey.jsx` — career timeline component
- `components/sections.jsx` — skills, test history, sanitizer components

## Fidelity
**High-fidelity.** The prototype is pixel-accurate with final colors, typography, spacing, states, and interactions. Recreate the UI precisely, using the existing Tailwind config and component patterns.

---

## Design System / Tokens

### Typography
| Role | Font | Size | Weight |
|---|---|---|---|
| Display / Headings | Space Grotesk | 1.75rem–5.5rem | 700 |
| Mono / Labels / Data | JetBrains Mono | 9px–13px | 400–600 |
| Body | Space Grotesk | 12px–14px | 400 |

Both fonts are already imported in the existing `globals.css` via `--font-display` and `--font-mono`.

### Color Themes (3 options)
The page supports 3 themes toggled via `data-theme` on `<body>`. Recommend storing in `localStorage` under key `pf-theme`.

#### Theme A — Editorial (default)
```css
--bg:           #0f0e0d;
--surface-1:    #141210;
--surface-2:    #1c1916;
--surface-3:    #252119;
--border:       rgba(255,255,255,0.07);
--text-primary: #ede8df;
--text-secondary:#a89f92;
--text-dim:     #6b635a;
--accent:       oklch(72% 0.14 52);   /* warm amber */
--accent-rgb:   210,150,60;
--accent2:      oklch(68% 0.15 320);  /* violet */
--accent3:      oklch(72% 0.14 155);  /* emerald */
--warn:         oklch(78% 0.14 75);
--danger:       oklch(65% 0.18 20);
```

#### Theme B — Sovereign
```css
--bg:           #0b0d12;
--surface-1:    #0f1218;
--surface-2:    #161a22;
--surface-3:    #1e2430;
--border:       rgba(255,255,255,0.06);
--text-primary: #d8e8f2;
--text-secondary:#7a9ab0;
--text-dim:     #4a6070;
--accent:       #00c8e0;              /* refined cyan */
--accent-rgb:   0,200,224;
--accent2:      oklch(70% 0.15 280);
--accent3:      oklch(72% 0.14 155);
--warn:         #f5c518;
--danger:       #ff4d6a;
```

#### Theme C — Verdant
```css
--bg:           #0b100d;
--surface-1:    #0f1510;
--surface-2:    #161e17;
--surface-3:    #1d261e;
--border:       rgba(255,255,255,0.06);
--text-primary: #ddeedd;
--text-secondary:#82a88a;
--text-dim:     #4e6e52;
--accent:       oklch(72% 0.17 150);  /* emerald */
--accent-rgb:   60,200,120;
--accent2:      oklch(68% 0.13 200);
--accent3:      oklch(70% 0.15 260);
--warn:         oklch(78% 0.15 75);
--danger:       oklch(65% 0.18 20);
```

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (220px fixed, full height, scrollable)      │  MAIN CONTENT (flex:1, margin-left:220px)
│  - Avatar + name + role                              │  padding: 0 52px 0 48px
│  - Status pill (Online / Running)                    │
│  - EN | VI language toggle                           │  ┌─ Hero ──────────────────────────────┐
│  - Nav links (active = accent bar + highlight)       │  ├─ Pipeline ──────────────────────────┤
│  - CV download buttons (EN / VI)                     │  ├─ Journey ───────────────────────────┤
│  - LinkedIn link                                     │  ├─ Skills ────────────────────────────┤
│                                                      │  ├─ Test History ──────────────────────┤
│  background: var(--surface-1)                        │  ├─ Sanitizer ─────────────────────────┤
│  border-right: 1px solid var(--border)               │  └─ Footer ──────────────────────────┘
└─────────────────────────────────────────────────────┘
```

### Sidebar internals (top → bottom)
1. **Avatar** — 40×40px, border-radius 50%, border `1.5px solid rgba(accent, 0.45)`, glow shadow
2. **Name** — `Space Grotesk 700 14px`, color `--text-primary`
3. **Role badge** — `JetBrains Mono 9px uppercase`, color `--text-dim`
4. **Status pill** — inline flex, `border-radius 20px`, accent bg 8%, accent border 20%. Dot pulses when pipeline is running.
5. **Language toggle** — Two buttons `EN` | `VI`, `flex: 1` each, `border-radius 6px`. Active: accent bg + accent border. Inactive: transparent + `--border`.
6. **Nav label** — `JetBrains Mono 9px uppercase`, color `--text-dim`
7. **Nav items** — `JetBrains Mono 11px`, `padding 7px 10px`, `border-radius 7px`. Active state: accent bg 10%, accent color, 2×12px accent bar on left. Hover: `rgba(255,255,255,0.04)` bg.
8. **CV buttons** — `flex row`, two equal buttons. EN: accent color + accent border. VI: dim color + `--border`.
9. **LinkedIn** — `JetBrains Mono 9px`, centered, hover turns accent.

---

## Sections

### 1. Hero (`id="hero"`)
- Top eyebrow: `24px wide accent line` + `JetBrains Mono 10px uppercase` role label
- Name: `HUU VY` — gradient text (text-primary → accent → text-secondary), `font-size clamp(3.2rem, 6vw, 5.5rem)`, `letter-spacing -0.03em`, `line-height 0.92`
- Description: `14px`, `--text-secondary`, `max-width 500px`, `line-height 1.75`
- Stats row: 4 items — value in `JetBrains Mono 1.7rem 700 accent`, label in `JetBrains Mono 9px uppercase text-dim`, `gap 36px`
- CTA primary: accent bg 10%, accent border 50%, `border-radius 7px`, `padding 9px 20px`, hover → accent bg 18%
- CTA secondary: transparent bg, `--border`, hover → accent border 30% + text-primary
- Tags: `JetBrains Mono 9px uppercase`, `surface-2` bg, `border-radius 5px`, `gap 6px`
- Section separator: `border-bottom: 1px solid var(--border)`

### 2. Pipeline (`id="pipeline"`)
See `components/pipeline.jsx` for the full state machine. Key UI:

**Board** — CSS Grid `repeat(4, 1fr)`, `gap 10px`:
- Each column: `surface-2` bg, `border-radius 8px`, `padding 12px`, `min-height 130px`
- Active column: `accent bg 5%`, `accent border 25%`, animated dot
- Cards inside: `surface-3` bg, `border-radius 6px`, `padding 8px`. Failed: `danger bg 8%`, danger border. Flaky: `warn bg 8%`, warn border.
- Column short labels: `JetBrains Mono 9px uppercase`

**Terminal log** — `surface-1` bg, mac-style traffic light dots, auto-scrolls. `min-height 160px`, `max-height 200px`. Font `JetBrains Mono 11px line-height 1.7`.

**Quality Gate** — appears when `phase === 'gate'`. Red border + bg. Two action buttons: Override (danger style) + Reject (accent2 style).

**State machine phases:** `idle → ba → dev → qc → ci → gate → completed | rejected`

### 3. Journey (`id="journey"`)
Accordion-style vertical timeline. Click card header to expand/collapse.

- Vertical line: `1px`, `left: 5px`, gradient `accent2 → accent → accent3`, `opacity 0.3`
- Each node dot: `10×10px`, `border-radius 50%`, border = node accent color. Open: filled with accent + glow shadow.
- Cards: `surface-2` bg, `border-radius 10px`. Top `2px` accent gradient line. Hover: accent border 25%.
- Expanded content: description, optional AI stack / metrics panels, tags, link, optional award badge.
- 5 career nodes (newest first): KiLand → Seedcom Senior → Seedcom Lead → Haravan Specialist → Haravan Engineer

Each node has its own accent:
- KiLand: `--accent2` (violet)
- Seedcom: `--accent` (primary)
- Haravan: `--accent3` (emerald/blue)

### 4. Skills (`id="skills"`)
CSS Grid `repeat(2, 1fr)`, `gap 12px`. 4 groups:
- **Automation** (accent): Playwright, TypeScript, GitHub Actions, POM, CI/CD
- **AI Tooling** (accent2): Cursor AI, Claude AI, Playwright MCP, AI Test Generation
- **API & Integration** (accent3): Postman, REST APIs, Odoo ERP, Acumatica, WMS, GHN
- **Process & Management** (accent): Test Strategy, Jira, KPI Dashboard, Team Lead, Test Planning

Each group card: `surface-2` bg, hover → accent border 30%. Skill pills: accent bg 7%, accent border 18%, hover color → accent.

### 5. Test History (`id="history"`)
CSS Grid `1fr 1.4fr`, `gap 12px`.

- **Left**: 4 mock run rows (clickable). Selected row: `surface-3` bg + accent/danger border. Each row shows timestamp, PASS/FAIL badge, test count, duration.
- **Right**: Detail panel. Header with timestamp + duration. List of 6 spec files — passed: accent bg 3%; failed: danger bg 5%.

> In the real Next.js implementation, replace mock data with live fetches from `/api/reports` and `public/reports/registry.json` (already exists in the codebase).

### 6. Sanitizer (`id="sanitizer"`)
Single card: `surface-2` bg, `border-radius 10px`. Header shows scan status + re-scan button. 4 field rows animate one by one (600ms interval) from raw value → `[REDACTED:type]`.

Field colors: email → `accent3`, token → `danger`, phone → `warn`, name → `accent2`.

---

## Language System

Store selected language in `localStorage` key `pf-lang`. Default: `'en'`.

All user-visible text has EN and VI variants. Key translated strings:

| Element | EN | VI |
|---|---|---|
| Role | QC Engineer · AI Automation | Kỹ Sư QC · Tự Động Hóa AI |
| Hero CTA | ▶ Run Pipeline | ▶ Chạy Pipeline |
| Nav: Journey | Journey | Hành Trình |
| Nav: Skills | Skills | Kỹ Năng |
| Nav: Test History | Test History | Lịch Sử Test |
| Stat: Yrs Exp | Yrs Experience | Năm Kinh Nghiệm |
| Pipeline title | Enterprise QA Pipeline | Pipeline QA Doanh Nghiệp |
| Journey title | 7 Years in QA | 7 Năm Trong Nghề |
| Sanitizer title | Data Sanitization Pipeline | Pipeline Làm Sạch Dữ Liệu |
| Status | Online / Running | Trực Tuyến / Đang Chạy |

Pipeline terminal logs are also bilingual — see `components/pipeline.jsx` for full string tables.

---

## Interactions & Animations

| Element | Animation |
|---|---|
| Status dot (running) | `opacity 0.5 → 1` pulsing, `1s ease infinite` |
| Terminal cursor | `blink 1s step-end infinite` |
| Pipeline board columns | `transition: all 0.3s` on active state change |
| Journey accordion | `transform: rotate(180deg)` on chevron, smooth height |
| Nav active indicator | `transition: all 0.15s` |
| Skill pill hover | `color` transition `0.15s` |
| Sanitizer field reveal | Sequential `setTimeout` at 600ms intervals |
| Pipeline logs | Auto-scroll terminal on new entry |

Film grain overlay: `position: fixed`, `opacity: 0.025`, SVG fractalNoise texture, `pointer-events: none`, `z-index: 9999`.

---

## Active Section Tracking

Use `IntersectionObserver` with `rootMargin: '-30% 0px -60% 0px'` to highlight the current section in the sidebar nav as the user scrolls. Observe all 6 section elements by `id`.

---

## Implementation Notes for Claude Code

1. **Replace mock data** in Test History with real API calls to `/api/reports` and `/reports/registry.json`.
2. **Theme switching**: Add `data-theme` attribute to `<body>` and define CSS custom properties per theme (see tokens above). Persist in `localStorage`.
3. **Language switching**: Wrap the app with a `LanguageContext` (React Context), read `localStorage` on init. All content strings should live in a `translations.ts` file.
4. **Sidebar**: Use `position: fixed`, `width: 220px`. Main content gets `margin-left: 220px`.
5. **Pipeline store**: The existing `usePipelineStore` (Zustand) can be adapted — the design adds bilingual log messages, just pass the current `lang` when triggering.
6. **Scroll behavior**: Use `window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 24, behavior: 'smooth' })` instead of `scrollIntoView` (per project rules in CLAUDE.md).
7. **Fonts**: Both `Space Grotesk` and `JetBrains Mono` are already configured. Keep the `--font-display` and `--font-mono` CSS variables.

---

## Files in This Package

| File | Purpose |
|---|---|
| `Portfolio Redesign.html` | Full interactive prototype — open in browser |
| `components/pipeline.jsx` | Pipeline state machine, board, terminal, quality gate |
| `components/journey.jsx` | Career timeline with bilingual accordion cards |
| `components/sections.jsx` | Skills grid, test history panel, sanitizer visualizer |
| `avatar.jpg` | Profile photo (already in `public/avatar.jpg`) |
