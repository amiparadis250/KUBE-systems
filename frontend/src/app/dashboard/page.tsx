'use client'

/**
 * KUBE AERIAL INTELLIGENCE COMMAND CENTER
 * Futuristic Dashboard with User Profile, Logout & Live Database
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell
} from 'recharts'
import {
  Activity, AlertTriangle, TrendingUp, Shield, Satellite,
  Map as MapIcon, Users, Layers, Eye, Zap, Bell, MapPin,
  Crosshair, Wifi, Database, Cpu, Globe, Thermometer,
  CloudRain, Wind, BarChart3, Target, RefreshCw, Power,
  Signal, LogOut, ChevronDown, User, Settings, Building2,
  Sprout, TreePine, Mountain, Plane, Brain
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

// ─── Types ──────────────────────────────────────────────
interface DashboardStats {
  farms: number
  herds: number
  animals: number
  parks: number
  wildlife: number
  landZones: number
  activeAlerts: number
}

interface FarmData {
  stats: {
    totalAnimals: number
    healthyAnimals: number
    sickAnimals: number
    missingAnimals: number
    healthRate: string
  }
  herds: any[]
  recentAlerts: any[]
  healthTrend: any[]
}

interface ParkData {
  stats: {
    parks: number
    wildlifeSpecies: number
    activePatrols: number
    incidentsCount: number
  }
  recentIncidents: any[]
  wildlifePopulations: any[]
}

interface LandData {
  stats: {
    totalZones: number
    healthyZones: number
    degradedZones: number
    healthRate: string
  }
  recentChanges: any[]
  zones: any[]
}

// ─── Fallback Data ──────────────────────────────────────
const FALLBACK_OVERVIEW: DashboardStats = {
  farms: 2, herds: 3, animals: 50, parks: 2,
  wildlife: 5, landZones: 2, activeAlerts: 3
}

const FALLBACK_FARM: FarmData = {
  stats: { totalAnimals: 581, healthyAnimals: 537, sickAnimals: 28, missingAnimals: 16, healthRate: '92.4' },
  herds: [
    { id: '1', name: 'Main Dairy Herd', animalType: 'Cattle', totalCount: 245, healthyCount: 230, sickCount: 10, missingCount: 5, status: 'HEALTHY', avgHealth: 92.5, riskScore: 12, farm: { name: 'Bugesera Valley Farm' } },
    { id: '2', name: 'Beef Cattle Herd', animalType: 'Cattle', totalCount: 180, healthyCount: 171, sickCount: 6, missingCount: 3, status: 'HEALTHY', avgHealth: 95.1, riskScore: 8, farm: { name: 'Bugesera Valley Farm' } },
    { id: '3', name: 'Community Goat Herd', animalType: 'Goat', totalCount: 156, healthyCount: 136, sickCount: 12, missingCount: 8, status: 'AT_RISK', avgHealth: 90.3, riskScore: 22, farm: { name: 'Kayonza Livestock Center' } }
  ],
  recentAlerts: [
    { id: '1', type: 'HEALTH', severity: 'CRITICAL', title: 'Fever Detected in Herd', message: '12 cattle showing elevated temperature', location: 'Bugesera Valley Farm - Zone A', createdAt: new Date().toISOString(), status: 'NEW' },
    { id: '2', type: 'SECURITY', severity: 'WARNING', title: 'Missing Animals Detected', message: '3 cattle not found in latest aerial scan', location: 'Kayonza - South Zone', createdAt: new Date().toISOString(), status: 'ACKNOWLEDGED' },
    { id: '3', type: 'ENVIRONMENTAL', severity: 'WARNING', title: 'Pasture Degradation Alert', message: 'NDVI dropped below threshold in Zone B', location: 'Bugesera Valley Farm', createdAt: new Date().toISOString(), status: 'NEW' }
  ],
  healthTrend: []
}

const FALLBACK_PARK: ParkData = {
  stats: { parks: 2, wildlifeSpecies: 5, activePatrols: 3, incidentsCount: 2 },
  recentIncidents: [
    { id: '1', type: 'INTRUSION', severity: 'MEDIUM', title: 'Unauthorized Livestock Grazing', status: 'RESOLVED', reportedAt: new Date().toISOString(), park: { name: 'Akagera National Park' } },
    { id: '2', type: 'INJURY', severity: 'HIGH', title: 'Injured Giraffe Spotted', status: 'IN_PROGRESS', reportedAt: new Date().toISOString(), park: { name: 'Akagera National Park' } }
  ],
  wildlifePopulations: [
    { id: '1', species: 'Elephant', commonName: 'African Elephant', estimatedCount: 124, lastCensusCount: 118, trend: 'increasing', healthStatus: 'healthy' },
    { id: '2', species: 'Lion', commonName: 'African Lion', estimatedCount: 42, lastCensusCount: 40, trend: 'stable', healthStatus: 'healthy' },
    { id: '3', species: 'Giraffe', commonName: 'Masai Giraffe', estimatedCount: 87, lastCensusCount: 82, trend: 'increasing', healthStatus: 'monitored' },
    { id: '4', species: 'Chimpanzee', commonName: 'Eastern Chimpanzee', estimatedCount: 400, lastCensusCount: 390, trend: 'stable', healthStatus: 'healthy' }
  ]
}

const FALLBACK_LAND: LandData = {
  stats: { totalZones: 2, healthyZones: 1, degradedZones: 1, healthRate: '50.0' },
  recentChanges: [
    { id: '1', changeType: 'degradation', severity: 'high', detectedAt: new Date().toISOString(), zone: { name: 'Bugesera Grasslands', region: 'Eastern Province' } }
  ],
  zones: [
    { id: '1', name: 'Bugesera Grasslands', region: 'Eastern Province', degradationLevel: 38, surveys: [{ ndvi: 0.58, healthScore: 62 }] },
    { id: '2', name: 'Kayonza Agricultural Zone', region: 'Eastern Province', degradationLevel: 22, surveys: [{ ndvi: 0.71, healthScore: 78 }] }
  ]
}

// ─── Chart Helpers ──────────────────────────────────────
const generateTimeSeriesData = () => {
  const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']
  return hours.map((time) => ({
    time,
    health: 88 + Math.random() * 8,
    coverage: 78 + Math.random() * 15,
    alerts: Math.floor(Math.random() * 5)
  }))
}

const RADAR_DATA = [
  { subject: 'Health', A: 92, fullMark: 100 },
  { subject: 'Coverage', A: 85, fullMark: 100 },
  { subject: 'Response', A: 88, fullMark: 100 },
  { subject: 'Accuracy', A: 95, fullMark: 100 },
  { subject: 'Uptime', A: 99, fullMark: 100 },
  { subject: 'Efficiency', A: 91, fullMark: 100 }
]

const PIE_COLORS = ['#00CC66', '#0066FF', '#FFAA00', '#FF3366']

const SERVICE_META: Record<string, { label: string; color: string; icon: any; desc: string }> = {
  KUBE_FARM: { label: 'KUBE-Farm', color: '#0066FF', icon: Sprout, desc: 'Livestock Intelligence' },
  KUBE_PARK: { label: 'KUBE-Park', color: '#00CC66', icon: TreePine, desc: 'Wildlife Protection' },
  KUBE_LAND: { label: 'KUBE-Land', color: '#00AAFF', icon: Mountain, desc: 'Landscape Monitor' }
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getRoleBadge(role: string) {
  const map: Record<string, { label: string; color: string }> = {
    ADMIN: { label: 'Administrator', color: '#FF3366' },
    FARMER: { label: 'Farmer', color: '#00CC66' },
    RANGER: { label: 'Park Ranger', color: '#FFAA00' },
    ANALYST: { label: 'Analyst', color: '#00AAFF' }
  }
  return map[role] || { label: role, color: '#666' }
}

// ─── Main Dashboard Component ───────────────────────────
export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeModule, setActiveModule] = useState<'farm' | 'park' | 'land'>('farm')
  const [liveTime, setLiveTime] = useState(new Date())
  const [isDbConnected, setIsDbConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const [overview, setOverview] = useState<DashboardStats>(FALLBACK_OVERVIEW)
  const [farmData, setFarmData] = useState<FarmData>(FALLBACK_FARM)
  const [parkData, setParkData] = useState<ParkData>(FALLBACK_PARK)
  const [landData, setLandData] = useState<LandData>(FALLBACK_LAND)
  const [timeSeriesData, setTimeSeriesData] = useState(generateTimeSeriesData())

  // Determine user's available modules
  const rawServices = user?.services
  const userServices: string[] = Array.isArray(rawServices)
    ? rawServices
    : typeof rawServices === 'string'
      ? JSON.parse(rawServices)
      : ['KUBE_FARM', 'KUBE_PARK', 'KUBE_LAND']
  const modules = [
    { id: 'farm' as const, key: 'KUBE_FARM', label: 'KUBE-Farm', icon: Sprout, color: '#0066FF', desc: 'Livestock Intelligence' },
    { id: 'park' as const, key: 'KUBE_PARK', label: 'KUBE-Park', icon: TreePine, color: '#00CC66', desc: 'Wildlife Protection' },
    { id: 'land' as const, key: 'KUBE_LAND', label: 'KUBE-Land', icon: Mountain, color: '#00AAFF', desc: 'Landscape Monitor' }
  ].filter(m => userServices.includes(m.key))

  // Set initial active module to first available
  useEffect(() => {
    if (modules.length > 0 && !modules.find(m => m.id === activeModule)) {
      setActiveModule(modules[0].id)
    }
  }, [userServices])

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch data from database
  const fetchData = useCallback(async () => {
    try {
      const [overviewRes, farmRes, parkRes, landRes] = await Promise.allSettled([
        api.getDashboardOverview(),
        api.getFarmDashboard(),
        api.getParkDashboard(),
        api.getLandDashboard()
      ])

      if (overviewRes.status === 'fulfilled') {
        setOverview(overviewRes.value.data.stats)
        setIsDbConnected(true)
      }
      if (farmRes.status === 'fulfilled') setFarmData(farmRes.value.data)
      if (parkRes.status === 'fulfilled') setParkData(parkRes.value.data)
      if (landRes.status === 'fulfilled') setLandData(landRes.value.data)
    } catch {
      setIsDbConnected(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const dataInterval = setInterval(fetchData, 30000)
    return () => clearInterval(dataInterval)
  }, [fetchData])

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setLiveTime(new Date())
      setTimeSeriesData(generateTimeSeriesData())
    }, 5000)
    return () => clearInterval(clockInterval)
  }, [])

  const roleBadge = getRoleBadge(user?.role || '')

  return (
    <div className="min-h-screen bg-[#040810] text-white cyber-grid scan-line overflow-hidden relative">

      {/* ─── Command Center Header ─── */}
      <header className="border-b border-cyan-500/10 bg-[#060d1a]/90 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & System Status */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,170,255,0.3)]">
                  <Satellite className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#060d1a] animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-wider neon-blue">
                  KUBE <span className="text-cyan-400 font-mono text-xs ml-1 opacity-60">v2.0</span>
                </h1>
                <p className="text-[10px] text-cyan-500/50 font-mono tracking-[0.3em] uppercase">
                  Aerial Intelligence Command
                </p>
              </div>
            </div>

            {/* Center: System Indicators */}
            <div className="hidden lg:flex items-center gap-6">
              <SystemIndicator icon={Database} label="DATABASE" status={isDbConnected ? 'online' : 'offline'} />
              <SystemIndicator icon={Satellite} label="DRONES" status="online" />
              <SystemIndicator icon={Wifi} label="NETWORK" status="online" />
              <SystemIndicator icon={Cpu} label="AI ENGINE" status="online" />
            </div>

            {/* Right: Clock, Alerts & User Profile */}
            <div className="flex items-center gap-3">
              {/* Clock */}
              <div className="text-right mr-1 hidden sm:block">
                <div className="font-mono text-sm text-cyan-300 neon-blue">
                  {liveTime.toLocaleTimeString('en-US', { hour12: false })}
                </div>
                <div className="font-mono text-[10px] text-cyan-500/40">
                  {liveTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* Alerts */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
              >
                <Bell className="w-4 h-4 text-red-400" />
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,51,102,0.5)]">
                  {overview.activeAlerts}
                </span>
              </motion.button>

              {/* Refresh */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchData}
                className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
              >
                <RefreshCw className={`w-4 h-4 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
              </motion.button>

              {/* Aerial Command Map */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/map')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 hover:from-blue-500/20 hover:to-cyan-500/20 hover:border-blue-400/50 transition-all group"
              >
                <Satellite className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                <span className="text-xs font-mono font-bold text-blue-300 group-hover:text-blue-200 transition-colors hidden xl:inline">
                  AERIAL MAP
                </span>
              </motion.button>

              {/* Drone Control */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/drones')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-400/50 transition-all group"
              >
                <Plane className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                <span className="text-xs font-mono font-bold text-purple-300 group-hover:text-purple-200 transition-colors hidden xl:inline">
                  DRONES
                </span>
              </motion.button>

              {/* Analytics Center */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/analytics')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/30 hover:from-cyan-500/20 hover:to-teal-500/20 hover:border-cyan-400/50 transition-all group"
              >
                <Brain className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <span className="text-xs font-mono font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors hidden xl:inline">
                  ANALYTICS
                </span>
              </motion.button>

              {/* Admin Panel (only for ADMIN role) */}
              {user?.role === 'ADMIN' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/dashboard/admin/users')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 hover:from-red-500/20 hover:to-orange-500/20 hover:border-red-400/50 transition-all group"
                >
                  <Shield className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors" />
                  <span className="text-xs font-mono font-bold text-red-300 group-hover:text-red-200 transition-colors hidden xl:inline">
                    ADMIN
                  </span>
                </motion.button>
              )}

              {/* Divider */}
              <div className="w-px h-8 bg-cyan-500/15 mx-1" />

              {/* User Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/20 hover:bg-white/[0.05] transition-all"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_12px_rgba(0,170,255,0.2)]">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-white leading-tight">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-[10px] font-mono leading-tight" style={{ color: roleBadge.color }}>
                      {roleBadge.label}
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-72 rounded-xl overflow-hidden border border-cyan-500/15 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                      style={{ background: 'linear-gradient(135deg, rgba(10,15,30,0.98), rgba(5,10,25,0.98))', backdropFilter: 'blur(20px)' }}
                    >
                      {/* Profile Header */}
                      <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-[0_0_20px_rgba(0,170,255,0.2)]">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {user?.firstName} {user?.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{user?.email}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded"
                                style={{ color: roleBadge.color, background: `${roleBadge.color}15`, border: `1px solid ${roleBadge.color}25` }}
                              >
                                {user?.role}
                              </span>
                              {user?.businessType && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400">
                                  {user.businessType}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Services */}
                      {userServices.length > 0 && (
                        <div className="px-4 py-3 border-b border-white/5">
                          <div className="text-[9px] font-mono text-gray-600 uppercase tracking-wider mb-2">Active Services</div>
                          <div className="flex flex-wrap gap-1.5">
                            {userServices.map((svc: string) => {
                              const meta = SERVICE_META[svc]
                              if (!meta) return null
                              const Icon = meta.icon
                              return (
                                <span
                                  key={svc}
                                  className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md"
                                  style={{ color: meta.color, background: `${meta.color}10`, border: `1px solid ${meta.color}20` }}
                                >
                                  <Icon className="w-3 h-3" />
                                  {meta.label}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Organization */}
                      {(user?.organization || user?.companyName) && (
                        <div className="px-4 py-3 border-b border-white/5">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Building2 className="w-3.5 h-3.5 text-cyan-500/40" />
                            {user.companyName || user.organization}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false)
                            router.push('/dashboard/settings')
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Settings className="w-4 h-4" />
                          Account Settings
                        </button>
                        <div className="my-1 border-t border-white/5" />
                        <button
                          onClick={() => { setShowProfileMenu(false); logout() }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Module Switcher */}
          <div className="flex gap-1 mt-3">
            {modules.map((module) => (
              <motion.button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-t-lg font-medium text-sm transition-all ${
                  activeModule === module.id
                    ? 'bg-white/5 text-white border-t border-l border-r border-cyan-500/20'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                <module.icon className="w-4 h-4" style={{ color: activeModule === module.id ? module.color : undefined }} />
                <span>{module.label}</span>
                <span className="text-[9px] text-gray-600 hidden sm:inline">{module.desc}</span>
                {activeModule === module.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: module.color, boxShadow: `0 0 10px ${module.color}50` }}
                  />
                )}
              </motion.button>
            ))}

            {/* DB Status Pill */}
            <div className="ml-auto flex items-center gap-2 text-[10px] font-mono px-3">
              <div className={`w-1.5 h-1.5 rounded-full ${isDbConnected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(0,204,102,0.5)]' : 'bg-amber-400 shadow-[0_0_6px_rgba(255,170,0,0.5)]'}`} />
              <span className={isDbConnected ? 'text-emerald-400/70' : 'text-amber-400/70'}>
                {isDbConnected ? 'DB CONNECTED' : 'DEMO MODE'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Dashboard Content ─── */}
      <div className="max-w-[1600px] mx-auto px-6 py-5 relative z-10">

        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center justify-between"
        >
          <div>
            <h2 className="text-xl font-bold text-white">
              {getGreeting()}, <span className="neon-blue">{user?.firstName}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">
              {isDbConnected ? 'All systems operational — live data active' : 'Running in demo mode — connect database for live data'}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            {userServices.map((svc: string) => {
              const meta = SERVICE_META[svc]
              if (!meta) return null
              return (
                <span
                  key={svc}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-md border"
                  style={{ color: meta.color, borderColor: `${meta.color}25`, background: `${meta.color}08` }}
                >
                  {meta.label}
                </span>
              )
            })}
          </div>
        </motion.div>

        {/* Row 1: Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
          <HoloStatCard icon={Shield} label="Animals Protected" value={overview.animals} color="#0066FF" suffix="" />
          <HoloStatCard icon={Activity} label="Health Rate" value={parseFloat(farmData.stats.healthRate)} color="#00CC66" suffix="%" />
          <HoloStatCard icon={AlertTriangle} label="Active Alerts" value={overview.activeAlerts} color="#FF3366" suffix="" />
          <HoloStatCard icon={Satellite} label="Active Patrols" value={parkData.stats.activePatrols} color="#FFAA00" suffix="" />
          <HoloStatCard icon={MapIcon} label="Total Farms" value={overview.farms} color="#00AAFF" suffix="" />
          <HoloStatCard icon={Globe} label="Wildlife Species" value={parkData.stats.wildlifeSpecies || overview.wildlife} color="#9333EA" suffix="" />
        </div>

        {/* Row 2: Main Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">

          {/* Left Panel: Module Data */}
          <div className="lg:col-span-4 space-y-4">
            <AnimatePresence mode="wait">
              {activeModule === 'farm' && (
                <motion.div key="farm" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <FarmPanel data={farmData} />
                </motion.div>
              )}
              {activeModule === 'park' && (
                <motion.div key="park" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <ParkPanel data={parkData} />
                </motion.div>
              )}
              {activeModule === 'land' && (
                <motion.div key="land" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <LandPanel data={landData} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Center: Charts */}
          <div className="lg:col-span-5 space-y-4">
            {/* Area Chart */}
            <div className="hud-panel p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  SYSTEM TELEMETRY
                </h3>
                <span className="text-[10px] font-mono text-cyan-500/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  LIVE FEED
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00CC66" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00CC66" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="coverageGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#1e3a5f" tick={{ fill: '#3b6d8f', fontSize: 10 }} />
                  <YAxis stroke="#1e3a5f" tick={{ fill: '#3b6d8f', fontSize: 10 }} domain={[70, 100]} />
                  <Tooltip
                    contentStyle={{ background: '#0a1628', border: '1px solid rgba(0,170,255,0.2)', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#00AAFF' }}
                  />
                  <Area type="monotone" dataKey="health" stroke="#00CC66" strokeWidth={2} fill="url(#healthGradient)" />
                  <Area type="monotone" dataKey="coverage" stroke="#0066FF" strokeWidth={2} fill="url(#coverageGradient)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 text-[10px]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Health Index</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Coverage</span>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="hud-panel p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  SYSTEM PERFORMANCE
                </h3>
                <span className="text-[10px] font-mono text-emerald-400">ALL SYSTEMS NOMINAL</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={RADAR_DATA}>
                  <PolarGrid stroke="rgba(0,170,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#3b6d8f', fontSize: 10 }} />
                  <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                  <Radar name="Performance" dataKey="A" stroke="#00AAFF" fill="#00AAFF" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Panel: Alerts & Operations */}
          <div className="lg:col-span-3 space-y-4">
            {/* Live Alerts */}
            <div className="hud-panel p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  LIVE ALERTS
                </h3>
                <span className="text-[10px] font-mono text-red-400/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  {farmData.recentAlerts.length} ACTIVE
                </span>
              </div>
              <div className="space-y-2 max-h-[320px] overflow-y-auto dashboard-scroll pr-1">
                {farmData.recentAlerts.map((alert: any, index: number) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all glow-border ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                        : alert.severity === 'WARNING'
                        ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10'
                        : 'bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/10'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        alert.severity === 'CRITICAL' ? 'bg-red-400 shadow-[0_0_6px_rgba(255,51,102,0.5)]' :
                        alert.severity === 'WARNING' ? 'bg-amber-400 shadow-[0_0_6px_rgba(255,170,0,0.5)]' :
                        'bg-cyan-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold mb-0.5 truncate">{alert.title}</h4>
                        <p className="text-[10px] text-gray-500 mb-1.5 line-clamp-2">{alert.message}</p>
                        <div className="flex items-center justify-between text-[9px] text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[120px]">{alert.location}</span>
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                            alert.status === 'NEW' ? 'bg-red-500/20 text-red-400' :
                            alert.status === 'ACKNOWLEDGED' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-cyan-500/20 text-cyan-400'
                          }`}>
                            {alert.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Operations Radial */}
            <div className="hud-panel p-5">
              <h3 className="text-sm font-semibold text-cyan-300 flex items-center gap-2 mb-4">
                <Power className="w-4 h-4" />
                OPERATIONS
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <RadialGauge value={98} label="System" color="#00CC66" />
                <RadialGauge value={85} label="Fleet" color="#0066FF" />
                <RadialGauge value={92} label="Data Proc" color="#FFAA00" />
                <RadialGauge value={parseFloat(farmData.stats.healthRate) || 92} label="Health" color="#00AAFF" />
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Bottom Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Herd Distribution */}
          <div className="hud-panel p-5">
            <h3 className="text-sm font-semibold text-cyan-300 flex items-center gap-2 mb-3">
              <Users className="w-4 h-4" />
              HERD DISTRIBUTION
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={farmData.herds.map(h => ({ name: h.name, value: h.totalCount }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {farmData.herds.map((_: any, index: number) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0a1628', border: '1px solid rgba(0,170,255,0.2)', borderRadius: 8, fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              {farmData.herds.map((h: any, i: number) => (
                <span key={h.id} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {h.name} ({h.totalCount})
                </span>
              ))}
            </div>
          </div>

          {/* Wildlife Tracker */}
          <div className="hud-panel p-5">
            <h3 className="text-sm font-semibold text-cyan-300 flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4" />
              WILDLIFE TRACKER
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={parkData.wildlifePopulations.map(w => ({
                name: w.commonName?.split(' ').pop() || w.species,
                count: w.estimatedCount,
                census: w.lastCensusCount || 0
              }))}>
                <XAxis dataKey="name" stroke="#1e3a5f" tick={{ fill: '#3b6d8f', fontSize: 9 }} />
                <YAxis stroke="#1e3a5f" tick={{ fill: '#3b6d8f', fontSize: 9 }} />
                <Tooltip contentStyle={{ background: '#0a1628', border: '1px solid rgba(0,170,255,0.2)', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="count" fill="#00CC66" radius={[4, 4, 0, 0]} name="Estimated" />
                <Bar dataKey="census" fill="#0066FF" radius={[4, 4, 0, 0]} name="Last Census" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Environmental Status */}
          <div className="hud-panel p-5">
            <h3 className="text-sm font-semibold text-cyan-300 flex items-center gap-2 mb-3">
              <Thermometer className="w-4 h-4" />
              ENVIRONMENTAL STATUS
            </h3>
            <div className="space-y-3">
              {landData.zones.map((zone: any) => (
                <div key={zone.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">{zone.name}</span>
                    <span className={`text-[10px] font-mono ${
                      zone.degradationLevel < 30 ? 'text-emerald-400 neon-green' :
                      zone.degradationLevel < 50 ? 'text-amber-400 neon-orange' :
                      'text-red-400 neon-red'
                    }`}>
                      NDVI: {zone.surveys?.[0]?.ndvi?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-800/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${100 - zone.degradationLevel}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        zone.degradationLevel < 30 ? 'bg-emerald-500 shadow-[0_0_6px_rgba(0,204,102,0.4)]' :
                        zone.degradationLevel < 50 ? 'bg-amber-500 shadow-[0_0_6px_rgba(255,170,0,0.4)]' :
                        'bg-red-500 shadow-[0_0_6px_rgba(255,51,102,0.4)]'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-[9px] text-gray-600">
                    <span>Health: {zone.surveys?.[0]?.healthScore || 'N/A'}%</span>
                    <span>Degradation: {zone.degradationLevel}%</span>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-3 gap-2 mt-3">
                <EnvIndicator icon={Thermometer} label="Temp" value="24°C" />
                <EnvIndicator icon={CloudRain} label="Rain" value="45mm" />
                <EnvIndicator icon={Wind} label="Wind" value="12km/h" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Status Bar */}
        <div className="mt-5 py-3 border-t border-cyan-500/10 flex items-center justify-between text-[10px] font-mono text-gray-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Signal className="w-3 h-3 text-emerald-500" />
              UPLINK STABLE
            </span>
            <span>LATENCY: 42ms</span>
            <span>DATA POINTS: {(overview.animals * 24).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>KUBE INTELLIGENCE ENGINE v2.0</span>
            <span className="text-cyan-500/40">{isDbConnected ? 'SQLITE ACTIVE' : 'DEMO MODE'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-Components ─────────────────────────────────────

function SystemIndicator({ icon: Icon, label, status }: { icon: any; label: string; status: string }) {
  const isOnline = status === 'online'
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-3.5 h-3.5 ${isOnline ? 'text-cyan-500' : 'text-gray-600'}`} />
      <span className="text-[10px] font-mono tracking-wider text-gray-500">{label}</span>
      <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_4px_rgba(0,204,102,0.6)]' : 'bg-red-400'}`} />
    </div>
  )
}

