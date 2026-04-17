import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Huu Vy — QA Lead · AI Automation Engineer',
  description:
    'Living Portfolio: a real Enterprise QA Pipeline where this page is the Subject Under Test. 7 years of QA leadership, AI-driven automation, and system quality design.',
  openGraph: {
    title: 'Huu Vy — QA Lead · AI Automation Engineer',
    description: 'This page is not just a portfolio. It is a Subject Under Test.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
