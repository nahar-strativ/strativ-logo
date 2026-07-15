'use client'

import { useEffect, useRef, useState } from 'react'
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
    return <span className={`rounded-full border border-border-default ${className ?? ''}`} style={checkerStyle} />
  }
  return (
    <span className={`rounded-full border border-border-default ${className ?? ''}`} style={{ background: color }} />
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
  const lastColor = useRef(isTransparent ? '#FE5001' : value)

  // Keep the hex field synced when value changes from outside (presets/randomizer).
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
        <div className="relative h-10 w-10 shrink-0">
          <Swatch color={value} className="h-10 w-10 !rounded-md" />
          {!isTransparent && (
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
              aria-label={`${label} colour picker`}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          )}
        </div>
        <input
          type="text"
          value={isTransparent ? 'transparent' : text}
          disabled={isTransparent}
          onChange={(e) => commitText(e.target.value)}
          placeholder="#FE5001"
          className="h-10 w-full rounded-md border border-border-default bg-surface px-3 text-sm tabular-nums text-text-primary transition-colors duration-fast placeholder:text-text-tertiary hover:border-border-strong focus:border-accent focus:shadow-focus focus:outline-none disabled:bg-muted disabled:text-text-disabled"
        />
      </div>
    </div>
  )
}
