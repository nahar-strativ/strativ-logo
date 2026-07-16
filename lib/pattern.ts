// Scattered pattern of the Strativ symbol — each mark gets a randomized size,
// rotation and position jitter, so the field reads as organic rather than a
// rigid grid. Layout is driven by a seed (seeded PRNG) so the same seed always
// reproduces the same arrangement — stable across recolours/theme toggles, and
// reshuffled only when the seed changes.
import { SYMBOL_PATHS, SYMBOL_VIEW, TRANSPARENT, type ColorValue } from './symbol'

export interface PatternConfig {
  fg: ColorValue // symbol colour
  bg: ColorValue // background colour
  tile: number // base grid cell in px (smaller = denser / smaller marks)
  sizeVariation?: number // 0 = all marks equal size, 1 = widest size spread
  width?: number // output px, default 1200
  height?: number // output px, default 600
  seed?: number // layout seed
}

// Small, fast seeded PRNG (mulberry32) → deterministic layouts per seed.
function mulberry32(a: number): () => number {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function buildPatternSvg({ fg, bg, tile, sizeVariation = 0.6, width = 1200, height = 600, seed = 1 }: PatternConfig): string {
  const rand = mulberry32(seed)
  const fgFill = fg === TRANSPARENT ? 'none' : fg
  const paths = SYMBOL_PATHS.map((d) => `<path d="${d}"/>`).join('')

  const marks: string[] = []
  const cols = Math.ceil(width / tile)
  const rows = Math.ceil(height / tile)

  // Size range centred at 50% of the cell; the spread grows with sizeVariation
  // but stays bounded so marks never exceed their cell — keeps the field
  // orderly. 0 → every mark identical; 1 → sizes span ~15%..85% of the cell.
  const center = 0.5
  const spread = 0.35 * Math.max(0, Math.min(1, sizeVariation))

  // Iterate one cell past each edge so marks fill the borders (clipped by viewBox).
  for (let r = -1; r <= rows; r++) {
    for (let c = -1; c <= cols; c++) {
      const frac = Math.max(0.08, center - spread + rand() * spread * 2)
      const markH = tile * frac
      const scale = markH / SYMBOL_VIEW.h
      const markW = SYMBOL_VIEW.w * scale

      // Cell centre + gentle position jitter (±12% of the cell) so the grid
      // stays legible and harmonious rather than scattered. Angle stays upright.
      const cx = c * tile + tile / 2 + (rand() - 0.5) * tile * 0.24
      const cy = r * tile + tile / 2 + (rand() - 0.5) * tile * 0.24

      const tx = cx - markW / 2
      const ty = cy - markH / 2
      marks.push(
        `<g transform="translate(${round(tx)} ${round(ty)}) scale(${round(scale, 5)})">${paths}</g>`,
      )
    }
  }

  const bgRect = bg === TRANSPARENT ? '' : `<rect width="${width}" height="${height}" fill="${bg}"/>`

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    bgRect +
    `<g fill="${fgFill}" fill-rule="evenodd">${marks.join('')}</g>` +
    `</svg>`
  )
}

function round(n: number, p = 3): number {
  const f = Math.pow(10, p)
  return Math.round(n * f) / f
}
