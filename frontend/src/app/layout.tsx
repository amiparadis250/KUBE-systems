import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'KUBE - Africa\'s First Aerial Intelligence Platform',
  description: 'Turning Africa\'s livestock, wildlife, and landscapes into real-time, data-driven, protectable assets',
  keywords: ['agriculture', 'livestock', 'wildlife', 'conservation', 'AI', 'drones', 'Africa', 'Rwanda'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
