# Design Rules

## Màu sắc & Theme
- Nền: `var(--bg-primary)` = `#080808` — tuyệt đối không dùng màu trắng hay light mode
- Không dùng `dark:` Tailwind prefix — toàn bộ màu qua CSS variables
- Inline style cho dynamic colors: `style={{ color: 'var(--accent-green)' }}`

## Accent Color Semantics
| Màu | Variable | Ý nghĩa |
|-----|----------|---------|
| Green | `var(--accent-green)` | Pass / Active / Online |
| Yellow | `var(--accent-yellow)` | Flaky / Warning |
| Red | `var(--accent-red)` | Fail / Block / Risk |
| Blue | `var(--accent-blue)` | System message |
| Purple | `var(--accent-purple)` | Agent action |
| Orange | `var(--accent-orange)` | Code / Locator highlight |

## Typography
- Font mono `var(--font-geist-mono)`: tất cả log, badge, label kỹ thuật, timestamp
- Font sans `var(--font-geist-sans)`: body text, mô tả, tiêu đề section

## Glow Effects (Chiaroscuro)
- Class `.glow-green / .glow-yellow / .glow-red / .glow-blue / .glow-purple`
- Chỉ apply khi component **đang active** (phase khớp với column)
- Không apply glow tĩnh — chỉ dùng để highlight trạng thái realtime

## Film Grain
- `body::after` — opacity `0.035`, background SVG fractalNoise
- Không tăng quá `0.05` — sẽ trông như artifact, không phải cinematic

## Animation
- Dùng Framer Motion `<motion.div>` cho card transition và mount/unmount
- `AnimatePresence` bao ngoài danh sách cards để animate exit
- `pulse-glow` keyframe cho indicator đang chạy (không dùng `animate-pulse` của Tailwind)
- Không dùng hard `transition-duration` < 150ms — gây flash

## Component Active State
- Column active: `background: rgba(255,255,255,0.012)` + accent underline dưới header
- Card active: border sáng hơn `rgba(255,255,255,0.1)` + glow class nếu fail
- Button hover: inline `onMouseEnter/Leave` vì dynamic color không handle được qua Tailwind
