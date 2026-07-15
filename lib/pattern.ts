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
  size?: number // output px, default 600
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

export function buildPatternSvg({ fg, bg, tile, size = 600, seed = 1 }: PatternConfig): string {
  const rand = mulberry32(seed)
  const fgFill = fg === TRANSPARENT ? 'none' : fg
  const paths = SYMBOL_PATHS.map((d) => `<path d="${d}"/>`).join('')

  const marks: string[] = []
  const cols = Math.ceil(size / tile)
  const rows = Math.ceil(size / tile)

  // Iterate one cell past each edge so marks fill the borders (clipped by viewBox).
  for (let r = -1; r <= rows; r++) {
    for (let c = -1; c <= cols; c++) {
      // Randomized size: 30%..95% of the cell.
      const markH = tile * (0.3 + rand() * 0.65)
      const scale = markH / SYMBOL_VIEW.h
      const markW = SYMBOL_VIEW.w * scale

      // Cell centre + position jitter up to ±35% of the cell.
      const cx = c * tile + tile / 2 + (rand() - 0.5) * tile * 0.7
      const cy = r * tile + tile / 2 + (rand() - 0.5) * tile * 0.7
      const rot = Math.floor(rand() * 360)

      const tx = cx - markW / 2
      const ty = cy - markH / 2
      marks.push(
        `<g transform="translate(${round(tx)} ${round(ty)}) rotate(${rot} ${round(markW / 2)} ${round(markH / 2)}) scale(${round(scale, 5)})">${paths}</g>`,
      )
    }
  }

  const bgRect = bg === TRANSPARENT ? '' : `<rect width="${size}" height="${size}" fill="${bg}"/>`

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    bgRect +
    `<g fill="${fgFill}" fill-rule="evenodd">${marks.join('')}</g>` +
    `</svg>`
  )
}

function round(n: number, p = 3): number {
  const f = Math.pow(10, p)
  return Math.round(n * f) / f
}