function HoloStatCard({ icon: Icon, label, value, color, suffix }: {
  icon: any; label: string; value: number; color: string; suffix: string
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const duration = 1200
    const step = (end - start) / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        start = end
        clearInterval(timer)
      }
      setDisplayValue(start)
    }, 16)
    return () => clearInterval(timer)
  }, [value])

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className="hud-panel holo-shimmer p-4 glow-border cursor-default"
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-4 h-4" style={{ color, filter: `drop-shadow(0 0 4px ${color}50)` }} />
        <div className="w-8 h-[2px] rounded-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
      </div>
      <div className="text-2xl font-bold font-mono" style={{ color }}>
        {suffix === '%' ? displayValue.toFixed(1) : Math.floor(displayValue)}
        <span className="text-sm ml-0.5 opacity-60">{suffix}</span>
      </div>
      <div className="text-[10px] text-gray-500 mt-1 tracking-wide uppercase">{label}</div>
    </motion.div>
  )
}

function RadialGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-[76px] h-[76px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 76 76">
          <circle cx="38" cy="38" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <motion.circle
            cx="38" cy="38" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold font-mono" style={{ color }}>{value}%</span>
        </div>
      </div>
      <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">{label}</span>
    </div>
  )
}

function EnvIndicator({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/[0.02] border border-white/5">
      <Icon className="w-3.5 h-3.5 text-cyan-500/60" />
      <span className="text-xs font-mono font-bold text-white">{value}</span>
      <span className="text-[8px] text-gray-600 uppercase">{label}</span>
    </div>
  )
}

