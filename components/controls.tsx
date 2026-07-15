'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { normalizeHex } from '@/lib/color'
import { TRANSPARENT, type ColorValue } from '@/lib/symbol'

// Small inline checkerboard (two solid rects, no gradient) marking transparency.
const CHECKER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="#EEF0F2"/><rect width="10" height="10" fill="#D5D9DD"/><rect x="10" y="10" width="10" height="10" fill="#D5D9DD"/></svg>',
  )
export const checkerStyle: React.CSSProperties = {
  backgroundImage: `url("${CHECKER}")`,
  backgroundSize: '16px 16px',
}

export function Swatch({ color, className }: { color: ColorValue; className?: string }) {
  if (color === TRANSPARENT) {
    return <span className={`inline-block rounded-full border border-border-default ${className ?? ''}`} style={checkerStyle} />
  }
  return (
    <span className={`inline-block rounded-full border border-border-default ${className ?? ''}`} style={{ background: color }} />
  )
}

export function ColorControl({
  label,
  value,
  onChange,
  allowTransparent = true,
}: {
  label: string
  value: ColorValue
  onChange: (v: ColorValue) => void
  allowTransparent?: boolean
}) {
  const isTransparent = value === TRANSPARENT
  const [text, setText] = useState(isTransparent ? '' : value)
  const [open, setOpen] = useState(false)
  const lastColor = useRef(isTransparent ? '#FE5001' : value)
  const swatchRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (value !== TRANSPARENT) {
      setText(value)
      lastColor.current = value
    }
  }, [value])

  const commitText = (raw: string) => {
    setText(raw)
    const hex = normalizeHex(raw)
    if (hex) onChange(hex)
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-text-primary">{label}</label>
        {allowTransparent && (
          <button
            onClick={() => onChange(isTransparent ? lastColor.current : TRANSPARENT)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-fast ${
              isTransparent
                ? 'bg-accent-subtle text-accent'
                : 'border border-border-default text-text-tertiary hover:border-border-strong'
            }`}
          >
            Transparent
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          ref={swatchRef}
          type="button"
          onClick={() => !isTransparent && setOpen((v) => !v)}
          disabled={isTransparent}
          aria-label={`${label} colour picker`}
          className="relative h-10 w-10 shrink-0 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed"
        >
          <Swatch color={value} className="h-10 w-10 !rounded-md" />
        </button>
        <input
          type="text"
          value={isTransparent ? 'transparent' : text}
          disabled={isTransparent}
          onChange={(e) => commitText(e.target.value)}
          placeholder="#FE5001"
          className="h-10 w-full rounded-md border border-border-default bg-surface px-3 text-sm tabular-nums text-text-primary transition-colors duration-fast placeholder:text-text-tertiary hover:border-border-strong focus:border-accent focus:shadow-focus focus:outline-none disabled:bg-muted disabled:text-text-disabled"
        />
      </div>

      {open && !isTransparent && (
        <ColorPickerPopover
          anchor={swatchRef.current}
          hex={value}
          onChange={onChange}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

// ---- Figma-style HSV picker: SV square + hue slider + hex/RGB inputs ----

interface HSV {
  h: number // 0..360
  s: number // 0..1
  v: number // 0..1
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace(/^#/, '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${(c(r) + c(g) + c(b)).toUpperCase()}`
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6
    else if (max === gn) h = (bn - rn) / d + 2
    else h = (rn - gn) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : d / max
  return { h, s, v: max }
}

function hsvToRgb({ h, s, v }: HSV): { r: number; g: number; b: number } {
  const c = v * s
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  let r1 = 0, g1 = 0, b1 = 0
  if (hp >= 0 && hp < 1) { r1 = c; g1 = x }
  else if (hp < 2) { r1 = x; g1 = c }
  else if (hp < 3) { g1 = c; b1 = x }
  else if (hp < 4) { g1 = x; b1 = c }
  else if (hp < 5) { r1 = x; b1 = c }
  else { r1 = c; b1 = x }
  const m = v - c
  return { r: (r1 + m) * 255, g: (g1 + m) * 255, b: (b1 + m) * 255 }
}

function hsvToHex(hsv: HSV): string {
  const { r, g, b } = hsvToRgb(hsv)
  return rgbToHex(r, g, b)
}

function ColorPickerPopover({
  anchor,
  hex,
  onChange,
  onClose,
}: {
  anchor: HTMLElement | null
  hex: string
  onChange: (v: string) => void
  onClose: () => void
}) {
  const popRef = useRef<HTMLDivElement>(null)
  // Keep hue/saturation locally so pure-black/white stay adjustable without collapsing.
  const [hsv, setHsv] = useState<HSV>(() => {
    const { r, g, b } = hexToRgb(hex)
    return rgbToHsv(r, g, b)
  })
  const [hexText, setHexText] = useState(hex)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  // External hex updates (typing in main input, presets) → resync HSV.
  useEffect(() => {
    const rgb = hexToRgb(hex)
    const next = rgbToHsv(rgb.r, rgb.g, rgb.b)
    setHsv((prev) => {
      // Preserve hue when saturation/value collapse (grays), else follow.
      if (next.s === 0) return { ...prev, s: 0, v: next.v }
      if (next.v === 0) return { ...prev, v: 0 }
      return next
    })
    setHexText(hex)
  }, [hex])

  // Position popover under anchor, clamped to viewport.
  useLayoutEffect(() => {
    if (!anchor || !popRef.current) return
    const a = anchor.getBoundingClientRect()
    const p = popRef.current.getBoundingClientRect()
    const gap = 8
    let top = a.bottom + gap
    let left = a.left
    const vw = window.innerWidth, vh = window.innerHeight
    if (left + p.width > vw - 8) left = Math.max(8, vw - p.width - 8)
    if (top + p.height > vh - 8) top = Math.max(8, a.top - p.height - gap)
    setPos({ top: top + window.scrollY, left: left + window.scrollX })
  }, [anchor])

  // Dismiss on outside click / escape.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!popRef.current) return
      if (popRef.current.contains(e.target as Node)) return
      if (anchor && anchor.contains(e.target as Node)) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [anchor, onClose])

  const push = useCallback((next: HSV) => {
    setHsv(next)
    const h = hsvToHex(next)
    setHexText(h)
    onChange(h)
  }, [onChange])

  const commitHex = (raw: string) => {
    setHexText(raw)
    const norm = normalizeHex(raw)
    if (norm) {
      const { r, g, b } = hexToRgb(norm)
      const next = rgbToHsv(r, g, b)
      setHsv((prev) => (next.s === 0 ? { ...prev, s: 0, v: next.v } : next))
      onChange(norm)
    }
  }

  const rgb = hsvToRgb(hsv)
  const hueColor = hsvToHex({ h: hsv.h, s: 1, v: 1 })

  return (
    <div
      ref={popRef}
      role="dialog"
      aria-label="Colour picker"
      className="fixed z-50 w-[260px] rounded-lg border border-border-default bg-surface p-3 shadow-lg"
      style={pos ? { top: pos.top, left: pos.left } : { top: -9999, left: -9999 }}
    >
      <SVSquare hsv={hsv} hueColor={hueColor} onChange={push} />
      <HueSlider hue={hsv.h} onChange={(h) => push({ ...hsv, h })} />

      <div className="mt-3 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-1.5 rounded-md border border-border-default px-2 focus-within:border-accent">
          <span className="text-xs text-text-tertiary">#</span>
          <input
            value={hexText.replace(/^#/, '')}
            onChange={(e) => commitHex(e.target.value)}
            spellCheck={false}
            maxLength={7}
            className="h-8 w-full bg-transparent text-sm tabular-nums text-text-primary uppercase focus:outline-none"
          />
        </div>
        <RgbInput label="R" value={Math.round(rgb.r)} onChange={(r) => {
          const h = normalizeHex(rgbToHex(r, rgb.g, rgb.b))!
          commitHex(h)
        }} />
        <RgbInput label="G" value={Math.round(rgb.g)} onChange={(g) => {
          const h = normalizeHex(rgbToHex(rgb.r, g, rgb.b))!
          commitHex(h)
        }} />
        <RgbInput label="B" value={Math.round(rgb.b)} onChange={(b) => {
          const h = normalizeHex(rgbToHex(rgb.r, rgb.g, b))!
          commitHex(h)
        }} />
      </div>
    </div>
  )
}

function SVSquare({
  hsv,
  hueColor,
  onChange,
}: {
  hsv: HSV
  hueColor: string
  onChange: (next: HSV) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const handle = useCallback((clientX: number, clientY: number) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (clientX - r.left) / r.width))
    const y = Math.max(0, Math.min(1, (clientY - r.top) / r.height))
    onChange({ h: hsv.h, s: x, v: 1 - y })
  }, [hsv.h, onChange])

  useEffect(() => {
    const move = (e: MouseEvent) => dragging.current && handle(e.clientX, e.clientY)
    const up = () => (dragging.current = false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [handle])

  return (
    <div
      ref={ref}
      onMouseDown={(e) => {
        dragging.current = true
        handle(e.clientX, e.clientY)
      }}
      className="relative h-40 w-full cursor-crosshair rounded-md"
      style={{
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #FFF, ${hueColor})`,
      }}
    >
      <span
        className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
        style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
      />
    </div>
  )
}

function HueSlider({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const handle = useCallback((clientX: number) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (clientX - r.left) / r.width))
    onChange(x * 360)
  }, [onChange])

  useEffect(() => {
    const move = (e: MouseEvent) => dragging.current && handle(e.clientX)
    const up = () => (dragging.current = false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [handle])

  return (
    <div
      ref={ref}
      onMouseDown={(e) => {
        dragging.current = true
        handle(e.clientX)
      }}
      className="relative mt-3 h-3 w-full cursor-pointer rounded-full"
      style={{
        background:
          'linear-gradient(to right, #FF0000 0%, #FFFF00 17%, #00FF00 33%, #00FFFF 50%, #0000FF 67%, #FF00FF 83%, #FF0000 100%)',
      }}
    >
      <span
        className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
        style={{ left: `${(hue / 360) * 100}%` }}
      />
    </div>
  )
}

function RgbInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])
  return (
    <label className="flex w-12 flex-col items-center gap-0.5">
      <input
        value={text}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, '')
          setText(raw)
          if (raw === '') return
          const n = Math.max(0, Math.min(255, parseInt(raw, 10)))
          onChange(n)
        }}
        onBlur={() => setText(String(value))}
        inputMode="numeric"
        className="h-8 w-full rounded-md border border-border-default bg-surface px-1 text-center text-xs tabular-nums text-text-primary focus:border-accent focus:outline-none"
      />
      <span className="text-[10px] uppercase tracking-wider text-text-tertiary">{label}</span>
    </label>
  )
}
