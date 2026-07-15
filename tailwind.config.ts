import type { Config } from 'tailwindcss'

/**
 * Strativ Tailwind config.
 * Consumes CSS variables from tokens.css — never hardcode hex values here.
 * Source of truth: ~/.claude/skills/strativ-frontend/SKILL.md
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx,mdx}',
    './pages/**/*.{ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        'brand-orange':         'var(--brand-orange)',
        'brand-orange-hover':   'var(--brand-orange-hover)',
        'brand-orange-pressed': 'var(--brand-orange-pressed)',
        'brand-orange-subtle':  'var(--brand-orange-subtle)',
        'brand-yellow':         'var(--brand-yellow)',
        'brand-warm-black':     'var(--brand-warm-black)',
        'brand-light-grey':     'var(--brand-light-grey)',

        // Semantic (preferred — use these in components)
        canvas:   'var(--bg-canvas)',
        surface:  'var(--bg-surface)',
        subtle:   'var(--bg-subtle)',
        muted:    'var(--bg-muted)',
        inverse:  'var(--bg-inverse)',

        border: {
          subtle:  'var(--border-subtle)',
          DEFAULT: 'var(--border-default)',
          strong:  'var(--border-strong)',
        },

        text: {
          primary:    'var(--text-primary)',
          secondary:  'var(--text-secondary)',
          tertiary:   'var(--text-tertiary)',
          disabled:   'var(--text-disabled)',
          'on-accent': 'var(--text-on-accent)',
          'on-dark':   'var(--text-on-dark)',
        },

        accent: {
          DEFAULT:   'var(--accent)',
          hover:     'var(--accent-hover)',
          pressed:   'var(--accent-pressed)',
          subtle:    'var(--accent-subtle)',
          foreground:'var(--accent-foreground)',
        },

        // Status
        success: {
          DEFAULT: 'var(--success)',
          subtle:  'var(--success-subtle)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          subtle:  'var(--warning-subtle)',
        },
        error: {
          DEFAULT: 'var(--error)',
          subtle:  'var(--error-subtle)',
        },
        info: {
          DEFAULT: 'var(--info)',
          subtle:  'var(--info-subtle)',
        },

        // Data viz
        viz: {
          1: 'var(--viz-1)',
          2: 'var(--viz-2)',
          3: 'var(--viz-3)',
          4: 'var(--viz-4)',
          5: 'var(--viz-5)',
          6: 'var(--viz-6)',
          7: 'var(--viz-7)',
          8: 'var(--viz-8)',
        },

        // Raw neutral scale (use semantic above when possible)
        gray: {
          25:  'var(--gray-25)',
          50:  'var(--gray-50)',
          100: 'var(--gray-100)',
          200: 'var(--gray-200)',
          300: 'var(--gray-300)',
          400: 'var(--gray-400)',
          500: 'var(--gray-500)',
          600: 'var(--gray-600)',
          700: 'var(--gray-700)',
          800: 'var(--gray-800)',
          900: 'var(--gray-900)',
          950: 'var(--gray-950)',
        },
      },

      fontFamily: {
        // Two fonts only — no mono. Use Tailwind's `tabular-nums` for aligned digits in Inter.
        sans:    ['var(--font-sans)'],     // Inter — body + everything non-heading
        display: ['var(--font-display)'],  // Expletus Sans — every heading (h1-h6) and display moments
      },

      fontSize: {
        // [size, { lineHeight, letterSpacing, fontWeight }]
        'display-2xl': ['72px', { lineHeight: '80px', letterSpacing: '-0.03em' }],
        'display-xl':  ['60px', { lineHeight: '72px', letterSpacing: '-0.025em' }],
        'display-lg':  ['48px', { lineHeight: '56px', letterSpacing: '-0.02em' }],
        'display-md':  ['36px', { lineHeight: '44px', letterSpacing: '-0.02em' }],
        'display-sm':  ['30px', { lineHeight: '38px', letterSpacing: '-0.015em' }],

        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
        xl:    ['20px', { lineHeight: '30px', letterSpacing: '-0.005em' }],
        lg:    ['18px', { lineHeight: '28px' }],
        md:    ['16px', { lineHeight: '24px' }],
        sm:    ['14px', { lineHeight: '20px' }],
        xs:    ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
      },

      spacing: {
        // 8px-aligned scale (Tailwind defaults already cover most; these add 0.5 and a few extras)
        0.5: 'var(--space-0-5)',
        section: 'var(--space-8)',   // 32px
        gutter:  'var(--space-6)',   // 24px
        page:    'var(--space-8)',   // 32px
      },

      borderRadius: {
        xs:   'var(--radius-xs)',
        sm:   'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        full: 'var(--radius-full)',
      },

      boxShadow: {
        xs:    'var(--shadow-xs)',
        sm:    'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-sm)',
        md:    'var(--shadow-md)',
        lg:    'var(--shadow-lg)',
        xl:    'var(--shadow-xl)',
        focus: 'var(--shadow-focus)',
      },

      transitionDuration: {
        fast:   '120ms',
        DEFAULT:'200ms',
        slow:   '320ms',
        slower: '480ms',
      },

      transitionTimingFunction: {
        out:    'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
        in:     'cubic-bezier(0.7, 0, 0.84, 0)',
      },

      maxWidth: {
        container: 'var(--container-max)',
        content:   'var(--content-max)',
      },

      keyframes: {
        'fade-in':   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-out':  { '0%': { opacity: '1' }, '100%': { opacity: '0' } },
        'scale-in':  { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        'slide-up':  { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },

      animation: {
        'fade-in':  'fade-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-out': 'fade-out 120ms cubic-bezier(0.7, 0, 0.84, 0)',
        'scale-in': 'scale-in 320ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slide-up 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

export default config
