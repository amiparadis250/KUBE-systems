'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Satellite } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#040810] flex items-center justify-center">
        <div className="auth-spinner" />
      </div>
    )
  }

  if (isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#040810] relative overflow-hidden">
      {/* Cyber grid background */}
      <div className="cyber-grid fixed inset-0" />

      {/* Scan line effect */}
      <div className="scan-line fixed inset-0 pointer-events-none" />

      {/* Radial glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 30%, rgba(0, 102, 255, 0.08) 0%, transparent 60%)'
      }} />

      {/* Logo bar */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,170,255,0.3)] group-hover:shadow-[0_0_30px_rgba(0,170,255,0.5)] transition-shadow">
            <Satellite className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white neon-blue">KUBE</span>
        </Link>
      </nav>

      {/* Centered content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-76px)] px-4 pb-8">
        {children}
      </main>
    </div>
  )
}
