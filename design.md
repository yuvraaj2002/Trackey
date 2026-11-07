# Trackey Design System

Personal spend tracker. Visual language is deliberately aligned with **Usora** and **UrgeLog (Perch)**: warm paper, one quiet teal accent, document-like pages, spacing instead of boxes.

Canonical tokens live in `ui/src/styles/tokens.css`. Change this file in the same commit when tokens change.

---

## Principles

1. **Calm.** Plenty of space, few elements, nothing competing for attention.
2. **Warm.** Ivory paper, soft shapes, gentle voice.
3. **Premium.** Restraint first — one accent, one display font.
4. **Document-like.** Pages read like clean Notion pages: left-aligned big title, simple blocks, quiet rows, hover instead of heavy cards.
5. **Native.** Should feel at home on a Mac desktop later (Tauri).

---

## Brand & voice

- **Name:** Trackey — sidebar wordmark only; never drowned by page chrome
- **Tone:** Clear, private, unhurried. Plain English labels (`Spends`, not `Transactions feed`)
- **Currency:** `₹` with two decimals and tabular figures

---

## Typography

Two fonts only.

| Role | Family | Use |
| --- | --- | --- |
| Display | **Fraunces Variable** → Georgia, serif | Page titles, section headings, brand, hero numbers |
| Interface | `-apple-system`, SF Pro Text, Helvetica Neue, Arial, sans-serif | Everything else |

Fraunces settings: `"SOFT" 100, "WONK" 0`, optical sizing automatic. Bundle via `@fontsource-variable/fraunces` (no remote font CDN).

Headings (`h1`–`h3`) default to Fraunces, medium weight, **accent** color, line-height 1.25, tracking `-0.01em`.

### Scale

| Style | Size / leading | Weight | Color |
| --- | --- | --- | --- |
| Page title | 40px / 1.15, tracking `-0.02em` | Medium | `accent` |
| Section heading | 18px | Medium | `accent` |
| Hero metric | 40px / 1.1 | Medium (Fraunces) | `fg` |
| Body | 15px / 1.55 | Regular | `fg` |
| Page description | 16px | Regular | `muted` |
| Controls / labels | 14px | Regular or medium | `fg` |
| Helper / meta | 13px | Regular | `muted` |
| Eyebrow | 11.5px, `0.04em`, uppercase | Semibold | `subtle` |

---

## Color

Light-only for v1. Warm paper neutrals + teal accent (same family as Usora / UrgeLog).

### Surfaces & text

| Token | Hex | Role |
| --- | --- | --- |
| `--bg` | `#fbf9f4` | App canvas |
| `--surface` | `#fffefb` | Raised / inputs |
| `--surface-sunken` | `#f5f2ea` | Recessed wells |
| `--sidebar` | `#f3efe6` | Sidebar |
| `--hover` | `#ece7db` | Hover wash |
| `--fg` | `#2a2722` | Primary text |
| `--muted` | `#655f55` | Secondary text |
| `--subtle` | `#7a7468` | Quiet meta |
| `--border` | `#e5e0d4` | Hairlines |
| `--border-strong` | `#c9c3b5` | Control borders |

### Accent & status

| Token | Hex |
| --- | --- |
| `--accent` | `#2f6b66` |
| `--accent-hover` | `#275955` |
| `--accent-fg` | `#ffffff` |
| `--accent-soft` | `#e3eeeb` |
| `--accent-soft-fg` | `#235450` |
| `--danger` | `#a3372b` |
| `--danger-hover` | `#8b2d23` |
| `--danger-soft` | `#f8e9e5` |
| `--danger-soft-fg` | `#80281e` |
| `--overlay` | `rgb(42 39 34 / 0.32)` |
| `--shadow-color` | `rgb(60 50 30 / 0.12)` |

Teal is the only accent. Danger only for destructive actions and real errors. Never raw hex in components.

---

## Layout

| Element | Value |
| --- | --- |
| Sidebar | 220px, `--sidebar`, right hairline |
| Page column | Full main pane width (equal left/right padding) |
| Page padding | 40px sides, 32px top, 56px bottom |
| Controls | 44px tall; hover steps 1px up, press sinks + scale `.985` |
| Tables | Equal column widths; timestamps in IST; icon row actions |
| Page header gap | 32px below |
| Section stack gap | 40px |
| Drag region (future Tauri) | 36px top |

Prefer spacing and hairline dividers to cards. Cards/panels only for interactive editors and dense metric clusters that need grouping.

---

## Shape & depth

| Token | Value | Use |
| --- | --- | --- |
| `--radius-control` | 8px | Buttons, inputs, nav items |
| `--radius-panel` | 12px | Sheets, notices |
| `--shadow-popover` | `0 8px 28px var(--shadow-color)` | Floating only |

Everything else stays flat.

---

## Components

### Navigation

- Brand: Fraunces / accent / ~17–22px
- Items: 14–14.5px, icons 16–18px stroke 1.75 (Lucide)
- Active: `--accent-soft` fill + `--accent-soft-fg` text
- Idle: `--muted`; hover `--hover` + `--fg`
- Optional nav groups with uppercase 11.5px eyebrows

### Buttons

| Kind | Spec |
| --- | --- |
| Medium | 38px tall, 16px side pad, 14px medium |
| Small | 32px tall, 12px side pad, 13px medium |
| Primary | accent fill (one per view) |
| Secondary | surface + border-strong |
| Ghost | transparent until hover |
| Danger | soft or solid; always confirm destructive |

No `border-radius: 999px` marketing pills for primary actions.

### Inputs

38px tall, 12px pad, border-strong, focus ring = 1px accent outline companion.

### Lists

- Quiet rows, hairline dividers, hover wash
- Row actions stay always visible (categories Delete; spends Edit/Delete capsule)
- No card stacks for list items

### Stats

Horizontal metric strip with hairline separators — not boxed cards (UrgeLog pattern).

### Sheets / modals

Centered dialog, surface, radius-panel, soft popover shadow, Escape to close, scrim `--overlay`.

### Motion

1. Content fade-in ~200–250ms
2. Nav / hover color 120ms
3. Sheet fade + soft scale from 0.98 ~160ms

Respect `prefers-reduced-motion`.

---

## Screens

1. **Spends** — filter bar, quiet ledger rows, sheet for create/edit, confirm delete
2. **Categories** — simple named list, create sheet, soft-delete confirm
3. **Analytics** — period toolbar, hero total + hairline stats, category bars, top lists

Health feeds a tiny sidebar footer status (online / db), not its own page.

---

## Do / Don’t

**Do**

- Match Usora/UrgeLog paper + teal language
- Let whitespace and type do hierarchy
- Use Lucide icons only

**Don’t**

- Purple/indigo gradients, neon charts, multi-layer glows
- Dense card grids or pill clusters
- Inter as a loaded webfont (system stack is fine for UI)
- One-off hex in components
