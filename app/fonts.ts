import { Inter, Expletus_Sans } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sans-loader',
  weight: ['400', '500', '600', '700'],
})

export const expletus = Expletus_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-display-loader',
})
