# Strativ Symbol Studio

Recolour the Strativ symbol and export it as a square **200×200 PNG**.

## Features
- **Manual** foreground (symbol) + background colour pickers — native picker or hex input.
- **Randomizer** — generates a random colour pair with WCAG AA contrast (≥ 4.5:1). Live contrast readout + AA/AAA badge.
- **Transparent** — either colour (inside symbol / outside background) can be set transparent; alpha is preserved in the PNG.
- **Padding** slider for clear space around the mark.
- **Brand presets** (orange on warm-black, white on orange, etc.).
- **Copy SVG** and **Download PNG** (200×200, transparent-aware).
- Light / dark theme toggle. Built on the Strativ design system (Next.js + Tailwind + design tokens).

## Run
```bash
npm install
npm run dev   # http://localhost:3000
```

## Where things live
- `lib/symbol.ts` — symbol path data, SVG builder, SVG→PNG rasterizer.
- `lib/color.ts` — hex parsing, WCAG luminance/contrast, random contrast-pair generator.
- `components/Studio.tsx` — the tool UI.
- `components/Lockup.tsx` — official Strativ lockup (header logo).
- `app/tokens.css`, `tailwind.config.ts` — Strativ design tokens.
