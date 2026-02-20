'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, User, Users, Globe, Layers, Shield, Eye, EyeOff,
  Mail, Lock, Phone, ArrowRight, ArrowLeft, Check, ChevronRight,
  Satellite, Zap, BarChart3, MapPin, AlertTriangle, Leaf
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

type BusinessType = 'B2B' | 'B2C' | null
type ServiceId = 'KUBE_FARM' | 'KUBE_PARK' | 'KUBE_LAND'

interface FormData {
  businessType: BusinessType
  services: ServiceId[]
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  companyName: string
  companySize: string
  industry: string
}

const INITIAL_FORM: FormData = {
  businessType: null,
  services: [],
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  companyName: '',
  companySize: '',
  industry: ''
}

const STEPS = [
  { num: 1, label: 'Account Type' },
  { num: 2, label: 'Services' },
  { num: 3, label: 'Details' },
  { num: 4, label: 'Confirm' }
]

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)
  const [direction, setDirection] = useState(1)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const updateForm = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const next = () => {
    setDirection(1)
    setStep(s => Math.min(s + 1, 4))
  }

  const back = () => {
    setDirection(-1)
    setStep(s => Math.max(s - 1, 1))
  }

  const canAdvance = (): boolean => {
    switch (step) {
      case 1: return formData.businessType !== null
      case 2: return formData.services.length > 0
      case 3: {
        const base = formData.firstName && formData.lastName && formData.email && formData.password && formData.password === formData.confirmPassword && formData.password.length >= 8
        if (formData.businessType === 'B2B') return !!(base && formData.companyName)
        return !!base
      }
      default: return true
    }
  }

  const toggleService = (id: ServiceId) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(id)
        ? prev.services.filter(s => s !== id)
        : [...prev.services, id]
    }))
  }

  const handleSubmit = async () => {
    setError('')
    setIsSubmitting(true)
    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        businessType: formData.businessType as 'B2B' | 'B2C',
        services: formData.services,
        companyName: formData.companyName || undefined,
        companySize: formData.companySize || undefined,
        industry: formData.industry || undefined
      })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 200 : -200, opacity: 0 })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl"
    >
      <div className="hud-panel p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white neon-blue mb-1">Join KUBE</h1>
          <p className="text-sm text-gray-500">Africa&apos;s Aerial Intelligence Platform</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step > s.num
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(0,204,102,0.4)]'
                    : step === s.num
                    ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_8px_rgba(0,170,255,0.4)]'
                    : 'bg-white/5 text-gray-600'
                }`}>
                  {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span className={`text-[10px] font-mono uppercase tracking-wider hidden sm:block ${
                  step >= s.num ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px mx-2 transition-colors ${
                  step > s.num ? 'bg-emerald-500/40' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Step Content */}
        <div className="min-h-[320px] relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div key="step1" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <Step1BusinessType value={formData.businessType} onChange={(v) => updateForm({ businessType: v })} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <Step2Services selected={formData.services} onToggle={toggleService} businessType={formData.businessType} />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="step3" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <Step3Details formData={formData} updateForm={updateForm} showPassword={showPassword} setShowPassword={setShowPassword} />
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="step4" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <Step4Confirm formData={formData} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
          {step > 1 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={back}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </motion.button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={next}
              disabled={!canAdvance()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(0,102,255,0.3)] hover:shadow-[0_0_25px_rgba(0,102,255,0.5)] transition-shadow disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(0,204,102,0.3)] hover:shadow-[0_0_25px_rgba(0,204,102,0.5)] transition-shadow disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="auth-spinner" />
              ) : (
                <>Create Account <Zap className="w-4 h-4" /></>
              )}
            </motion.button>
          )}
        </div>

        {/* Login Link */}
        <div className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Step 1: Business Type ──────────────────────────────