// ─── Module Panels ──────────────────────────────────────

function FarmPanel({ data }: { data: FarmData }) {
  return (
    <>
      <div className="hud-panel p-5 mb-4">
        <h3 className="text-sm font-semibold text-cyan-300 flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4" />
          LIVESTOCK HEALTH MATRIX
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <MiniStat label="Healthy" value={data.stats.healthyAnimals} color="#00CC66" />
          <MiniStat label="Sick" value={data.stats.sickAnimals} color="#FF3366" />
          <MiniStat label="Missing" value={data.stats.missingAnimals} color="#FFAA00" />
          <MiniStat label="Total" value={data.stats.totalAnimals} color="#00AAFF" />
        </div>
        <div className="mb-2">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-gray-500">OVERALL HEALTH</span>
            <span className="text-emerald-400 font-mono neon-green">{data.stats.healthRate}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-800/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.stats.healthRate}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
              style={{ boxShadow: '0 0 10px rgba(0,204,102,0.3)' }}
            />
          </div>
        </div>
      </div>

      <div className="hud-panel p-5">
        <h3 className="text-sm font-semibold text-cyan-300 flex items-center gap-2 mb-3">
          <Crosshair className="w-4 h-4" />
          HERD DIGITAL TWINS
        </h3>
        <div className="space-y-2 max-h-[280px] overflow-y-auto dashboard-scroll pr-1">
          {data.herds.map((herd: any) => (
            <motion.div
              key={herd.id}
              whileHover={{ x: 4 }}
              className="p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer glow-border"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold">{herd.name}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                  herd.status === 'HEALTHY' ? 'bg-emerald-500/15 text-emerald-400' :
                  herd.status === 'AT_RISK' ? 'bg-amber-500/15 text-amber-400' :
                  'bg-red-500/15 text-red-400'
                }`}>
                  {herd.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <span>{herd.animalType}</span>
                <span className="text-cyan-500/40">|</span>
                <span>{herd.totalCount} total</span>
                <span className="text-cyan-500/40">|</span>
                <span className="text-emerald-400">{herd.avgHealth}% health</span>
              </div>
              <div className="w-full h-1 rounded-full bg-gray-800/50 mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ width: `${herd.avgHealth}%`, boxShadow: '0 0 6px rgba(0,170,255,0.3)' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  )
}

function ParkPanel({ data }: { data: ParkData }) {
  return (
    <>
      <div className="hud-panel p-5 mb-4">
        <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4" />
          CONSERVATION STATUS
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <MiniStat label="Parks" value={data.stats.parks} color="#00CC66" />
          <MiniStat label="Species" value={data.stats.wildlifeSpecies} color="#0066FF" />
          <MiniStat label="Patrols" value={data.stats.activePatrols} color="#00AAFF" />
          <MiniStat label="Incidents" value={data.stats.incidentsCount} color="#FF3366" />
        </div>
      </div>

      <div className="hud-panel p-5">
        <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4" />
          WILDLIFE POPULATIONS
        </h3>
        <div className="space-y-2 max-h-[280px] overflow-y-auto dashboard-scroll pr-1">
          {data.wildlifePopulations.map((pop: any) => (
            <motion.div
              key={pop.id}
              whileHover={{ x: 4 }}
              className="p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all cursor-pointer glow-border"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">{pop.commonName}</span>
                <span className={`text-[9px] font-mono ${
                  pop.trend === 'increasing' ? 'text-emerald-400' :
                  pop.trend === 'stable' ? 'text-cyan-400' :
                  'text-red-400'
                }`}>
                  {pop.trend === 'increasing' ? '↑' : pop.trend === 'stable' ? '→' : '↓'} {pop.trend}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <span>Est: <span className="text-white font-mono">{pop.estimatedCount}</span></span>
                <span className="text-cyan-500/40">|</span>
                <span>Census: <span className="text-white font-mono">{pop.lastCensusCount}</span></span>
                <span className="text-cyan-500/40">|</span>
                <span className={pop.healthStatus === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}>
                  {pop.healthStatus}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  )
}

function LandPanel({ data }: { data: LandData }) {
  return (
    <>
      <div className="hud-panel p-5 mb-4">
        <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4" />
          LANDSCAPE INTELLIGENCE
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <MiniStat label="Zones" value={data.stats.totalZones} color="#00AAFF" />
          <MiniStat label="Healthy" value={data.stats.healthyZones} color="#00CC66" />
          <MiniStat label="Degraded" value={data.stats.degradedZones} color="#FF3366" />
          <MiniStat label="Health %" value={parseFloat(data.stats.healthRate)} color="#FFAA00" />
        </div>
      </div>

      <div className="hud-panel p-5">
        <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4" />
          LAND CHANGE DETECTION
        </h3>
        <div className="space-y-2 max-h-[280px] overflow-y-auto dashboard-scroll pr-1">
          {data.recentChanges.length > 0 ? data.recentChanges.map((change: any) => (
            <motion.div
              key={change.id}
              whileHover={{ x: 4 }}
              className="p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer glow-border"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold capitalize">{change.changeType}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                  change.severity === 'high' ? 'bg-red-500/15 text-red-400' :
                  change.severity === 'medium' ? 'bg-amber-500/15 text-amber-400' :
                  'bg-cyan-500/15 text-cyan-400'
                }`}>
                  {change.severity}
                </span>
              </div>
              <div className="text-[10px] text-gray-500">
                {change.zone?.name} - {change.zone?.region}
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-8 text-gray-600 text-xs">
              No recent land changes detected
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-center">
      <div className="text-lg font-bold font-mono" style={{ color }}>{typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}</div>
      <div className="text-[9px] text-gray-500 uppercase tracking-wider">{label}</div>
    </div>
  )
}
