// Seamless repeating pattern of the Strativ symbol, meant to be subtle
// (low contrast between mark and background). Reuses the symbol path data.
import { SYMBOL_PATHS, SYMBOL_VIEW, TRANSPARENT, type ColorValue } from './symbol'

export interface PatternConfig {
  fg: ColorValue // symbol colour
  bg: ColorValue // background colour
  tile: number // repeat cell size in px (smaller = denser)
  size?: number // output px, default 400
  rotate?: number // whole-pattern rotation in degrees
}

// One tile holds two half-offset marks (brick stagger) so tiling reads as a
// woven pattern rather than a rigid grid. Marks are sized to sit inside their
// quadrant, so nothing crosses the tile edge — the repeat stays seamless.
export function buildPatternSvg({ fg, bg, tile, size = 400, rotate = 0 }: PatternConfig): string {
  const markH = tile * 0.42
  const scale = markH / SYMBOL_VIEW.h
  const markW = SYMBOL_VIEW.w * scale
  const fgFill = fg === TRANSPARENT ? 'none' : fg
  const paths = SYMBOL_PATHS.map((d) => `<path d="${d}"/>`).join('')

  // mark centered in the top-left quadrant, and again in the bottom-right quadrant
  const aX = tile * 0.25 - markW / 2
  const aY = tile * 0.25 - markH / 2
  const bX = tile * 0.75 - markW / 2
  const bY = tile * 0.75 - markH / 2

  const mark = (x: number, y: number, rot: number) =>
    `<g transform="translate(${round(x)} ${round(y)}) rotate(${rot} ${round(markW / 2)} ${round(markH / 2)}) scale(${round(scale, 5)})">${paths}</g>`

  const bgRect = bg === TRANSPARENT ? '' : `<rect width="${size}" height="${size}" fill="${bg}"/>`
  const patternTransform = rotate ? ` patternTransform="rotate(${rotate})"` : ''

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<defs><pattern id="strativ-pat" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse"${patternTransform}>` +
    `<g fill="${fgFill}" fill-rule="evenodd">${mark(aX, aY, 0)}${mark(bX, bY, 180)}</g>` +
    `</pattern></defs>` +
    bgRect +
    `<rect width="${size}" height="${size}" fill="url(#strativ-pat)"/>` +
    `</svg>`
  )
}

function round(n: number, p = 3): number {
  const f = Math.pow(10, p)
  return Math.round(n * f) / f
}