function Step1BusinessType({ value, onChange }: { value: BusinessType; onChange: (v: BusinessType) => void }) {
  const options = [
    {
      id: 'B2B' as const,
      icon: Building2,
      title: 'Business / Organization',
      desc: 'Tourism companies, governments, parks management, NGOs',
      sub: 'Products & Enterprise Services',
      features: ['Fleet management', 'API access', 'Custom reporting', 'Priority support']
    },
    {
      id: 'B2C' as const,
      icon: User,
      title: 'Individual Farmer',
      desc: 'Small-scale farmers, rural farmers, livestock owners',
      sub: 'Smart Farming Tools',
      features: ['Herd tracking', 'Health alerts', 'SMS notifications', 'Mobile app']
    }
  ]

  return (
    <div>
      <p className="text-sm text-gray-400 mb-5 text-center">How will you use KUBE?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt) => {
          const selected = value === opt.id
          return (
            <motion.button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`text-left p-5 rounded-xl border transition-all duration-300 ${
                selected
                  ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(0,170,255,0.15)]'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selected ? 'bg-cyan-500/20' : 'bg-white/5'
                }`}>
                  <opt.icon className={`w-5 h-5 ${selected ? 'text-cyan-400' : 'text-gray-500'}`} />
                </div>
                {selected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center"
                  >
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                  </motion.div>
                )}
              </div>
              <h3 className="font-semibold text-white mb-1">{opt.title}</h3>
              <p className="text-xs text-gray-500 mb-2">{opt.desc}</p>
              <span className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-wider">{opt.sub}</span>

              <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                {opt.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[11px] text-gray-500">
                    <ChevronRight className="w-3 h-3 text-cyan-500/40" />
                    {f}
                  </div>
                ))}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 2: Service Selection ──────────────────────────

