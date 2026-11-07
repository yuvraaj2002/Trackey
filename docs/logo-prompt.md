# Trackey logo — Grok / image prompt

Use this in **Grok Imagine** (or any strong image model). Prefer a square canvas.

## Primary prompt (copy-paste)

```text
Design a premium app icon for “Trackey”, a calm personal spend-tracker for macOS.
Style: flat vector, soft geometric mark, Notion-adjacent quiet luxury — NOT glossy 3D, NOT skeuomorphic, NOT crypto, NOT fintech neon.
Motif: a minimal ledger mark or soft “T” monogram fused with a subtle rounded coin / tally notch; negative space does the work.
Palette: warm ivory paper #FBF9F4, deep sage-teal #2F6B66, soft ink #2A2722. Optional tiny warm stone highlight #E5E0D4.
Composition: centered icon on a soft squircle (iOS/macOS app-icon friendly), generous padding, crisp edges, no drop shadow, no glow, no gradients heavier than a 5% wash.
Typography: no wordmark inside the icon; the letter T may appear only as a geometric glyph if it stays elegant.
Mood: private, finished, warm, trustworthy, editorial.
Output: single icon, square 1:1, clean solid background matching the squircle, high resolution, print-sharp vectors look.
Avoid: purple, indigo, terracotta cream clichés, emojis, charts with axes, dollar signs, piggy banks, busy dashboards, photorealism, chrome metal, glassmorphism.
```

## Negative / avoid add-on (if the tool supports it)

```text
purple, violet, neon, glow, glassmorphism, 3D render, stock photo, piggy bank, dollar bills, bar charts, clutter, watermark, text slogan, busy gradients
```

## Variants to try

1. **Monogram:** geometric T only, teal on ivory squircle  
2. **Ledger:** two soft horizontal tally lines + teal accent bar  
3. **Coin-T:** circular teal disc with ivory T cutout  

## After you generate

Export a square PNG (1024×1024+), then from `ui/`:

```bash
npx tauri icon path/to/trackey-logo.png
```

That regenerates `src-tauri/icons/*` for the desktop app.
