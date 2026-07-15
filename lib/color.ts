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

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ---- Curated "trending rich" palette (2024/25 jewel tones + vivids + soft tints) ----

// Deep, saturated grounds (50).
const RICH_DARKS = [
  '#0F172A', '#111827', '#18181B', '#1C1917', '#1E1B4B',
  '#312E81', '#3730A3', '#4C1D95', '#5B21B6', '#3B0764',
  '#4A044E', '#581C87', '#6B21A8', '#701A75', '#86198F',
  '#831843', '#9D174D', '#9F1239', '#881337', '#4C0519',
  '#7F1D1D', '#991B1B', '#7C2D12', '#9A3412', '#92400E',
  '#78350F', '#713F12', '#3F6212', '#365314', '#14532D',
  '#166534', '#064E3B', '#052E2B', '#134E4A', '#115E59',
  '#164E63', '#155E75', '#0C4A6E', '#075985', '#1E3A8A',
  '#1E40AF', '#172554', '#2E1065', '#500724', '#422006',
  '#3C1361', '#4A0E4E', '#052F2F', '#1A2E05', '#500A28',
] as const

// Vivid accents that pop on the dark grounds (50).
const VIVIDS = [
  '#FB7185', '#F43F5E', '#FDA4AF', '#F472B6', '#EC4899',
  '#F9A8D4', '#E879F9', '#D946EF', '#F0ABFC', '#C084FC',
  '#A855F7', '#D8B4FE', '#818CF8', '#6366F1', '#A5B4FC',
  '#60A5FA', '#3B82F6', '#93C5FD', '#38BDF8', '#0EA5E9',
  '#7DD3FC', '#22D3EE', '#06B6D4', '#67E8F9', '#2DD4BF',
  '#14B8A6', '#5EEAD4', '#34D399', '#10B981', '#6EE7B7',
  '#4ADE80', '#22C55E', '#86EFAC', '#A3E635', '#84CC16',
  '#BEF264', '#FACC15', '#EAB308', '#FDE047', '#FBBF24',
  '#F59E0B', '#FCD34D', '#FB923C', '#F97316', '#FDBA74',
  '#FF6B5E', '#FF8A5B', '#F87171', '#EF4444', '#FCA5A5',
] as const

// Soft, expensive-looking tints for light grounds (50).
const SOFT_LIGHTS = [
  '#FFF7ED', '#FFEDD5', '#FEFCE8', '#FEF9C3', '#FEF2F2',
  '#FEE2E2', '#FFF1F2', '#FFE4E6', '#FDF2F8', '#FCE7F3',
  '#FDF4FF', '#FAE8FF', '#F5F3FF', '#EDE9FE', '#EEF2FF',
  '#E0E7FF', '#EFF6FF', '#DBEAFE', '#F0F9FF', '#E0F2FE',
  '#ECFEFF', '#CFFAFE', '#F0FDFA', '#CCFBF1', '#ECFDF5',
  '#D1FAE5', '#F0FDF4', '#DCFCE7', '#F7FEE7', '#ECFCCB',
  '#FFFBEB', '#FEF3C7', '#FAF5EB', '#F5F0E6', '#FAFAF9',
  '#F5F5F4', '#FAFAFA', '#F4F4F5', '#F8FAFC', '#F1F5F9',
  '#F9FAFB', '#F3F4F6', '#FDF6F0', '#FBF1F5', '#F3F0FB',
  '#EFF4FB', '#EEF7F4', '#FBF7EE', '#F7F0FA', '#FEF6EE',
] as const

// Rich bases for the subtle pattern — any luminance, all saturated (50).
const PATTERN_BASES = [
  '#0F172A', '#1E1B4B', '#312E81', '#4C1D95', '#3B0764',
  '#581C87', '#701A75', '#86198F', '#831843', '#9F1239',
  '#4C0519', '#7F1D1D', '#991B1B', '#B91C1C', '#DC2626',
  '#7C2D12', '#9A3412', '#C2410C', '#EA580C', '#B45309',
  '#D97706', '#CA8A04', '#A16207', '#4D7C0F', '#65A30D',
  '#15803D', '#16A34A', '#047857', '#059669', '#0F766E',
  '#0D9488', '#0E7490', '#0891B2', '#0369A1', '#0284C7',
  '#1D4ED8', '#2563EB', '#1E40AF', '#4338CA', '#4F46E5',
  '#6D28D9', '#7C3AED', '#9333EA', '#A21CAF', '#C026D3',
  '#BE185D', '#DB2777', '#E11D48', '#BE123C', '#164E63',
] as const

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
export function randomSubtlePair(minRatio = 1.06, maxRatio = 1.7): { fg: string; bg: string } {
  const bg = pick(PATTERN_BASES)
  const goLighter = luminance(bg) < 0.5 // nudge away from the nearest extreme
  const target: [number, number, number] = goLighter ? [255, 255, 255] : [0, 0, 0]
  // Try a few nudge amounts; keep the mark visible but soft.
  for (let i = 0; i < 12; i++) {
    const amount = 0.1 + Math.random() * 0.14 // 10%..24%
    const fg = mix(bg, target, amount)
    const ratio = contrastRatio(fg, bg)
    if (ratio >= minRatio && ratio <= maxRatio) return { fg, bg }
  }
  return { fg: mix(bg, target, 0.16), bg }
}

// Generate a rich, on-trend { fg, bg } pair with contrast >= minRatio.
// Either a deep jewel-tone ground with a vivid/tint mark, or a soft tint
// ground with a deep mark — both read as designed, not random.
export function randomContrastPair(minRatio = 4.5): { fg: string; bg: string } {
  let best = { fg: '#0F172A', bg: '#FFF7ED' }
  let bestRatio = contrastRatio(best.fg, best.bg)
  for (let i = 0; i < 80; i++) {
    const darkGround = Math.random() < 0.6
    const bg = darkGround ? pick(RICH_DARKS) : pick(SOFT_LIGHTS)
    const fg = darkGround
      ? Math.random() < 0.5
        ? pick(VIVIDS)
        : pick(SOFT_LIGHTS)
      : pick(RICH_DARKS)
    const ratio = contrastRatio(fg, bg)
    if (ratio >= minRatio) return { fg, bg }
    if (ratio > bestRatio) {
      best = { fg, bg }
      bestRatio = ratio
    }
  }
  return best
}