function Step2Services({ selected, onToggle, businessType }: { selected: ServiceId[]; onToggle: (id: ServiceId) => void; businessType: BusinessType }) {
  const services = [
    {
      id: 'KUBE_FARM' as ServiceId,
      icon: Users,
      title: 'KUBE-Farm',
      tagline: 'Livestock Intelligence',
      color: '#0066FF',
      features: ['Herd monitoring & counting', 'Disease early detection', 'Pasture health tracking', 'SMS & mobile alerts']
    },
    {
      id: 'KUBE_PARK' as ServiceId,
      icon: Globe,
      title: 'KUBE-Park',
      tagline: 'Wildlife & Conservation',
      color: '#00CC66',
      features: ['Wildlife census & tracking', 'Anti-poaching intelligence', 'Ranger patrol management', 'Incident reporting']
    },
    {
      id: 'KUBE_LAND' as ServiceId,
      icon: Layers,
      title: 'KUBE-Land',
      tagline: 'Landscape & Climate',
      color: '#00AAFF',
      features: ['Degradation monitoring', 'NDVI vegetation analysis', 'Climate risk assessment', 'Land-use change detection']
    }
  ]

  return (
    <div>
      <p className="text-sm text-gray-400 mb-1 text-center">Select the services you need</p>
      <p className="text-[10px] text-gray-600 mb-5 text-center font-mono">You can select multiple services</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {services.map((svc) => {
          const isSelected = selected.includes(svc.id)
          return (
            <motion.button
              key={svc.id}
              onClick={() => onToggle(svc.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`text-left p-4 rounded-xl border transition-all duration-300 ${
                isSelected
                  ? 'border-opacity-40 shadow-lg'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
              style={isSelected ? {
                borderColor: `${svc.color}66`,
                background: `${svc.color}0D`,
                boxShadow: `0 0 20px ${svc.color}20`
              } : {}}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{
                  background: isSelected ? `${svc.color}20` : 'rgba(255,255,255,0.05)'
                }}>
                  <svc.icon className="w-4.5 h-4.5" style={{ color: isSelected ? svc.color : '#6b7280' }} />
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'border-transparent' : 'border-gray-700'
                }`} style={isSelected ? { background: svc.color } : {}}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>

              <h3 className="font-semibold text-white text-sm mb-0.5">{svc.title}</h3>
              <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: `${svc.color}99` }}>
                {svc.tagline}
              </span>

              <div className="mt-3 pt-2 border-t border-white/5 space-y-1">
                {svc.features.map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <ChevronRight className="w-2.5 h-2.5 flex-shrink-0" style={{ color: `${svc.color}60` }} />
                    {f}
                  </div>
                ))}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 3: Account Details ────────────────────────────

function Step3Details({ formData, updateForm, showPassword, setShowPassword }: {
  formData: FormData; updateForm: (u: Partial<FormData>) => void; showPassword: boolean; setShowPassword: (v: boolean) => void
}) {
  const isB2B = formData.businessType === 'B2B'

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400 mb-4 text-center">Create your account</p>

      {/* Name Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider mb-1.5">First Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/40" />
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => updateForm({ firstName: e.target.value })}
              placeholder="First name"
              className="hud-input"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider mb-1.5">Last Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/40" />
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => updateForm({ lastName: e.target.value })}
              placeholder="Last name"
              className="hud-input"
              required
            />
          </div>
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider mb-1.5">Email Address *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/40" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateForm({ email: e.target.value })}
            placeholder="you@example.com"
            className="hud-input"
            required
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider mb-1.5">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/40" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateForm({ phone: e.target.value })}
            placeholder="+250 788 123 456"
            className="hud-input"
          />
        </div>
      </div>

      {/* Password Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider mb-1.5">Password *</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/40" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => updateForm({ password: e.target.value })}
              placeholder="Min 8 characters"
              className={`hud-input pr-10 ${formData.password && formData.password.length < 8 ? 'hud-input-error' : ''}`}
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500/40 hover:text-cyan-400"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider mb-1.5">Confirm *</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/40" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => updateForm({ confirmPassword: e.target.value })}
              placeholder="Confirm password"
              className={`hud-input ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'hud-input-error' : ''}`}
              required
            />
          </div>
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="text-[10px] text-red-400 mt-1">Passwords do not match</p>
          )}
        </div>
      </div>

      {/* B2B Fields */}
      <AnimatePresence>
        {isB2B && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="pt-3 border-t border-white/5">
              <p className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider mb-3">Organization Details</p>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider mb-1.5">Company Name *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/40" />
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateForm({ companyName: e.target.value })}
                  placeholder="Organization name"
                  className="hud-input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider mb-1.5">Company Size</label>
                <select
                  value={formData.companySize}
                  onChange={(e) => updateForm({ companySize: e.target.value })}
                  className="hud-select"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="200+">200+ employees</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider mb-1.5">Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e) => updateForm({ industry: e.target.value })}
                  className="hud-select"
                >
                  <option value="">Select industry</option>
                  <option value="Tourism">Tourism</option>
                  <option value="Government">Government</option>
                  <option value="Parks & Wildlife">Parks & Wildlife Management</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Research">Research & Academia</option>
                  <option value="NGO">NGO / Non-profit</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Step 4: Confirmation ───────────────────────────────

function Step4Confirm({ formData }: { formData: FormData }) {
  const serviceLabels: Record<ServiceId, { name: string; color: string }> = {
    KUBE_FARM: { name: 'KUBE-Farm', color: '#0066FF' },
    KUBE_PARK: { name: 'KUBE-Park', color: '#00CC66' },
    KUBE_LAND: { name: 'KUBE-Land', color: '#00AAFF' }
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-5 text-center">Review your information</p>

      <div className="space-y-4">
        {/* Account Type */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider mb-2">Account Type</div>
          <div className="flex items-center gap-2">
            {formData.businessType === 'B2B' ? <Building2 className="w-4 h-4 text-cyan-400" /> : <User className="w-4 h-4 text-cyan-400" />}
            <span className="text-white font-medium">
              {formData.businessType === 'B2B' ? 'Business / Organization' : 'Individual Farmer'}
            </span>
          </div>
        </div>

        {/* Services */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider mb-2">Selected Services</div>
          <div className="flex flex-wrap gap-2">
            {formData.services.map(svc => (
              <span
                key={svc}
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: `${serviceLabels[svc].color}15`,
                  color: serviceLabels[svc].color,
                  border: `1px solid ${serviceLabels[svc].color}30`
                }}
              >
                {serviceLabels[svc].name}
              </span>
            ))}
          </div>
        </div>

        {/* Personal Details */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider mb-2">Personal Details</div>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-gray-500">Name</span>
            <span className="text-white">{formData.firstName} {formData.lastName}</span>
            <span className="text-gray-500">Email</span>
            <span className="text-white">{formData.email}</span>
            {formData.phone && (
              <>
                <span className="text-gray-500">Phone</span>
                <span className="text-white">{formData.phone}</span>
              </>
            )}
          </div>
        </div>

        {/* Company Details (B2B) */}
        {formData.businessType === 'B2B' && formData.companyName && (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-wider mb-2">Organization</div>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-gray-500">Company</span>
              <span className="text-white">{formData.companyName}</span>
              {formData.companySize && (
                <>
                  <span className="text-gray-500">Size</span>
                  <span className="text-white">{formData.companySize}</span>
                </>
              )}
              {formData.industry && (
                <>
                  <span className="text-gray-500">Industry</span>
                  <span className="text-white">{formData.industry}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
