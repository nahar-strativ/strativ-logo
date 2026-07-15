'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Download, Shuffle, Moon, Sun, Check, Copy } from 'lucide-react'
import { buildSymbolSvg, svgToPngBlob, TRANSPARENT, type ColorValue } from '@/lib/symbol'
import { contrastRatio, randomContrastPair } from '@/lib/color'
import { Lockup } from './Lockup'
import { ColorControl, Swatch, checkerStyle } from './controls'
import { PatternSection } from './PatternSection'

const OUTPUT = 200

interface Preset {
  name: string
  fg: ColorValue
  bg: ColorValue
}
const PRESETS: Preset[] = [
  { name: 'Orange on warm black', fg: '#FE5001', bg: '#1A0E1C' },
  { name: 'White on orange', fg: '#FFFFFF', bg: '#FE5001' },
  { name: 'Warm black on white', fg: '#1A0E1C', bg: '#FFFFFF' },
  { name: 'Orange on white', fg: '#FE5001', bg: '#FFFFFF' },
  { name: 'White on warm black', fg: '#FFFFFF', bg: '#1A0E1C' },
  { name: 'Orange, transparent bg', fg: '#FE5001', bg: TRANSPARENT },
]

export function Studio() {
  const [fg, setFg] = useState<ColorValue>('#FE5001')
  const [bg, setBg] = useState<ColorValue>('#1A0E1C')
  const [paddingPct, setPaddingPct] = useState(0.18)
  const [dark, setDark] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const svg = useMemo(() => buildSymbolSvg({ fg, bg, paddingPct, size: OUTPUT }), [fg, bg, paddingPct])

  // Contrast only meaningful when both colors are opaque.
  const bothSolid = fg !== TRANSPARENT && bg !== TRANSPARENT
  const ratio = bothSolid ? contrastRatio(fg, bg) : null

  const randomize = useCallback(() => {
    const pair = randomContrastPair(4.5)
    setFg(pair.fg)
    setBg(pair.bg)
  }, [])

  const download = useCallback(async () => {
    const blob = await svgToPngBlob(svg, OUTPUT)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'strativ-symbol-200x200.png'
    a.click()
    URL.revokeObjectURL(url)
  }, [svg])

  const copySvg = useCallback(async () => {
    await navigator.clipboard.writeText(svg)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [svg])

  return (
    <div className="min-h-dvh bg-canvas text-text-primary">
      {/* Topbar with mandatory Strativ lockup */}
      <header className="border-b border-border-subtle">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 md:px-8">
          <div className="flex items-baseline gap-3">
            <Lockup theme={dark ? 'dark' : 'light'} className="h-6 w-auto" />
            <span className="hidden text-xs uppercase tracking-wider text-text-tertiary sm:inline">
              Symbol Studio
            </span>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle theme"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border-default text-text-secondary transition-colors duration-fast hover:border-border-strong"
          >
            {dark ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-content px-4 py-8 md:px-8 md:py-12">
        <div className="mb-8 max-w-2xl">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="step-number">01</span>
            <span className="text-xs uppercase tracking-wider text-text-tertiary">Brand mark generator</span>
          </div>
          <h1 className="text-display-sm md:text-display-md">Colour the Strativ symbol</h1>
          <p className="mt-3 text-md text-text-secondary">
            Pick colours by hand, or let the randomizer find a high-contrast pair. Either colour can be
            transparent. Export a square 200×200 PNG.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Preview */}
          <section className="card-strativ flex flex-col items-center justify-center gap-6 py-10">
            <div
              className="rounded-lg border border-border-subtle"
              style={checkerStyle}
              aria-label="Symbol preview"
            >
              <div
                className="h-[280px] w-[280px] overflow-hidden rounded-lg [&>svg]:h-full [&>svg]:w-full sm:h-[320px] sm:w-[320px]"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>

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
            <p className="text-xs text-text-tertiary">Output: 200 × 200 px · PNG with alpha</p>
          </section>

          {/* Controls */}
          <aside className="flex flex-col gap-6">
            <div className="card-strativ">
              <button
                onClick={randomize}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-inverse px-4 text-sm font-medium text-text-on-dark transition-transform duration-fast hover:scale-[1.01] active:scale-100 dark:bg-accent"
              >
                <Shuffle className="h-4 w-4" strokeWidth={1.75} />
                Randomize (high contrast)
              </button>

              {ratio !== null ? (
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-text-tertiary">Contrast</span>
                  <span className="flex items-center gap-2">
                    <span className="font-medium tabular-nums text-text-primary">{ratio.toFixed(2)}:1</span>
                    <ContrastBadge ratio={ratio} />
                  </span>
                </div>
              ) : (
                <p className="mt-4 text-sm text-text-tertiary">Contrast n/a — a colour is transparent.</p>
              )}
            </div>

            <div className="card-strativ flex flex-col gap-6">
              <ColorControl label="Symbol (foreground)" value={fg} onChange={setFg} />
              <div className="h-px bg-border-subtle" />
              <ColorControl label="Background" value={bg} onChange={setBg} />
            </div>

            <div className="card-strativ">
              <label className="mb-3 flex items-center justify-between text-sm font-medium text-text-primary">
                Padding
                <span className="tabular-nums text-text-tertiary">{Math.round(paddingPct * 100)}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={0.4}
                step={0.01}
                value={paddingPct}
                onChange={(e) => setPaddingPct(Number(e.target.value))}
                className="w-full accent-[--accent]"
              />
            </div>

            <div className="card-strativ">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-tertiary">Brand presets</p>
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

        <PatternSection />
      </main>
    </div>
  )
}

function ContrastBadge({ ratio }: { ratio: number }) {
  let label = 'Low'
  let cls = 'bg-error-subtle text-error'
  if (ratio >= 7) {
    label = 'AAA'
    cls = 'bg-success-subtle text-success'
  } else if (ratio >= 4.5) {
    label = 'AA'
    cls = 'bg-success-subtle text-success'
  } else if (ratio >= 3) {
    label = 'AA Large'
    cls = 'bg-warning-subtle text-warning'
  }
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
}
