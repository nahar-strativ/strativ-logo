'use client'

import { useCallback, useMemo, useState } from 'react'
import { Download, Shuffle, Copy, Check } from 'lucide-react'
import { buildPatternSvg } from '@/lib/pattern'
import { svgToPngBlob, TRANSPARENT, type ColorValue } from '@/lib/symbol'
import { contrastRatio, randomSubtlePair } from '@/lib/color'
import { ColorControl, Swatch, checkerStyle } from './controls'

const OUTPUT = 600

interface Preset {
  name: string
  fg: ColorValue
  bg: ColorValue
}
// Subtle, tonal brand pairs — mark barely separated from the ground.
const PRESETS: Preset[] = [
  { name: 'Warm black tint', fg: '#2A1E2C', bg: '#1A0E1C' },
  { name: 'Orange on deep orange', fg: '#FF6A2A', bg: '#E54600' },
  { name: 'Light grey', fg: '#E7E7E7', bg: '#F1F1F1' },
  { name: 'Orange whisper on white', fg: '#FDE7DB', bg: '#FFFFFF' },
  { name: 'Slate tint', fg: '#3C4657', bg: '#344054' },
]

export function PatternSection() {
  const [fg, setFg] = useState<ColorValue>('#2A1E2C')
  const [bg, setBg] = useState<ColorValue>('#1A0E1C')
  const [tile, setTile] = useState(120)
  const [copied, setCopied] = useState(false)

  const svg = useMemo(() => buildPatternSvg({ fg, bg, tile, size: OUTPUT }), [fg, bg, tile])

  const bothSolid = fg !== TRANSPARENT && bg !== TRANSPARENT
  const ratio = bothSolid ? contrastRatio(fg, bg) : null

  const randomize = useCallback(() => {
    const pair = randomSubtlePair()
    setFg(pair.fg)
    setBg(pair.bg)
  }, [])

  const download = useCallback(async () => {
    const blob = await svgToPngBlob(svg, OUTPUT)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'strativ-pattern-600x600.png'
    a.click()
    URL.revokeObjectURL(url)
  }, [svg])

  const copySvg = useCallback(async () => {
    await navigator.clipboard.writeText(svg)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [svg])

  return (
    <section className="mt-16">
      <div className="mb-8 max-w-2xl">
        <div className="mb-3 flex items-baseline gap-2">
          <span className="step-number">02</span>
          <span className="text-xs uppercase tracking-wider text-text-tertiary">Brand pattern</span>
        </div>
        <h2 className="text-display-sm">Tile the symbol into a pattern</h2>
        <p className="mt-3 text-md text-text-secondary">
          A repeating field of the mark — meant to sit quietly behind content. The randomizer keeps the two
          colours close (low contrast) so the pattern stays subtle.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Preview */}
        <div className="card-strativ flex flex-col items-center justify-center gap-6 py-10">
          <div
            className="aspect-square w-full max-w-[420px] overflow-hidden rounded-lg border border-border-subtle [&>svg]:h-full [&>svg]:w-full"
            style={checkerStyle}
            aria-label="Pattern preview"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={download}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-text-on-accent transition-colors duration-fast hover:bg-accent-hover active:bg-brand-orange-pressed"
            >
              <Download className="h-4 w-4" strokeWidth={1.75} />
              Download PNG
            </button>
            <button
              onClick={copySvg}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border-default px-4 text-sm font-medium text-text-primary transition-colors duration-fast hover:border-border-strong"
            >
              {copied ? <Check className="h-4 w-4 text-success" strokeWidth={1.75} /> : <Copy className="h-4 w-4" strokeWidth={1.5} />}
              {copied ? 'Copied' : 'Copy SVG'}
            </button>
          </div>
          <p className="text-xs text-text-tertiary">Seamless tile · 600 × 600 px PNG with alpha</p>
        </div>

        {/* Controls */}
        <aside className="flex flex-col gap-6">
          <div className="card-strativ">
            <button
              onClick={randomize}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-inverse px-4 text-sm font-medium text-text-on-dark transition-transform duration-fast hover:scale-[1.01] active:scale-100 dark:bg-accent"
            >
              <Shuffle className="h-4 w-4" strokeWidth={1.75} />
              Randomize (subtle / low contrast)
            </button>
            {ratio !== null ? (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-text-tertiary">Contrast</span>
                <span className="flex items-center gap-2">
                  <span className="font-medium tabular-nums text-text-primary">{ratio.toFixed(2)}:1</span>
                  <SubtleBadge ratio={ratio} />
                </span>
              </div>
            ) : (
              <p className="mt-4 text-sm text-text-tertiary">Contrast n/a — a colour is transparent.</p>
            )}
          </div>

          <div className="card-strativ flex flex-col gap-6">
            <ColorControl label="Symbol (pattern)" value={fg} onChange={setFg} />
            <div className="h-px bg-border-subtle" />
            <ColorControl label="Background" value={bg} onChange={setBg} />
          </div>

          <div className="card-strativ">
            <label className="mb-3 flex items-center justify-between text-sm font-medium text-text-primary">
              Density
              <span className="tabular-nums text-text-tertiary">{tile}px tile</span>
            </label>
            <input
              type="range"
              min={60}
              max={240}
              step={5}
              value={tile}
              onChange={(e) => setTile(Number(e.target.value))}
              className="w-full accent-[--accent]"
            />
            <p className="mt-2 text-xs text-text-tertiary">Smaller tile = denser pattern.</p>
          </div>

          <div className="card-strativ">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-tertiary">Subtle presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setFg(p.fg)
                    setBg(p.bg)
                  }}
                  title={p.name}
                  className="inline-flex items-center gap-2 rounded-full border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors duration-fast hover:border-border-strong"
                >
                  <Swatch color={p.bg} className="h-4 w-4" />
                  <Swatch color={p.fg} className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

function SubtleBadge({ ratio }: { ratio: number }) {
  // For a pattern, LOW contrast is the goal — invert the usual badge meaning.
  let label = 'Subtle'
  let cls = 'bg-success-subtle text-success'
  if (ratio > 2.5) {
    label = 'Too strong'
    cls = 'bg-warning-subtle text-warning'
  } else if (ratio > 1.7) {
    label = 'Noticeable'
    cls = 'bg-info-subtle text-info'
  }
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
}
