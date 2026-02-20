'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Satellite } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#040810] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(0,170,255,0.3)]"
        >
          <Satellite className="w-6 h-6 text-white" />
        </motion.div>
        <div className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-[0.3em]">
          Initializing Command Center
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return <>{children}</>
}
