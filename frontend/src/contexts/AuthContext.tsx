'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import api from '@/lib/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status?: string
  businessType?: 'B2B' | 'B2C'
  services?: string[]
  organization?: string
  companyName?: string
  companySize?: string
  industry?: string
  avatar?: string
  phone?: string
  location?: string
  language?: string
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  businessType: 'B2B' | 'B2C'
  services: string[]
  companyName?: string
  companySize?: string
  industry?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('kube_token') : null
    if (token) {
      api.getProfile()
        .then(res => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('kube_token')
          setUser(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password)
    setUser(res.data.user)
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    const res = await api.register(data)
    setUser(res.data.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('kube_token')
    setUser(null)
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }, [])

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
