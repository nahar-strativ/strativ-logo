// Color helpers — hex parsing, WCAG relative luminance + contrast ratio,
// and a contrast-aware random pair generator for the randomizer.

export function normalizeHex(input: string): string | null {
  let s = input.trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(s)) {
    s = s.split('').map((c) => c + c).join('')
  }
  if (/^[0-9a-fA-F]{6}$/.test(s)) return `#${s.toUpperCase()}`
  return null
}

function toRgb(hex: string): [number, number, number] {
  const h = hex.replace(/^#/, '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

// WCAG relative luminance.
export function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// WCAG contrast ratio between two hex colors (1..21).
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

function randomHex(): string {
  const n = Math.floor(Math.random() * 0x1000000)
  return `#${n.toString(16).padStart(6, '0').toUpperCase()}`
}

function toHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${(c(r) + c(g) + c(b)).toUpperCase()}`
}

// Mix a hex color toward a target ([r,g,b]) by amount (0..1).
function mix(hex: string, target: [number, number, number], amount: number): string {
  const h = hex.replace(/^#/, '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return toHex(
    r + (target[0] - r) * amount,
    g + (target[1] - g) * amount,
    b + (target[2] - b) * amount,
  )
}

// Generate a { fg, bg } pair with LOW contrast — the mark is derived from the
// background by a small lightness nudge, so it stays in the same hue family
// and reads as a subtle, tonal pattern. Retries until contrast lands in range.
export function randomSubtlePair(minRatio = 1.06, maxRatio = 1.55): { fg: string; bg: string } {
  for (let i = 0; i < 200; i++) {
    const bg = randomHex()
    const goLighter = luminance(bg) < 0.5 // nudge away from the nearest extreme
    const target: [number, number, number] = goLighter ? [255, 255, 255] : [0, 0, 0]
    const amount = 0.08 + Math.random() * 0.16 // 8%..24%
    const fg = mix(bg, target, amount)
    const ratio = contrastRatio(fg, bg)
    if (ratio >= minRatio && ratio <= maxRatio) return { fg, bg }
  }
  // Fallback: a gentle tonal pair.
  const bg = randomHex()
  return { fg: mix(bg, [255, 255, 255], 0.14), bg }
}

// Generate a { fg, bg } pair with contrast >= minRatio (default 4.5 = WCAG AA body).
export function randomContrastPair(minRatio = 4.5): { fg: string; bg: string } {
  let best = { fg: randomHex(), bg: randomHex() }
  let bestRatio = contrastRatio(best.fg, best.bg)
  for (let i = 0; i < 200; i++) {
    const fg = randomHex()
    const bg = randomHex()
    const ratio = contrastRatio(fg, bg)
    if (ratio >= minRatio) return { fg, bg }
    if (ratio > bestRatio) {
      best = { fg, bg }
      bestRatio = ratio
    }
  }
  return best // best effort if we never hit the threshold
}
