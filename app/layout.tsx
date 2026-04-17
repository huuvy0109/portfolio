import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vy Quang Huu — QC Engineer · AI Automation',
  description:
    'Living Portfolio: a real Enterprise QA Pipeline where this page is the Subject Under Test. 6+ years QC experience — Playwright automation, AI-assisted QA, Haraworks & Sieuthisi.vn.',
  keywords: ['QC Engineer', 'QA Automation', 'Playwright', 'AI QA', 'Cursor AI', 'GitHub Actions', 'Haraworks', 'Seedcom'],
  authors: [{ name: 'Vy Quang Huu', url: 'https://linkedin.com/in/huuvy0109' }],
  openGraph: {
    title: 'Vy Quang Huu — QC Engineer · AI Automation',
    description: 'This page is not just a portfolio. It is a Subject Under Test.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vy Quang Huu — QC Engineer · AI Automation',
    description: 'Living Portfolio — this page is the Subject Under Test.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
