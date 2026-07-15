import type { Metadata } from 'next'
import { inter, expletus } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Symbol Studio — by Strativ',
  description: 'Generate, recolor and export the Strativ symbol as a 200×200 PNG.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${expletus.variable}`}>
      <body>{children}</body>
    </html>
  )
}
