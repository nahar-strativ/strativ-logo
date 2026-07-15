// Strativ symbol path data — extracted from the official symbol SVG
// (native viewBox 0 0 90 119.69). Two paths form the interlocking "S" mark.
export const SYMBOL_VIEW = { w: 90, h: 119.69 }

export const SYMBOL_PATHS = [
  'M32.33,62.13c-2.82-3.3-2.78-8.21.08-11.5l12.9-12.9.13-.13s.08-.08.13-.13l.08-.08c10.19-10.42,10.16-27.1-.13-37.39l-18.64,18.64h-.02l-3.42,3.44-15.62,15.62c-10.4,10.4-10.43,27.25-.07,37.61.16.16.33.31.48.47l18.29,18.29,18.87-18.87-13.07-13.07h0Z',
  'M82.25,44.37c-.16-.16-.33-.31-.48-.47l-18.29-18.29-18.87,18.87,13.07,13.07c2.82,3.3,2.78,8.21-.08,11.5l-12.9,12.9-.13.13-.13.13-.08.08c-10.19,10.42-10.16,27.1.13,37.39l18.64-18.64h.01l3.42-3.44,15.62-15.62c10.4-10.4,10.43-27.25.07-37.61h0Z',
]

export const TRANSPARENT = 'transparent'

export type ColorValue = string // hex like "#FE5001" or the literal "transparent"

export interface SymbolConfig {
  fg: ColorValue // symbol fill
  bg: ColorValue // background fill
  paddingPct: number // 0..0.4 — clear space around the symbol
  size?: number // output px, default 200
}

// Build a self-contained SVG string for the symbol on its background.
// A transparent fg renders `fill="none"`; a transparent bg omits the rect.
export function buildSymbolSvg({ fg, bg, paddingPct, size = 200 }: SymbolConfig): string {
  const pad = size * paddingPct
  const content = size - pad * 2
  // Fit by the taller dimension so the mark never clips.
  const scale = content / SYMBOL_VIEW.h
  const w = SYMBOL_VIEW.w * scale
  const h = SYMBOL_VIEW.h * scale
  const tx = (size - w) / 2
  const ty = (size - h) / 2

  const bgRect = bg === TRANSPARENT ? '' : `<rect width="${size}" height="${size}" fill="${bg}"/>`
  const fgFill = fg === TRANSPARENT ? 'none' : fg
  const paths = SYMBOL_PATHS.map((d) => `<path d="${d}"/>`).join('')

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
    `viewBox="0 0 ${size} ${size}">` +
    bgRect +
    `<g transform="translate(${round(tx)} ${round(ty)}) scale(${round(scale, 5)})" ` +
    `fill="${fgFill}" fill-rule="evenodd">${paths}</g>` +
    `</svg>`
  )
}

function round(n: number, p = 3): number {
  const f = Math.pow(10, p)
  return Math.round(n * f) / f
}

// Rasterize an SVG string to a PNG blob at the given size.
export function svgToPngBlob(svg: string, size = 200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas 2D context unavailable'))
      ctx.clearRect(0, 0, size, size) // keep alpha for transparent backgrounds
      ctx.drawImage(img, 0, 0, size, size)
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('PNG export failed'))
      }, 'image/png')
    }
    img.onerror = () => reject(new Error('SVG could not be rendered'))
    img.src = url
  })
}
