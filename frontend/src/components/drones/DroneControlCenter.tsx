'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import MapGL, { Source, Layer, Marker } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plane, Radio, Battery, Calendar, Clock,
  MapPin, Pencil, Trash2, Save, Plus,
  Activity, Zap, AlertTriangle, CheckCircle,
  ArrowLeft, Eye, Target, Gauge, Wifi, Camera,
  ThermometerSun, Wind, Rocket, Building2, Send,
  Signal, Power, Sun, Wrench,
  ChevronDown, BatteryCharging, Locate, Home, Shield,
  Mountain, Leaf
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// ═══════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════

interface Drone {
  id: string
  name: string
  model: string
  status: 'active' | 'idle' | 'charging' | 'maintenance'
  battery: number
  altitude: number
  speed: number
  location: [number, number]
  lastMission: string
  flightTime: number
  coverage: number
  heading: number
  baseCampId: string
}

interface Mission {
  id: string
  name: string
  type: 'surveillance' | 'census' | 'health_scan' | 'mapping' | 'patrol' | 'crop_monitor' | 'emergency'
  schedule: 'daily' | 'weekly' | 'monthly' | 'once'
  priority: 'low' | 'normal' | 'high' | 'critical'
  area: [number, number][]
  assignedDrone: string
  status: 'scheduled' | 'in_progress' | 'completed'
  startTime: Date
  estimatedDuration: number
  altitude: number
  maxSpeed: number
  cameraMode: 'photo' | 'video' | 'thermal' | 'multispectral'
  notes: string
}

interface BaseCamp {
  id: string
  name: string
  codename: string
  location: [number, number]
  capacity: number
  chargingBays: { total: number; inUse: number }
  powerSource: 'solar' | 'grid' | 'hybrid'
  status: 'online' | 'offline' | 'low-power'
  signalStrength: number
  temperature: number
  region: string
}

interface ActiveFlight {
  missionId: string
  droneId: string
  waypoints: [number, number][]
  currentWaypointIdx: number
  segmentProgress: number
  totalProgress: number
  startedAt: number
  telemetry: {
    altitude: number
    speed: number
    battery: number
    heading: number
    distanceTraveled: number
    gpsLat: number
    gpsLng: number
  }
  trail: [number, number][]
  events: LiveEvent[]
}

interface LiveEvent {
  id: string
  timestamp: Date
  type: 'info' | 'warning' | 'alert' | 'success'
  message: string
}

// ═══════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════

const OCEAN = '#2872A1'

const MAP_STYLE = {
  version: 8 as const,
  sources: {
    'carto-dark': {
      type: 'raster' as const,
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
    },
  },
  layers: [{
    id: 'carto-dark-layer',
    type: 'raster' as const,
    source: 'carto-dark',
  }],
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
}

const MOCK_BASE_CAMPS: BaseCamp[] = [
  { id: 'BC-01', name: 'Akagera Station', codename: 'ALPHA', location: [30.47, -1.90], capacity: 4, chargingBays: { total: 6, inUse: 2 }, powerSource: 'solar', status: 'online', signalStrength: 95, temperature: 26, region: 'Eastern Province' },
  { id: 'BC-02', name: 'Nyungwe Outpost', codename: 'BRAVO', location: [29.22, -2.48], capacity: 3, chargingBays: { total: 4, inUse: 1 }, powerSource: 'hybrid', status: 'online', signalStrength: 78, temperature: 18, region: 'Southern Province' },
  { id: 'BC-03', name: 'Volcanoes Camp', codename: 'CHARLIE', location: [29.53, -1.47], capacity: 3, chargingBays: { total: 4, inUse: 0 }, powerSource: 'grid', status: 'online', signalStrength: 88, temperature: 14, region: 'Northern Province' },
  { id: 'BC-04', name: 'Kigali Central Hub', codename: 'DELTA', location: [30.06, -1.94], capacity: 6, chargingBays: { total: 8, inUse: 3 }, powerSource: 'grid', status: 'online', signalStrength: 99, temperature: 24, region: 'Kigali City' },
  { id: 'BC-05', name: 'Kayonza Field Base', codename: 'ECHO', location: [30.60, -1.88], capacity: 2, chargingBays: { total: 3, inUse: 1 }, powerSource: 'solar', status: 'low-power', signalStrength: 62, temperature: 28, region: 'Eastern Province' },
]

const MOCK_DRONES: Drone[] = [
  { id: 'KD-001', name: 'Eagle Eye Alpha', model: 'DJI M300', status: 'active', battery: 87, altitude: 120, speed: 45, location: [29.87, -1.95], lastMission: 'Akagera Patrol', flightTime: 245, coverage: 12.5, heading: 45, baseCampId: 'BC-01' },
  { id: 'KD-002', name: 'Forest Sentinel', model: 'DJI M350', status: 'active', battery: 62, altitude: 80, speed: 38, location: [29.20, -2.45], lastMission: 'Nyungwe Survey', flightTime: 189, coverage: 8.3, heading: 120, baseCampId: 'BC-02' },
  { id: 'KD-003', name: 'Gorilla Guardian', model: 'Autel EVO II', status: 'idle', battery: 100, altitude: 0, speed: 0, location: [29.53, -1.47], lastMission: 'Volcanoes Monitor', flightTime: 156, coverage: 6.7, heading: 0, baseCampId: 'BC-03' },
  { id: 'KD-004', name: 'Crop Hawk', model: 'DJI Mavic 3', status: 'charging', battery: 45, altitude: 0, speed: 0, location: [30.15, -2.12], lastMission: 'Farm Health Check', flightTime: 312, coverage: 15.8, heading: 0, baseCampId: 'BC-04' },
  { id: 'KD-005', name: 'Land Scanner', model: 'Parrot Anafi', status: 'active', battery: 73, altitude: 130, speed: 35, location: [30.60, -1.88], lastMission: 'Kayonza Mapping', flightTime: 278, coverage: 11.2, heading: 220, baseCampId: 'BC-05' },
  { id: 'KD-006', name: 'Urban Eye', model: 'DJI Phantom 4', status: 'idle', battery: 100, altitude: 0, speed: 0, location: [30.06, -1.94], lastMission: 'Kigali Survey', flightTime: 203, coverage: 9.4, heading: 0, baseCampId: 'BC-04' },
  { id: 'KD-007', name: 'Night Owl', model: 'DJI Matrice 30', status: 'maintenance', battery: 0, altitude: 0, speed: 0, location: [29.87, -1.95], lastMission: 'Maintenance', flightTime: 412, coverage: 18.9, heading: 0, baseCampId: 'BC-04' },
  { id: 'KD-008', name: 'Sky Relay', model: 'Custom Relay', status: 'active', battery: 92, altitude: 500, speed: 0, location: [29.87, -1.94], lastMission: 'Communication Hub', flightTime: 523, coverage: 25.0, heading: 90, baseCampId: 'BC-01' },
]

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  active: { color: '#00DD66', bg: 'bg-green-500/20', label: 'ACTIVE', icon: Activity },
  idle: { color: '#00AAFF', bg: 'bg-blue-500/20', label: 'STANDBY', icon: Clock },
  charging: { color: '#FFAA00', bg: 'bg-yellow-500/20', label: 'CHARGING', icon: Zap },
  maintenance: { color: '#FF3366', bg: 'bg-red-500/20', label: 'MAINT', icon: AlertTriangle },
}

const CAMP_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  'online': { color: '#00DD66', label: 'ONLINE' },
  'offline': { color: '#FF3366', label: 'OFFLINE' },
  'low-power': { color: '#FFAA00', label: 'LOW POWER' },
}

const MISSION_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; desc: string }> = {
  surveillance: { label: 'Surveillance', icon: Eye, color: '#00AAFF', desc: 'Area monitoring & observation' },
  census: { label: 'Wildlife Census', icon: Target, color: '#00DD66', desc: 'Population count & species ID' },
  health_scan: { label: 'Health Scan', icon: Activity, color: '#FF6688', desc: 'Livestock & crop assessment' },
  mapping: { label: 'Terrain Mapping', icon: Mountain, color: '#AA88FF', desc: '3D terrain & topography' },
  patrol: { label: 'Anti-Poaching', icon: Shield, color: '#FF8844', desc: 'Perimeter security patrol' },
  crop_monitor: { label: 'Crop Monitor', icon: Leaf, color: '#88CC00', desc: 'NDVI & irrigation analysis' },
  emergency: { label: 'Emergency', icon: AlertTriangle, color: '#FF3366', desc: 'Urgent rapid deployment' },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'LOW', color: '#6B7280' },
  normal: { label: 'NORMAL', color: '#00AAFF' },
  high: { label: 'HIGH', color: '#FFAA00' },
  critical: { label: 'CRITICAL', color: '#FF3366' },
}

const CAMERA_MODE_CONFIG: Record<string, { label: string; desc: string; color: string }> = {
  photo: { label: 'Photo', desc: 'High-res stills', color: '#00AAFF' },
  video: { label: 'Video', desc: '4K recording', color: '#00DD66' },
  thermal: { label: 'Thermal', desc: 'Heat signatures', color: '#FF8844' },
  multispectral: { label: 'Multi-Spec', desc: 'NDVI bands', color: '#AA88FF' },
}

const MISSION_EVENTS = [
  'Waypoint reached - adjusting heading',
  'Thermal anomaly detected in scan zone',
  'Wildlife movement spotted - recording',
  'High-res capture complete for sector',
  'Wind speed elevated - stabilizing',
  'Terrain mapping data uploaded',
  'Anti-poaching sensor triggered',
  'Vegetation health index calculated',
  'Altitude adjusted for terrain clearance',
  'Communication relay signal strong',
]

// ═══════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function calcHeading(from: [number, number], to: [number, number]): number {
  const angle = Math.atan2(to[0] - from[0], to[1] - from[1]) * (180 / Math.PI)
  return (angle + 360) % 360
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'T-00:00'
  const totalSec = Math.floor(ms / 1000)
  return `T-${String(Math.floor(totalSec / 60)).padStart(2, '0')}:${String(totalSec % 60).padStart(2, '0')}`
}

// ═══════════════════════════════════════════════
// GLASS PANEL - Reusable glassmorphism wrapper
// ═══════════════════════════════════════════════

function GlassPanel({ children, className = '', glow = false, ...props }: { children: React.ReactNode; className?: string; glow?: boolean; [key: string]: any }) {
  return (
    <div className={`relative bg-[#0B1A2E]/70 backdrop-blur-xl border border-[#2872A1]/20 rounded-xl overflow-hidden ${glow ? 'shadow-[0_0_30px_rgba(40,114,161,0.12)]' : ''} ${className}`} {...props}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════

function RadarWidget({ size = 110 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {[0.33, 0.66, 1].map((s, i) => (
        <div key={i} className="absolute rounded-full border border-[#2872A1]/25"
          style={{ width: size * s, height: size * s, top: (size - size * s) / 2, left: (size - size * s) / 2 }}
        />
      ))}
      <div className="absolute top-1/2 left-0 w-full h-px bg-[#2872A1]/15" />
      <div className="absolute left-1/2 top-0 w-px h-full bg-[#2872A1]/15" />
      <div className="absolute inset-0 animate-radar-sweep" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(40,114,161,0.35) 0deg, transparent 60deg)', borderRadius: '50%' }} />
      <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-glow-pulse" style={{ backgroundColor: OCEAN }} />
      <div className="absolute w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{ top: '30%', left: '55%' }} />
      <div className="absolute w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{ top: '60%', left: '35%' }} />
      <div className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-pulse" style={{ top: '45%', left: '70%' }} />
    </div>
  )
}

function CameraFeed({ drone, flight }: { drone: Drone | null; flight: ActiveFlight | null }) {
  const [detections, setDetections] = useState<{ x: number; y: number; label: string }[]>([])

  useEffect(() => {
    if (!flight) return
    const iv = setInterval(() => {
      if (Math.random() > 0.7) {
        setDetections([{ x: 15 + Math.random() * 70, y: 15 + Math.random() * 70, label: ['Animal', 'Vehicle', 'Structure', 'Anomaly'][Math.floor(Math.random() * 4)] }])
        setTimeout(() => setDetections([]), 2000)
      }
    }, 3000)
    return () => clearInterval(iv)
  }, [flight])

  if (!flight || !drone) {
    return (
      <div className="h-full flex items-center justify-center bg-[#020408] rounded-xl border border-[#2872A1]/15">
        <div className="text-center">
          <Camera className="w-14 h-14 mx-auto mb-3" style={{ color: `${OCEAN}30` }} />
          <p className="text-sm font-mono" style={{ color: `${OCEAN}60` }}>NO ACTIVE FEED</p>
          <p className="text-xs font-mono mt-1" style={{ color: `${OCEAN}30` }}>Launch a mission to view live feed</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full bg-[#020408] rounded-xl border border-[#2872A1]/30 overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0a1a0a 0%, #0d200d 30%, #112211 60%, #0a150a 100%)', filter: 'brightness(0.8)' }} />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(0,255,100,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,100,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400/40 to-transparent animate-scan-line" />
      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24">
        <div className="absolute top-0 left-1/2 -translate-x-px w-0.5 h-7 bg-[#2872A1]/50" />
        <div className="absolute bottom-0 left-1/2 -translate-x-px w-0.5 h-7 bg-[#2872A1]/50" />
        <div className="absolute left-0 top-1/2 -translate-y-px w-7 h-0.5 bg-[#2872A1]/50" />
        <div className="absolute right-0 top-1/2 -translate-y-px w-7 h-0.5 bg-[#2872A1]/50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border rounded-full" style={{ borderColor: `${OCEAN}60` }} />
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l" style={{ borderColor: `${OCEAN}40` }} />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r" style={{ borderColor: `${OCEAN}40` }} />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l" style={{ borderColor: `${OCEAN}40` }} />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r" style={{ borderColor: `${OCEAN}40` }} />
      </div>
      {detections.map((d, i) => (
        <motion.div key={i} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          className="absolute border-2 border-red-400 rounded" style={{ left: `${d.x}%`, top: `${d.y}%`, width: 60, height: 45 }}>
          <span className="absolute -top-5 left-0 text-[9px] text-red-400 font-mono bg-black/60 px-1">{d.label}</span>
        </motion.div>
      ))}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-xs text-red-400 font-mono font-bold">REC</span>
        <span className="text-[10px] text-white/30 font-mono ml-2">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
      </div>
      <div className="absolute top-3 right-3 text-[10px] font-mono" style={{ color: `${OCEAN}CC` }}>{drone.id} / {drone.name}</div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm px-4 py-2.5 flex items-center justify-between text-[10px] font-mono border-t border-white/5">
        <span className="text-green-400">ALT {flight.telemetry.altitude.toFixed(0)}m</span>
        <span style={{ color: OCEAN }}>SPD {flight.telemetry.speed.toFixed(1)} km/h</span>
        <span className="text-yellow-400">BAT {flight.telemetry.battery.toFixed(0)}%</span>
        <span className="text-purple-400">HDG {flight.telemetry.heading.toFixed(0)}&deg;</span>
        <span className="text-white/40">{flight.telemetry.gpsLat.toFixed(4)}, {flight.telemetry.gpsLng.toFixed(4)}</span>
      </div>
    </div>
  )
}

function TelemetryGauge({ label, value, max, unit, color }: { label: string; value: number; max: number; unit: string; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <GlassPanel className="p-3">
      <p className="text-[10px] font-mono mb-1" style={{ color: `${OCEAN}80` }}>{label}</p>
      <div className="flex items-end gap-1">
        <span className="text-lg font-bold font-mono" style={{ color }}>{value.toFixed(0)}</span>
        <span className="text-xs font-mono mb-0.5" style={{ color: `${OCEAN}50` }}>{unit}</span>
      </div>
      <div className="mt-2 w-full h-1.5 bg-[#0A1628] rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
      </div>
    </GlassPanel>
  )
}

function StatusDot({ status }: { status: string }) {
  const c = STATUS_CONFIG[status]
  return (
    <div className="relative">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c?.color || '#666' }} />
      {status === 'active' && <div className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ backgroundColor: c?.color }} />}
    </div>
  )
}

// ═══════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════

export default function DroneControlCenter() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'planner' | 'fleet' | 'live' | 'basecamps'>('planner')
  const [drones, setDrones] = useState<Drone[]>(MOCK_DRONES)
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null)
  const [drawMode, setDrawMode] = useState<'view' | 'polygon'>('view')
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [showMissionForm, setShowMissionForm] = useState(false)
  const [activeFlights, setActiveFlights] = useState<globalThis.Map<string, ActiveFlight>>(new globalThis.Map())
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([])
  const [watchingDrone, setWatchingDrone] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const [selectedCamp, setSelectedCamp] = useState<string | null>(null)
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null)

  const [missionForm, setMissionForm] = useState({
    name: '', type: 'surveillance' as Mission['type'], schedule: 'once' as Mission['schedule'],
    priority: 'normal' as Mission['priority'], assignedDrone: '', startTime: '',
    estimatedDuration: 60, altitude: 120, maxSpeed: 45,
    cameraMode: 'photo' as Mission['cameraMode'], notes: '',
  })

  // ── CLOCK ──
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [])

  // ── FLIGHT SIMULATION ENGINE ──
  useEffect(() => {
    const simInterval = setInterval(() => {
      setMissions(prev => prev.map(m => {
        if (m.status === 'scheduled' && m.startTime.getTime() <= Date.now()) {
          launchMission(m)
          return { ...m, status: 'in_progress' as const }
        }
        return m
      }))

      setActiveFlights(prev => {
        const updated = new globalThis.Map(prev)
        let changed = false
        updated.forEach((flight, missionId) => {
          const wps = flight.waypoints
          if (wps.length < 2) return
          const newProgress = flight.segmentProgress + 0.008
          if (newProgress >= 1) {
            const nextIdx = flight.currentWaypointIdx + 1
            if (nextIdx >= wps.length - 1) {
              completeMission(missionId, flight.droneId)
              updated.delete(missionId)
              changed = true
              return
            }
            flight.currentWaypointIdx = nextIdx
            flight.segmentProgress = 0
          } else {
            flight.segmentProgress = newProgress
          }
          const from = wps[flight.currentWaypointIdx]
          const to = wps[flight.currentWaypointIdx + 1]
          const lng = lerp(from[0], to[0], flight.segmentProgress)
          const lat = lerp(from[1], to[1], flight.segmentProgress)
          const heading = calcHeading(from, to)
          const baseAlt = 100 + Math.sin(Date.now() / 5000) * 15
          const baseSpd = 35 + Math.sin(Date.now() / 3000) * 8
          flight.telemetry = {
            altitude: baseAlt, speed: baseSpd,
            battery: Math.max(flight.telemetry.battery - 0.015, 5),
            heading, distanceTraveled: flight.telemetry.distanceTraveled + baseSpd * 0.0001,
            gpsLat: lat, gpsLng: lng,
          }
          flight.trail = [...flight.trail.slice(-60), [lng, lat] as [number, number]]
          flight.totalProgress = ((flight.currentWaypointIdx + flight.segmentProgress) / (wps.length - 1)) * 100
          setDrones(d => d.map(dr => dr.id === flight.droneId ? {
            ...dr, location: [lng, lat] as [number, number], altitude: flight.telemetry.altitude,
            speed: flight.telemetry.speed, battery: flight.telemetry.battery, heading, status: 'active' as const
          } : dr))
          if (Math.random() > 0.97) {
            const msg = MISSION_EVENTS[Math.floor(Math.random() * MISSION_EVENTS.length)]
            const evt: LiveEvent = { id: `evt-${Date.now()}-${Math.random()}`, timestamp: new Date(),
              type: Math.random() > 0.8 ? 'warning' : Math.random() > 0.5 ? 'success' : 'info',
              message: `[${flight.droneId}] ${msg}` }
            flight.events = [...flight.events.slice(-20), evt]
            setLiveEvents(prev => [...prev.slice(-30), evt])
          }
          changed = true
        })
        return changed ? updated : prev
      })
    }, 100)
    return () => clearInterval(simInterval)
  }, [])

  const launchMission = useCallback((mission: Mission) => {
    if (!mission.assignedDrone || mission.area.length < 2) return
    const drone = drones.find(d => d.id === mission.assignedDrone)
    if (!drone) return
    const waypoints: [number, number][] = [drone.location, ...mission.area, mission.area[0], drone.location]
    const newFlight: ActiveFlight = {
      missionId: mission.id, droneId: mission.assignedDrone, waypoints,
      currentWaypointIdx: 0, segmentProgress: 0, totalProgress: 0, startedAt: Date.now(),
      telemetry: { altitude: 0, speed: 0, battery: drone.battery, heading: 0, distanceTraveled: 0, gpsLat: drone.location[1], gpsLng: drone.location[0] },
      trail: [drone.location],
      events: [{ id: `evt-launch-${Date.now()}`, timestamp: new Date(), type: 'success', message: `[${mission.assignedDrone}] Mission "${mission.name}" launched` }]
    }
    setActiveFlights(prev => new globalThis.Map(prev).set(mission.id, newFlight))
    setWatchingDrone(mission.assignedDrone)
    setLiveEvents(prev => [...prev, newFlight.events[0]])
    setActiveTab('live')
  }, [drones])

  const completeMission = useCallback((missionId: string, droneId: string) => {
    setMissions(prev => prev.map(m => m.id === missionId ? { ...m, status: 'completed' as const } : m))
    setDrones(prev => prev.map(d => d.id === droneId ? { ...d, status: 'idle' as const, speed: 0, altitude: 0 } : d))
    setLiveEvents(prev => [...prev.slice(-30), { id: `evt-complete-${Date.now()}`, timestamp: new Date(), type: 'success' as const, message: `[${droneId}] Mission complete - RTB` }])
  }, [])

  const handleLaunchNow = useCallback((mission: Mission) => {
    const updated = { ...mission, startTime: new Date(Date.now() - 1000), status: 'in_progress' as const }
    setMissions(prev => prev.map(m => m.id === mission.id ? updated : m))
    launchMission(updated)
  }, [launchMission])

  const handleRecallDrone = useCallback((droneId: string) => {
    // Find active flight for this drone and complete it
    activeFlights.forEach((flight, missionId) => {
      if (flight.droneId === droneId) {
        completeMission(missionId, droneId)
        setActiveFlights(prev => { const n = new globalThis.Map(prev); n.delete(missionId); return n })
      }
    })
    setLiveEvents(prev => [...prev.slice(-30), { id: `evt-recall-${Date.now()}`, timestamp: new Date(), type: 'warning' as const, message: `[${droneId}] RECALL issued - drone returning to base` }])
  }, [activeFlights, completeMission])

  const handleQuickLaunch = useCallback((droneId: string) => {
    const drone = drones.find(d => d.id === droneId)
    if (!drone || drone.status === 'maintenance' || drone.battery < 20) return
    const camp = MOCK_BASE_CAMPS.find(c => c.id === drone.baseCampId)
    if (!camp) return
    // Create a quick patrol mission around the base camp
    const offset = 0.05
    const area: [number, number][] = [
      [camp.location[0] - offset, camp.location[1] - offset],
      [camp.location[0] + offset, camp.location[1] - offset],
      [camp.location[0] + offset, camp.location[1] + offset],
      [camp.location[0] - offset, camp.location[1] + offset],
    ]
    const quickMission: Mission = {
      id: `QM-${Date.now()}`, name: `Quick Patrol - ${camp.codename}`,
      type: 'patrol', schedule: 'once', priority: 'normal', area, assignedDrone: droneId,
      status: 'in_progress', startTime: new Date(), estimatedDuration: 30,
      altitude: 120, maxSpeed: 45, cameraMode: 'video', notes: 'Auto-generated quick patrol',
    }
    setMissions(prev => [...prev, quickMission])
    launchMission(quickMission)
  }, [drones, launchMission])

  // ── MAP HANDLERS ──
  const handleMapClick = (e: any) => {
    if (drawMode !== 'view') {
      setDrawingPoints([...drawingPoints, [e.lngLat.lng, e.lngLat.lat]])
    }
  }

  const saveDrawnArea = () => {
    if (drawingPoints.length < 3) return
    setDrawMode('view')
    setShowMissionForm(true)
  }

  const createMission = (launchNow = false) => {
    if (!missionForm.name || !missionForm.assignedDrone) return
    if (!launchNow && !missionForm.startTime) return
    let area = drawingPoints
    if (area.length < 3) {
      const drone = drones.find(d => d.id === missionForm.assignedDrone)
      const camp = drone ? MOCK_BASE_CAMPS.find(c => c.id === drone.baseCampId) : null
      if (camp) {
        const off = 0.05
        area = [
          [camp.location[0] - off, camp.location[1] - off],
          [camp.location[0] + off, camp.location[1] - off],
          [camp.location[0] + off, camp.location[1] + off],
          [camp.location[0] - off, camp.location[1] + off],
        ]
      } else return
    }
    const newMission: Mission = {
      id: `M-${Date.now()}`, name: missionForm.name, type: missionForm.type,
      schedule: missionForm.schedule, priority: missionForm.priority, area,
      assignedDrone: missionForm.assignedDrone,
      status: launchNow ? 'in_progress' : 'scheduled',
      startTime: launchNow ? new Date() : new Date(missionForm.startTime),
      estimatedDuration: missionForm.estimatedDuration,
      altitude: missionForm.altitude, maxSpeed: missionForm.maxSpeed,
      cameraMode: missionForm.cameraMode, notes: missionForm.notes,
    }
    setMissions(prev => [...prev, newMission])
    setShowMissionForm(false)
    setDrawingPoints([])
    setMissionForm({ name: '', type: 'surveillance', schedule: 'once', priority: 'normal',
      assignedDrone: '', startTime: '', estimatedDuration: 60, altitude: 120,
      maxSpeed: 45, cameraMode: 'photo', notes: '' })
    if (launchNow) launchMission(newMission)
  }

  // ── STATS ──
  const stats = useMemo(() => ({
    total: drones.length,
    active: drones.filter(d => d.status === 'active').length,
    avgBattery: Math.round(drones.reduce((s, d) => s + d.battery, 0) / drones.length),
    totalCoverage: drones.reduce((s, d) => s + d.coverage, 0).toFixed(1),
    campsOnline: MOCK_BASE_CAMPS.filter(c => c.status === 'online').length,
  }), [drones])

  const watchedFlight = watchingDrone ? Array.from(activeFlights.values()).find(f => f.droneId === watchingDrone) || null : null
  const watchedDrone = watchingDrone ? drones.find(d => d.id === watchingDrone) || null : null

  // ═══════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════

  return (
    <div className="fixed inset-0 bg-[#040810] overflow-hidden">
      {/* Top edge glow */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${OCEAN}60, transparent)` }} />

      {/* ── HEADER ── */}
      <div className="h-14 bg-[#0A1628]/90 backdrop-blur-xl border-b flex items-center justify-between px-5" style={{ borderColor: `${OCEAN}20` }}>
        <div className="flex items-center gap-4">
          <motion.button onClick={() => router.push('/dashboard')} whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5" style={{ borderColor: `${OCEAN}30` }}>
            <ArrowLeft className="w-4 h-4" style={{ color: OCEAN }} />
            <span className="text-xs font-mono" style={{ color: `${OCEAN}CC` }}>BACK</span>
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${OCEAN}15`, border: `1px solid ${OCEAN}30` }}>
              <Plane className="w-5 h-5" style={{ color: OCEAN }} />
              {activeFlights.size > 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse ring-2 ring-[#040810]" />}
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wider font-mono">DRONE COMMAND CENTER</h1>
              <p className="text-[10px] font-mono" style={{ color: `${OCEAN}60` }}>Mission Planning &middot; Fleet Management &middot; Base Camps</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 text-xs font-mono">
          {[
            { icon: Activity, value: `${stats.active} ACTIVE`, color: '#00DD66', pulse: true },
            { icon: Battery, value: `${stats.avgBattery}%`, color: OCEAN },
            { icon: Target, value: `${stats.totalCoverage} km\u00B2`, color: '#AA88FF' },
            { icon: Building2, value: `${stats.campsOnline} CAMPS`, color: OCEAN },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="flex items-center gap-2">
                {s.pulse ? <StatusDot status="active" /> : <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />}
                <span style={{ color: s.color }}>{s.value}</span>
              </div>
            )
          })}
          {activeFlights.size > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/30">
              <Rocket className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-300">{activeFlights.size} IN-FLIGHT</span>
            </motion.div>
          )}
          <div style={{ color: `${OCEAN}50` }}>{new Date(now).toLocaleTimeString('en-US', { hour12: false })}</div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="h-11 bg-[#0A1628]/60 backdrop-blur-sm border-b flex items-center px-5 gap-2" style={{ borderColor: `${OCEAN}15` }}>
        {([
          { id: 'planner' as const, label: 'Mission Planner', icon: MapPin },
          { id: 'fleet' as const, label: 'Fleet Management', icon: Radio },
          { id: 'live' as const, label: 'Live Operations', icon: Eye, alert: activeFlights.size > 0 },
          { id: 'basecamps' as const, label: 'Base Camps', icon: Building2 },
        ]).map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              className={`relative flex items-center gap-2 px-4 py-1.5 rounded-lg font-mono text-xs transition-all ${isActive ? 'text-white' : 'hover:bg-white/5'}`}
              style={{
                background: isActive ? `${OCEAN}20` : 'transparent',
                border: `1px solid ${isActive ? `${OCEAN}50` : `${OCEAN}15`}`,
                color: isActive ? undefined : `${OCEAN}99`,
              }}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.alert && <span className="ml-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
              {isActive && <motion.div layoutId="tab-glow" className="absolute -bottom-px left-2 right-2 h-0.5 rounded-full" style={{ backgroundColor: OCEAN }} />}
            </motion.button>
          )
        })}
      </div>

      {/* ── CONTENT ── */}
      <div className="h-[calc(100vh-100px)]">

        {/* ════════════════════ MISSION PLANNER ════════════════════ */}
        {activeTab === 'planner' && (
          <div className="h-full flex">
            <div className="flex-1 relative">
              <MapGL initialViewState={{ longitude: 29.8739, latitude: -1.9403, zoom: 8 }}
                style={{ width: '100%', height: '100%' }} mapStyle={MAP_STYLE} onClick={handleMapClick}>
                {drawingPoints.length > 0 && (
                  <Source id="drawn-area" type="geojson" data={{
                    type: 'FeatureCollection', features: [{ type: 'Feature', properties: {},
                      geometry: { type: drawingPoints.length > 2 ? 'Polygon' : 'LineString',
                        coordinates: drawingPoints.length > 2 ? [[...drawingPoints, drawingPoints[0]]] : drawingPoints } }]
                  }}>
                    <Layer id="drawn-fill" type="fill" paint={{ 'fill-color': OCEAN, 'fill-opacity': 0.12 }} />
                    <Layer id="drawn-line" type="line" paint={{ 'line-color': OCEAN, 'line-width': 2, 'line-dasharray': [3, 2] }} />
                  </Source>
                )}
                {Array.from(activeFlights.values()).map(flight => (
                  flight.trail.length > 1 && (
                    <Source key={`trail-${flight.missionId}`} id={`trail-${flight.missionId}`} type="geojson" data={{
                      type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: flight.trail }
                    }}>
                      <Layer id={`trail-line-${flight.missionId}`} type="line" paint={{ 'line-color': '#00FF88', 'line-width': 2, 'line-opacity': 0.6 }} />
                    </Source>
                  )
                ))}
                {missions.filter(m => m.area.length > 2).map(m => (
                  <Source key={`area-${m.id}`} id={`area-${m.id}`} type="geojson" data={{
                    type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[...m.area, m.area[0]]] }
                  }}>
                    <Layer id={`area-fill-${m.id}`} type="fill" paint={{
                      'fill-color': m.status === 'in_progress' ? '#00FF88' : m.status === 'completed' ? '#888' : '#FFAA00', 'fill-opacity': 0.08 }} />
                    <Layer id={`area-line-${m.id}`} type="line" paint={{
                      'line-color': m.status === 'in_progress' ? '#00FF88' : m.status === 'completed' ? '#888' : '#FFAA00', 'line-width': 1.5, 'line-opacity': 0.5 }} />
                  </Source>
                ))}

                {/* Base Camp Markers on Map */}
                {MOCK_BASE_CAMPS.map(camp => (
                  <Marker key={camp.id} longitude={camp.location[0]} latitude={camp.location[1]}>
                    <div className="relative group cursor-pointer">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center border" style={{
                        background: `${OCEAN}25`, borderColor: `${OCEAN}50`
                      }}>
                        <Building2 className="w-3.5 h-3.5" style={{ color: OCEAN }} />
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#0D1B2E]/95 border rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10" style={{ borderColor: `${OCEAN}30` }}>
                        <p className="text-[10px] text-white font-mono font-bold">{camp.codename} - {camp.name}</p>
                        <p className="text-[9px] font-mono" style={{ color: CAMP_STATUS_CONFIG[camp.status].color }}>{CAMP_STATUS_CONFIG[camp.status].label}</p>
                      </div>
                    </div>
                  </Marker>
                ))}

                {/* Drone Markers */}
                {drones.map(drone => {
                  const sc = STATUS_CONFIG[drone.status]
                  const isFlying = Array.from(activeFlights.values()).some(f => f.droneId === drone.id)
                  return (
                    <Marker key={drone.id} longitude={drone.location[0]} latitude={drone.location[1]}>
                      <button onClick={() => setSelectedDrone(drone.id)} className="relative group">
                        {isFlying && <div className="absolute -inset-3 border-2 border-green-400/30 rounded-full animate-pulse-ring" />}
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform ${isFlying ? 'scale-110' : ''}`}
                          style={{ backgroundColor: `${sc.color}20`, borderColor: sc.color, transform: isFlying ? `rotate(${drone.heading}deg)` : undefined }}>
                          <Plane className="w-4 h-4" style={{ color: sc.color }} />
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#0D1B2E]/95 border rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10" style={{ borderColor: `${OCEAN}30` }}>
                          <p className="text-[10px] text-white font-mono font-bold">{drone.id} - {drone.name}</p>
                          <p className="text-[9px] font-mono" style={{ color: `${OCEAN}CC` }}>{drone.battery.toFixed(0)}% &bull; {drone.altitude.toFixed(0)}m &bull; {drone.speed.toFixed(0)}km/h</p>
                        </div>
                      </button>
                    </Marker>
                  )
                })}
              </MapGL>

              {/* Drawing Tools */}
              <GlassPanel className="absolute top-4 left-4 p-3">
                <p className="text-[10px] font-mono font-bold mb-2 uppercase tracking-wider" style={{ color: OCEAN }}>Draw Mission Area</p>
                <div className="flex flex-col gap-2">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setDrawMode('polygon'); setDrawingPoints([]) }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${
                      drawMode === 'polygon' ? 'text-white' : ''
                    }`} style={{ background: drawMode === 'polygon' ? `${OCEAN}25` : '#0D1B2E80', border: `1px solid ${drawMode === 'polygon' ? `${OCEAN}50` : `${OCEAN}20`}`, color: drawMode === 'polygon' ? undefined : `${OCEAN}99` }}>
                    <Pencil className="w-3.5 h-3.5" />Polygon
                  </motion.button>
                  {drawingPoints.length > 0 && (
                    <>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={saveDrawnArea}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/15 border border-green-500/40 text-green-300 font-mono text-xs">
                        <Save className="w-3.5 h-3.5" />Save ({drawingPoints.length} pts)
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setDrawingPoints([]); setDrawMode('view') }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 font-mono text-xs">
                        <Trash2 className="w-3.5 h-3.5" />Clear
                      </motion.button>
                    </>
                  )}
                </div>
              </GlassPanel>

              <GlassPanel className="absolute bottom-4 left-4 p-2">
                <RadarWidget size={100} />
              </GlassPanel>
            </div>

            {/* Mission Panel */}
            <div className="w-96 bg-[#0A1628]/80 backdrop-blur-sm border-l flex flex-col" style={{ borderColor: `${OCEAN}15` }}>
              <div className="p-4 border-b" style={{ borderColor: `${OCEAN}15` }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold font-mono flex items-center gap-2" style={{ color: OCEAN }}>
                    <Calendar className="w-4 h-4" />MISSION QUEUE
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md" style={{ backgroundColor: `${OCEAN}15`, color: `${OCEAN}99` }}>
                    {missions.filter(m => m.status === 'scheduled').length} pending
                  </span>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowMissionForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-mono text-xs font-bold transition-all hover:brightness-110"
                  style={{ background: `linear-gradient(135deg, ${OCEAN}30, ${OCEAN}15)`, border: `1px solid ${OCEAN}50`, color: OCEAN }}>
                  <Plus className="w-4 h-4" />SCHEDULE NEW MISSION
                </motion.button>
              </div>
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {missions.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-10 h-10 mx-auto mb-3" style={{ color: `${OCEAN}20` }} />
                    <p className="text-sm font-mono" style={{ color: `${OCEAN}40` }}>No missions scheduled</p>
                    <p className="text-xs font-mono mt-1" style={{ color: `${OCEAN}25` }}>Draw a patrol area on the map</p>
                  </div>
                ) : (
                  missions.map(mission => {
                    const timeUntil = mission.startTime.getTime() - now
                    const isActive = mission.status === 'in_progress'
                    const flight = Array.from(activeFlights.values()).find(f => f.missionId === mission.id)
                    const mtc = MISSION_TYPE_CONFIG[mission.type]
                    const MTypeIcon = mtc?.icon || MapPin
                    const pc = PRIORITY_CONFIG[mission.priority] || PRIORITY_CONFIG.normal
                    const assignedDrone = drones.find(d => d.id === mission.assignedDrone)
                    return (
                      <motion.div key={mission.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <GlassPanel glow={isActive} className={`p-3 ${isActive ? '!border-green-500/40' : ''}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${mtc?.color || OCEAN}15` }}>
                                <MTypeIcon className="w-3.5 h-3.5" style={{ color: mtc?.color || OCEAN }} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white font-mono">{mission.name}</p>
                                <p className="text-[9px] font-mono" style={{ color: mtc?.color || `${OCEAN}80` }}>{mtc?.label || mission.type}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold ${
                                mission.status === 'scheduled' ? 'bg-yellow-500/15 text-yellow-300' :
                                mission.status === 'in_progress' ? 'bg-green-500/15 text-green-300' :
                                'bg-white/5 text-white/40'
                              }`}>{mission.status === 'in_progress' ? 'FLYING' : mission.status.toUpperCase()}</span>
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold" style={{ backgroundColor: `${pc.color}15`, color: pc.color }}>{pc.label}</span>
                            </div>
                          </div>
                          <div className="space-y-1 text-[10px] font-mono">
                            <div className="flex justify-between"><span style={{ color: `${OCEAN}50` }}>Drone</span><span className="text-white/70">{assignedDrone ? `${mission.assignedDrone} · ${assignedDrone.model}` : mission.assignedDrone}</span></div>
                            <div className="flex justify-between"><span style={{ color: `${OCEAN}50` }}>Schedule</span><span className="text-white/70">{mission.schedule} · {mission.estimatedDuration}min</span></div>
                            <div className="flex justify-between"><span style={{ color: `${OCEAN}50` }}>Flight</span><span className="text-white/70">{mission.altitude}m ALT · {mission.maxSpeed}km/h</span></div>
                            <div className="flex justify-between"><span style={{ color: `${OCEAN}50` }}>Camera</span><span style={{ color: CAMERA_MODE_CONFIG[mission.cameraMode]?.color || OCEAN }}>{CAMERA_MODE_CONFIG[mission.cameraMode]?.label || mission.cameraMode}</span></div>
                          </div>
                          {mission.status === 'scheduled' && timeUntil > 0 && (
                            <div className="mt-3 flex items-center justify-between rounded-lg px-3 py-2 border border-yellow-500/20 bg-yellow-500/5">
                              <span className="text-[10px] text-yellow-400/70 font-mono">LAUNCH IN</span>
                              <span className="text-sm font-bold text-yellow-300 font-mono animate-pulse">{formatCountdown(timeUntil)}</span>
                            </div>
                          )}
                          {mission.status === 'scheduled' && (
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleLaunchNow(mission)}
                              className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-300 font-mono text-xs hover:bg-green-500/15 transition-all">
                              <Rocket className="w-3.5 h-3.5" />LAUNCH NOW
                            </motion.button>
                          )}
                          {isActive && flight && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                                <span className="text-green-400/70">PROGRESS</span>
                                <span className="text-green-300 font-bold">{flight.totalProgress.toFixed(0)}%</span>
                              </div>
                              <div className="w-full h-2 bg-[#0A1628] rounded-full overflow-hidden border border-green-500/20">
                                <motion.div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" animate={{ width: `${flight.totalProgress}%` }} />
                              </div>
                              <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setWatchingDrone(flight.droneId); setActiveTab('live') }}
                                className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg font-mono text-[11px] transition-all" style={{ background: `${OCEAN}15`, border: `1px solid ${OCEAN}30`, color: OCEAN }}>
                                <Eye className="w-3 h-3" />WATCH LIVE
                              </motion.button>
                            </div>
                          )}
                          {mission.status === 'completed' && (
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-white/40 font-mono">
                              <CheckCircle className="w-3 h-3" />Completed successfully
                            </div>
                          )}
                        </GlassPanel>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ FLEET MANAGEMENT ════════════════════ */}
        {activeTab === 'fleet' && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-[1400px] mx-auto">
              <div className="grid grid-cols-5 gap-3 mb-6">
                {[
                  { label: 'Total Fleet', value: stats.total, icon: Plane, color: OCEAN },
                  { label: 'Active', value: stats.active, icon: Activity, color: '#00DD66' },
                  { label: 'Standby', value: drones.filter(d => d.status === 'idle').length, icon: Clock, color: '#00AAFF' },
                  { label: 'Charging', value: drones.filter(d => d.status === 'charging').length, icon: Zap, color: '#FFAA00' },
                  { label: 'Maintenance', value: drones.filter(d => d.status === 'maintenance').length, icon: AlertTriangle, color: '#FF3366' },
                ].map((s, i) => {
                  const Icon = s.icon
                  return (
                    <GlassPanel key={i} className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}12` }}>
                        <Icon className="w-5 h-5" style={{ color: s.color }} />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white font-mono">{s.value}</p>
                        <p className="text-[10px] font-mono" style={{ color: `${OCEAN}50` }}>{s.label}</p>
                      </div>
                    </GlassPanel>
                  )
                })}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {drones.map((drone, idx) => {
                  const sc = STATUS_CONFIG[drone.status]
                  const StatusIcon = sc.icon
                  const isFlying = Array.from(activeFlights.values()).some(f => f.droneId === drone.id)
                  const camp = MOCK_BASE_CAMPS.find(c => c.id === drone.baseCampId)
                  return (
                    <motion.div key={drone.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                      <GlassPanel glow={isFlying} className={`p-4 group hover:!border-[${OCEAN}]/40 transition-all ${isFlying ? '!border-green-500/30' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg border flex items-center justify-center" style={{ backgroundColor: `${sc.color}15`, borderColor: `${sc.color}40` }}>
                            <StatusIcon className="w-5 h-5" style={{ color: sc.color }} />
                          </div>
                          <div className="flex items-center gap-2">
                            {isFlying && <Wifi className="w-3 h-3 text-green-400 animate-pulse" />}
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold" style={{ backgroundColor: `${sc.color}15`, color: sc.color }}>
                              {isFlying ? 'FLYING' : sc.label}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-bold text-white text-sm mb-0.5">{drone.id}</h3>
                        <p className="text-xs font-mono mb-0.5" style={{ color: `${OCEAN}99` }}>{drone.name}</p>
                        <p className="text-[10px] font-mono mb-3" style={{ color: `${OCEAN}40` }}>{drone.model} &middot; {camp?.codename || 'Unassigned'}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono" style={{ color: `${OCEAN}70` }}>Battery</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-[#0A1628] rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${drone.battery}%`, backgroundColor: drone.battery > 60 ? '#00DD66' : drone.battery > 30 ? '#FFAA00' : '#FF3366' }} />
                              </div>
                              <span className="font-mono font-bold w-8 text-white/80">{drone.battery.toFixed(0)}%</span>
                            </div>
                          </div>
                          {(drone.status === 'active' || isFlying) && (
                            <>
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span style={{ color: `${OCEAN}70` }}>Altitude</span><span className="text-white/80">{drone.altitude.toFixed(0)}m</span>
                              </div>
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span style={{ color: `${OCEAN}70` }}>Speed</span><span className="text-white/80">{drone.speed.toFixed(0)} km/h</span>
                              </div>
                            </>
                          )}
                          <div className="pt-2 border-t space-y-1" style={{ borderColor: `${OCEAN}15` }}>
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span style={{ color: `${OCEAN}50` }}>Flight Time</span><span className="text-white/60">{drone.flightTime}h</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span style={{ color: `${OCEAN}50` }}>Coverage</span><span className="text-white/60">{drone.coverage} km&sup2;</span>
                            </div>
                          </div>
                          {/* Quick Actions */}
                          <div className="pt-2 flex gap-2">
                            {isFlying ? (
                              <>
                                <motion.button whileTap={{ scale: 0.93 }} onClick={() => { setWatchingDrone(drone.id); setActiveTab('live') }}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-300 font-mono text-[10px]">
                                  <Eye className="w-3 h-3" />WATCH
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.93 }} onClick={() => handleRecallDrone(drone.id)}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 font-mono text-[10px]">
                                  <Home className="w-3 h-3" />RECALL
                                </motion.button>
                              </>
                            ) : drone.status !== 'maintenance' && (
                              <>
                                <motion.button whileTap={{ scale: 0.93 }} onClick={() => handleQuickLaunch(drone.id)}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg font-mono text-[10px]"
                                  style={{ background: `${OCEAN}12`, border: `1px solid ${OCEAN}30`, color: OCEAN }}>
                                  <Rocket className="w-3 h-3" />LAUNCH
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.93 }} onClick={() => setShowAssignModal(drone.id)}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 font-mono text-[10px]">
                                  <Send className="w-3 h-3" />ASSIGN
                                </motion.button>
                              </>
                            )}
                          </div>
                        </div>
                      </GlassPanel>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ LIVE OPERATIONS ════════════════════ */}
        {activeTab === 'live' && (
          <div className="h-full flex">
            <div className="w-56 bg-[#0A1628]/80 backdrop-blur-sm border-r overflow-y-auto" style={{ borderColor: `${OCEAN}15` }}>
              <div className="p-3 border-b" style={{ borderColor: `${OCEAN}15` }}>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: OCEAN }}>Active Feeds</p>
              </div>
              {drones.filter(d => d.status === 'active' || Array.from(activeFlights.values()).some(f => f.droneId === d.id)).map(drone => {
                const isFlying = Array.from(activeFlights.values()).some(f => f.droneId === drone.id)
                return (
                  <button key={drone.id} onClick={() => setWatchingDrone(drone.id)}
                    className={`w-full text-left px-3 py-2.5 border-b transition-all ${watchingDrone === drone.id ? 'border-l-2' : 'hover:bg-white/3'}`}
                    style={{ borderBottomColor: `${OCEAN}10`, borderLeftColor: watchingDrone === drone.id ? OCEAN : 'transparent', backgroundColor: watchingDrone === drone.id ? `${OCEAN}10` : undefined }}>
                    <div className="flex items-center gap-2">
                      <StatusDot status={isFlying ? 'active' : drone.status} />
                      <span className="text-xs font-mono text-white font-bold">{drone.id}</span>
                    </div>
                    <p className="text-[10px] font-mono mt-0.5 ml-4" style={{ color: `${OCEAN}60` }}>{drone.name}</p>
                    {isFlying && <p className="text-[9px] text-green-400 font-mono mt-0.5 ml-4">IN FLIGHT</p>}
                  </button>
                )
              })}
              {activeFlights.size === 0 && (
                <div className="p-4 text-center">
                  <p className="text-xs font-mono" style={{ color: `${OCEAN}40` }}>No active flights</p>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-4">
                <CameraFeed drone={watchedDrone} flight={watchedFlight} />
              </div>
              <div className="h-36 bg-[#0A1628]/80 backdrop-blur-sm border-t overflow-y-auto p-3" style={{ borderColor: `${OCEAN}15` }}>
                <p className="text-[10px] font-mono font-bold mb-2 uppercase tracking-wider" style={{ color: OCEAN }}>Live Event Feed</p>
                <div className="space-y-1">
                  {liveEvents.slice(-15).reverse().map(evt => (
                    <div key={evt.id} className="flex items-start gap-2 text-[11px] font-mono">
                      <span className="whitespace-nowrap" style={{ color: `${OCEAN}40` }}>{evt.timestamp.toLocaleTimeString('en-US', { hour12: false })}</span>
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${evt.type === 'warning' ? 'bg-yellow-400' : evt.type === 'alert' ? 'bg-red-400' : evt.type === 'success' ? 'bg-green-400' : 'bg-blue-400'}`} />
                      <span className={evt.type === 'warning' ? 'text-yellow-300/80' : evt.type === 'alert' ? 'text-red-300/80' : evt.type === 'success' ? 'text-green-300/80' : 'text-white/50'}>{evt.message}</span>
                    </div>
                  ))}
                  {liveEvents.length === 0 && <p className="text-xs font-mono" style={{ color: `${OCEAN}30` }}>Waiting for events...</p>}
                </div>
              </div>
            </div>

            <div className="w-72 bg-[#0A1628]/80 backdrop-blur-sm border-l overflow-y-auto p-4" style={{ borderColor: `${OCEAN}15` }}>
              <p className="text-[10px] font-mono font-bold mb-3 uppercase tracking-wider" style={{ color: OCEAN }}>Telemetry</p>
              {watchedFlight ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <TelemetryGauge label="ALTITUDE" value={watchedFlight.telemetry.altitude} max={500} unit="m" color="#00DDFF" />
                    <TelemetryGauge label="SPEED" value={watchedFlight.telemetry.speed} max={80} unit="km/h" color="#00DD66" />
                    <TelemetryGauge label="BATTERY" value={watchedFlight.telemetry.battery} max={100} unit="%" color={watchedFlight.telemetry.battery > 30 ? '#FFAA00' : '#FF3366'} />
                    <TelemetryGauge label="HEADING" value={watchedFlight.telemetry.heading} max={360} unit="deg" color="#AA88FF" />
                  </div>
                  <GlassPanel className="p-3">
                    <p className="text-[10px] font-mono mb-2" style={{ color: `${OCEAN}60` }}>MISSION PROGRESS</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-[#0A1628] rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${OCEAN}, #00DD66)` }} animate={{ width: `${watchedFlight.totalProgress}%` }} />
                      </div>
                      <span className="text-sm font-bold font-mono" style={{ color: OCEAN }}>{watchedFlight.totalProgress.toFixed(0)}%</span>
                    </div>
                  </GlassPanel>
                  <GlassPanel className="p-3 space-y-2">
                    <p className="text-[10px] font-mono" style={{ color: `${OCEAN}60` }}>GPS POSITION</p>
                    {[['LAT', watchedFlight.telemetry.gpsLat.toFixed(6)], ['LNG', watchedFlight.telemetry.gpsLng.toFixed(6)], ['DIST', `${watchedFlight.telemetry.distanceTraveled.toFixed(2)} km`]].map(([l, v]) => (
                      <div key={l} className="flex justify-between text-xs font-mono">
                        <span style={{ color: `${OCEAN}50` }}>{l}</span><span className="text-white/80">{v}</span>
                      </div>
                    ))}
                  </GlassPanel>
                  <GlassPanel className="p-3">
                    <p className="text-[10px] font-mono mb-2" style={{ color: `${OCEAN}60` }}>CONDITIONS</p>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-1"><ThermometerSun className="w-3 h-3 text-yellow-400" /><span className="text-yellow-300">24&deg;C</span></div>
                      <div className="flex items-center gap-1"><Wind className="w-3 h-3" style={{ color: OCEAN }} /><span style={{ color: `${OCEAN}CC` }}>12 km/h NW</span></div>
                    </div>
                  </GlassPanel>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Gauge className="w-10 h-10 mx-auto mb-3" style={{ color: `${OCEAN}20` }} />
                  <p className="text-xs font-mono" style={{ color: `${OCEAN}40` }}>No telemetry data</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════ BASE CAMPS ════════════════════ */}
        {activeTab === 'basecamps' && (
          <div className="h-full flex">
            {/* Left: Map with base camps */}
            <div className="flex-1 relative">
              <MapGL initialViewState={{ longitude: 29.8739, latitude: -1.9403, zoom: 7.5 }}
                style={{ width: '100%', height: '100%' }} mapStyle={MAP_STYLE}>
                {MOCK_BASE_CAMPS.map(camp => {
                  const cs = CAMP_STATUS_CONFIG[camp.status]
                  const campDrones = drones.filter(d => d.baseCampId === camp.id)
                  const isSelected = selectedCamp === camp.id
                  return (
                    <Marker key={camp.id} longitude={camp.location[0]} latitude={camp.location[1]}>
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => setSelectedCamp(isSelected ? null : camp.id)} className="relative">
                        {/* Pulse ring for online camps */}
                        {camp.status === 'online' && (
                          <div className="absolute -inset-4 rounded-full animate-pulse-ring" style={{ borderColor: `${OCEAN}30`, borderWidth: 2 }} />
                        )}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${isSelected ? 'scale-110' : ''}`}
                          style={{ background: isSelected ? `${OCEAN}35` : `${OCEAN}20`, borderColor: isSelected ? OCEAN : `${OCEAN}50` }}>
                          <Building2 className="w-6 h-6" style={{ color: isSelected ? 'white' : OCEAN }} />
                        </div>
                        {/* Drone count badge */}
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold text-white ring-2 ring-[#040810]"
                          style={{ backgroundColor: cs.color }}>
                          {campDrones.length}
                        </div>
                        {/* Camp label */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm whitespace-nowrap">
                          <p className="text-[10px] text-white font-mono font-bold">{camp.codename}</p>
                        </div>
                      </motion.button>
                    </Marker>
                  )
                })}
                {/* Show drones at their camps */}
                {drones.map(drone => {
                  const sc = STATUS_CONFIG[drone.status]
                  return (
                    <Marker key={`camp-drone-${drone.id}`} longitude={drone.location[0]} latitude={drone.location[1]}>
                      <div className="w-6 h-6 rounded-full border flex items-center justify-center" style={{ backgroundColor: `${sc.color}20`, borderColor: `${sc.color}60` }}>
                        <Plane className="w-3 h-3" style={{ color: sc.color }} />
                      </div>
                    </Marker>
                  )
                })}
              </MapGL>

              {/* Map overlay legend */}
              <GlassPanel className="absolute top-4 left-4 p-3">
                <p className="text-[10px] font-mono font-bold mb-2 uppercase tracking-wider" style={{ color: OCEAN }}>Base Camp Network</p>
                <div className="space-y-1.5">
                  {Object.entries(CAMP_STATUS_CONFIG).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2 text-[10px] font-mono">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color }} />
                      <span className="text-white/60">{v.label}</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>

            {/* Right: Base Camp cards */}
            <div className="w-[420px] bg-[#0A1628]/80 backdrop-blur-sm border-l overflow-y-auto" style={{ borderColor: `${OCEAN}15` }}>
              <div className="p-4 border-b" style={{ borderColor: `${OCEAN}15` }}>
                <h3 className="text-sm font-bold font-mono flex items-center gap-2" style={{ color: OCEAN }}>
                  <Building2 className="w-4 h-4" />DRONE BASE CAMPS
                </h3>
                <p className="text-[10px] font-mono mt-1" style={{ color: `${OCEAN}50` }}>
                  {MOCK_BASE_CAMPS.length} stations &middot; {MOCK_BASE_CAMPS.filter(c => c.status === 'online').length} online
                </p>
              </div>

              <div className="p-4 space-y-4">
                {MOCK_BASE_CAMPS.map((camp, idx) => {
                  const cs = CAMP_STATUS_CONFIG[camp.status]
                  const campDrones = drones.filter(d => d.baseCampId === camp.id)
                  const isExpanded = selectedCamp === camp.id

                  return (
                    <motion.div key={camp.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
                      <GlassPanel glow={isExpanded} className={`overflow-hidden transition-all ${isExpanded ? '!border-[#2872A1]/40' : ''}`}>
                        {/* Camp Header */}
                        <button onClick={() => setSelectedCamp(isExpanded ? null : camp.id)} className="w-full p-4 text-left">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${OCEAN}15`, border: `1px solid ${OCEAN}30` }}>
                                <Building2 className="w-5 h-5" style={{ color: OCEAN }} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-white font-mono">{camp.codename}</h4>
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold" style={{ backgroundColor: `${cs.color}15`, color: cs.color }}>
                                    {cs.label}
                                  </span>
                                </div>
                                <p className="text-[11px] font-mono" style={{ color: `${OCEAN}70` }}>{camp.name}</p>
                              </div>
                            </div>
                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                              <ChevronDown className="w-4 h-4" style={{ color: `${OCEAN}50` }} />
                            </motion.div>
                          </div>

                          {/* Quick Stats Row */}
                          <div className="flex items-center gap-4 mt-3 text-[10px] font-mono">
                            <div className="flex items-center gap-1">
                              <Plane className="w-3 h-3" style={{ color: OCEAN }} />
                              <span className="text-white/60">{campDrones.length}/{camp.capacity}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BatteryCharging className="w-3 h-3 text-yellow-400" />
                              <span className="text-white/60">{camp.chargingBays.inUse}/{camp.chargingBays.total}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Signal className="w-3 h-3" style={{ color: camp.signalStrength > 80 ? '#00DD66' : camp.signalStrength > 50 ? '#FFAA00' : '#FF3366' }} />
                              <span className="text-white/60">{camp.signalStrength}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {camp.powerSource === 'solar' ? <Sun className="w-3 h-3 text-yellow-400" /> : <Power className="w-3 h-3 text-green-400" />}
                              <span className="text-white/60 capitalize">{camp.powerSource}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThermometerSun className="w-3 h-3 text-orange-400" />
                              <span className="text-white/60">{camp.temperature}&deg;C</span>
                            </div>
                          </div>
                        </button>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }} className="overflow-hidden">
                              <div className="px-4 pb-4 border-t" style={{ borderColor: `${OCEAN}15` }}>
                                {/* Charging Bays */}
                                <div className="mt-3 mb-3">
                                  <p className="text-[10px] font-mono mb-2 uppercase tracking-wider" style={{ color: `${OCEAN}60` }}>Charging Bays</p>
                                  <div className="flex gap-1.5">
                                    {Array.from({ length: camp.chargingBays.total }).map((_, i) => (
                                      <div key={i} className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: `${OCEAN}10` }}>
                                        {i < camp.chargingBays.inUse && (
                                          <motion.div className="h-full rounded-full bg-yellow-400" initial={{ width: 0 }} animate={{ width: '100%' }}
                                            transition={{ delay: i * 0.1, duration: 0.4 }} />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  <p className="text-[9px] font-mono mt-1" style={{ color: `${OCEAN}40` }}>
                                    {camp.chargingBays.inUse} in use &middot; {camp.chargingBays.total - camp.chargingBays.inUse} available
                                  </p>
                                </div>

                                {/* Docked Drones */}
                                <p className="text-[10px] font-mono mb-2 uppercase tracking-wider" style={{ color: `${OCEAN}60` }}>Docked Drones</p>
                                {campDrones.length === 0 ? (
                                  <p className="text-[10px] font-mono text-white/30 py-2">No drones at this camp</p>
                                ) : (
                                  <div className="space-y-2">
                                    {campDrones.map(drone => {
                                      const sc = STATUS_CONFIG[drone.status]
                                      const isFlying = Array.from(activeFlights.values()).some(f => f.droneId === drone.id)
                                      return (
                                        <div key={drone.id} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: `${OCEAN}08`, border: `1px solid ${OCEAN}12` }}>
                                          <div className="flex items-center gap-2.5">
                                            <StatusDot status={drone.status} />
                                            <div>
                                              <p className="text-xs font-mono text-white font-bold">{drone.id}</p>
                                              <p className="text-[9px] font-mono" style={{ color: `${OCEAN}60` }}>{drone.name}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 text-[10px] font-mono">
                                              <Battery className="w-3 h-3" style={{ color: drone.battery > 60 ? '#00DD66' : '#FFAA00' }} />
                                              <span className="text-white/60">{drone.battery.toFixed(0)}%</span>
                                            </div>
                                            {/* Quick actions per drone */}
                                            {isFlying ? (
                                              <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleRecallDrone(drone.id)}
                                                className="px-2 py-1 rounded-md text-[9px] font-mono font-bold bg-yellow-500/10 border border-yellow-500/30 text-yellow-300" title="Recall">
                                                <Home className="w-3 h-3" />
                                              </motion.button>
                                            ) : drone.status !== 'maintenance' ? (
                                              <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleQuickLaunch(drone.id)}
                                                className="px-2 py-1 rounded-md text-[9px] font-mono font-bold border" title="Launch"
                                                style={{ backgroundColor: `${OCEAN}12`, borderColor: `${OCEAN}30`, color: OCEAN }}>
                                                <Rocket className="w-3 h-3" />
                                              </motion.button>
                                            ) : (
                                              <span className="px-2 py-1 rounded-md text-[9px] font-mono text-red-400/60"><Wrench className="w-3 h-3" /></span>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}

                                {/* Camp Location */}
                                <div className="mt-3 flex items-center gap-2 text-[10px] font-mono" style={{ color: `${OCEAN}40` }}>
                                  <Locate className="w-3 h-3" />
                                  {camp.location[1].toFixed(4)}, {camp.location[0].toFixed(4)} &middot; {camp.region}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </GlassPanel>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MISSION FORM MODAL ── */}
      <AnimatePresence>
        {showMissionForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowMissionForm(false)}>
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <GlassPanel glow className="!border-[#2872A1]/30 overflow-hidden">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: `${OCEAN}15`, background: `linear-gradient(135deg, ${OCEAN}08, transparent)` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${OCEAN}15`, border: `1px solid ${OCEAN}30` }}>
                      <Rocket className="w-5 h-5" style={{ color: OCEAN }} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white font-mono tracking-wide">SCHEDULE NEW MISSION</h2>
                      <p className="text-[10px] font-mono" style={{ color: `${OCEAN}50` }}>
                        Configure flight parameters and deploy
                        {drawingPoints.length >= 3 && <span className="ml-2 text-green-400">&bull; {drawingPoints.length} area points mapped</span>}
                        {drawingPoints.length < 3 && <span className="ml-2 text-yellow-400/70">&bull; Auto patrol zone from base camp</span>}
                      </p>
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowMissionForm(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:bg-white/5"
                    style={{ borderColor: `${OCEAN}20` }}>
                    <Plus className="w-4 h-4 rotate-45" style={{ color: `${OCEAN}60` }} />
                  </motion.button>
                </div>

                {/* Scrollable Form Body */}
                <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-5" style={{ scrollbarWidth: 'thin', scrollbarColor: `${OCEAN}30 transparent` }}>

                  {/* ── SECTION: Mission Details ── */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-px flex-1" style={{ backgroundColor: `${OCEAN}15` }} />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: `${OCEAN}50` }}>Mission Details</span>
                      <div className="h-px flex-1" style={{ backgroundColor: `${OCEAN}15` }} />
                    </div>

                    <div className="mb-3">
                      <label className="block text-[10px] font-mono mb-1.5 uppercase tracking-wider" style={{ color: `${OCEAN}70` }}>Mission Name <span className="text-red-400">*</span></label>
                      <input type="text" value={missionForm.name} onChange={(e) => setMissionForm({ ...missionForm, name: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#0A1628] border rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-1 transition-all placeholder:text-white/15"
                        style={{ borderColor: `${OCEAN}25`, '--tw-ring-color': `${OCEAN}40` } as any}
                        placeholder="e.g. Akagera Dawn Patrol" />
                    </div>

                    {/* Mission Type Grid */}
                    <div className="mb-3">
                      <label className="block text-[10px] font-mono mb-2 uppercase tracking-wider" style={{ color: `${OCEAN}70` }}>Mission Type</label>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(MISSION_TYPE_CONFIG).map(([key, config]) => {
                          const Icon = config.icon
                          const isSelected = missionForm.type === key
                          return (
                            <motion.button key={key} whileTap={{ scale: 0.93 }} type="button"
                              onClick={() => setMissionForm({ ...missionForm, type: key as Mission['type'] })}
                              className="p-2.5 rounded-lg border text-center transition-all"
                              style={{
                                backgroundColor: isSelected ? `${config.color}15` : '#0A162880',
                                borderColor: isSelected ? config.color : `${OCEAN}15`,
                              }}>
                              <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: isSelected ? config.color : `${OCEAN}40` }} />
                              <p className="text-[10px] font-mono font-bold leading-tight" style={{ color: isSelected ? 'white' : `${OCEAN}60` }}>{config.label}</p>
                              <p className="text-[8px] font-mono mt-0.5 leading-tight" style={{ color: isSelected ? `${config.color}AA` : `${OCEAN}30` }}>{config.desc}</p>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Priority Pills */}
                    <div>
                      <label className="block text-[10px] font-mono mb-2 uppercase tracking-wider" style={{ color: `${OCEAN}70` }}>Priority</label>
                      <div className="flex gap-2">
                        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => {
                          const isSelected = missionForm.priority === key
                          return (
                            <motion.button key={key} whileTap={{ scale: 0.93 }} type="button"
                              onClick={() => setMissionForm({ ...missionForm, priority: key as Mission['priority'] })}
                              className="flex-1 py-2 rounded-lg border text-[10px] font-mono font-bold text-center transition-all"
                              style={{
                                backgroundColor: isSelected ? `${config.color}18` : 'transparent',
                                borderColor: isSelected ? config.color : `${OCEAN}15`,
                                color: isSelected ? config.color : `${OCEAN}40`,
                              }}>
                              {config.label}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ── SECTION: Drone Assignment ── */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-px flex-1" style={{ backgroundColor: `${OCEAN}15` }} />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: `${OCEAN}50` }}>Drone Assignment</span>
                      <div className="h-px flex-1" style={{ backgroundColor: `${OCEAN}15` }} />
                    </div>

                    <label className="block text-[10px] font-mono mb-1.5 uppercase tracking-wider" style={{ color: `${OCEAN}70` }}>Select Drone <span className="text-red-400">*</span></label>
                    <select value={missionForm.assignedDrone} onChange={(e) => setMissionForm({ ...missionForm, assignedDrone: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[#0A1628] border rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-1 transition-all"
                      style={{ borderColor: `${OCEAN}25`, '--tw-ring-color': `${OCEAN}40` } as any}>
                      <option value="">-- Choose a drone --</option>
                      {drones.filter(d => d.status !== 'maintenance').map(d => {
                        const camp = MOCK_BASE_CAMPS.find(c => c.id === d.baseCampId)
                        return (
                          <option key={d.id} value={d.id}>
                            {d.id} — {d.name} ({d.model} · {d.battery}% · {STATUS_CONFIG[d.status].label} · {camp?.codename || '?'})
                          </option>
                        )
                      })}
                    </select>

                    {/* Selected Drone Info Card */}
                    {missionForm.assignedDrone && (() => {
                      const drone = drones.find(d => d.id === missionForm.assignedDrone)
                      if (!drone) return null
                      const camp = MOCK_BASE_CAMPS.find(c => c.id === drone.baseCampId)
                      const sc = STATUS_CONFIG[drone.status]
                      const isFlying = Array.from(activeFlights.values()).some(f => f.droneId === drone.id)
                      return (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                          className="mt-2 flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: `${OCEAN}06`, border: `1px solid ${OCEAN}12` }}>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${sc.color}15`, border: `1px solid ${sc.color}30` }}>
                            <Plane className="w-5 h-5" style={{ color: sc.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-mono text-white font-bold">{drone.name}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] font-mono" style={{ color: `${OCEAN}60` }}>
                              <span>{drone.model}</span>
                              <span style={{ color: sc.color }}>{isFlying ? 'IN FLIGHT' : sc.label}</span>
                              <span className="flex items-center gap-1">
                                <Battery className="w-3 h-3" style={{ color: drone.battery > 60 ? '#00DD66' : drone.battery > 30 ? '#FFAA00' : '#FF3366' }} />
                                {drone.battery}%
                              </span>
                              <span>{drone.flightTime}h total</span>
                              {camp && <span>Base: {camp.codename}</span>}
                            </div>
                          </div>
                          {isFlying && <span className="text-[9px] font-mono font-bold px-2 py-1 rounded-md bg-yellow-500/15 text-yellow-300">BUSY</span>}
                        </motion.div>
                      )
                    })()}
                  </div>

                  {/* ── SECTION: Scheduling ── */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-px flex-1" style={{ backgroundColor: `${OCEAN}15` }} />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: `${OCEAN}50` }}>Scheduling</span>
                      <div className="h-px flex-1" style={{ backgroundColor: `${OCEAN}15` }} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[10px] font-mono mb-1.5 uppercase tracking-wider" style={{ color: `${OCEAN}70` }}>Start Date & Time <span className="text-red-400">*</span></label>
                        <input type="datetime-local" value={missionForm.startTime} onChange={(e) => setMissionForm({ ...missionForm, startTime: e.target.value })}
                          className="w-full px-3 py-2.5 bg-[#0A1628] border rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-1 transition-all"
                          style={{ borderColor: `${OCEAN}25`, '--tw-ring-color': `${OCEAN}40` } as any} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono mb-1.5 uppercase tracking-wider" style={{ color: `${OCEAN}70` }}>Repeat Schedule</label>
                        <select value={missionForm.schedule} onChange={(e) => setMissionForm({ ...missionForm, schedule: e.target.value as Mission['schedule'] })}
                          className="w-full px-3 py-2.5 bg-[#0A1628] border rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-1 transition-all"
                          style={{ borderColor: `${OCEAN}25`, '--tw-ring-color': `${OCEAN}40` } as any}>
                          <option value="once">One-Time</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono mb-1.5 uppercase tracking-wider" style={{ color: `${OCEAN}70` }}>Estimated Duration (minutes)</label>
                      <div className="flex items-center gap-3">
                        <input type="range" min={10} max={180} step={5} value={missionForm.estimatedDuration}
                          onChange={(e) => setMissionForm({ ...missionForm, estimatedDuration: parseInt(e.target.value) })}
                          className="flex-1 h-1.5 bg-[#0A1628] rounded-full appearance-none cursor-pointer accent-[#2872A1]" />
                        <div className="w-16 px-2 py-1.5 bg-[#0A1628] border rounded-lg text-center text-sm font-mono text-white font-bold" style={{ borderColor: `${OCEAN}25` }}>
                          {missionForm.estimatedDuration}
                        </div>
                      </div>
                      <div className="flex justify-between text-[9px] font-mono mt-1" style={{ color: `${OCEAN}30` }}>
                        <span>10 min</span><span>1 hr</span><span>2 hr</span><span>3 hr</span>
                      </div>
                    </div>
                  </div>

                  {/* ── SECTION: Flight Parameters ── */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-px flex-1" style={{ backgroundColor: `${OCEAN}15` }} />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: `${OCEAN}50` }}>Flight Parameters</span>
                      <div className="h-px flex-1" style={{ backgroundColor: `${OCEAN}15` }} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[10px] font-mono mb-1.5 uppercase tracking-wider" style={{ color: `${OCEAN}70` }}>
                          Target Altitude
                          <span className="ml-1 text-[9px] normal-case" style={{ color: `${OCEAN}40` }}>(meters)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input type="number" min={20} max={500} value={missionForm.altitude}
                            onChange={(e) => setMissionForm({ ...missionForm, altitude: parseInt(e.target.value) || 120 })}
                            className="flex-1 px-3 py-2.5 bg-[#0A1628] border rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-1 transition-all"
                            style={{ borderColor: `${OCEAN}25`, '--tw-ring-color': `${OCEAN}40` } as any} />
                          <span className="text-[10px] font-mono font-bold" style={{ color: `${OCEAN}40` }}>m</span>
                        </div>
                        <div className="flex gap-1.5 mt-1.5">
                          {[50, 100, 120, 200, 350].map(v => (
                            <motion.button key={v} whileTap={{ scale: 0.9 }} type="button"
                              onClick={() => setMissionForm({ ...missionForm, altitude: v })}
                              className="px-2 py-0.5 rounded text-[9px] font-mono border transition-all"
                              style={{
                                backgroundColor: missionForm.altitude === v ? `${OCEAN}15` : 'transparent',
                                borderColor: missionForm.altitude === v ? OCEAN : `${OCEAN}15`,
                                color: missionForm.altitude === v ? OCEAN : `${OCEAN}40`,
                              }}>
                              {v}m
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono mb-1.5 uppercase tracking-wider" style={{ color: `${OCEAN}70` }}>
                          Max Speed
                          <span className="ml-1 text-[9px] normal-case" style={{ color: `${OCEAN}40` }}>(km/h)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input type="number" min={5} max={80} value={missionForm.maxSpeed}
                            onChange={(e) => setMissionForm({ ...missionForm, maxSpeed: parseInt(e.target.value) || 45 })}
                            className="flex-1 px-3 py-2.5 bg-[#0A1628] border rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-1 transition-all"
                            style={{ borderColor: `${OCEAN}25`, '--tw-ring-color': `${OCEAN}40` } as any} />
                          <span className="text-[10px] font-mono font-bold" style={{ color: `${OCEAN}40` }}>km/h</span>
                        </div>
                        <div className="flex gap-1.5 mt-1.5">
                          {[15, 25, 45, 60, 80].map(v => (
                            <motion.button key={v} whileTap={{ scale: 0.9 }} type="button"
                              onClick={() => setMissionForm({ ...missionForm, maxSpeed: v })}
                              className="px-2 py-0.5 rounded text-[9px] font-mono border transition-all"
                              style={{
                                backgroundColor: missionForm.maxSpeed === v ? `${OCEAN}15` : 'transparent',
                                borderColor: missionForm.maxSpeed === v ? OCEAN : `${OCEAN}15`,
                                color: missionForm.maxSpeed === v ? OCEAN : `${OCEAN}40`,
                              }}>
                              {v}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Camera Mode Pills */}
                    <div>
                      <label className="block text-[10px] font-mono mb-2 uppercase tracking-wider" style={{ color: `${OCEAN}70` }}>Camera Mode</label>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(CAMERA_MODE_CONFIG).map(([key, config]) => {
                          const isSelected = missionForm.cameraMode === key
                          return (
                            <motion.button key={key} whileTap={{ scale: 0.93 }} type="button"
                              onClick={() => setMissionForm({ ...missionForm, cameraMode: key as Mission['cameraMode'] })}
                              className="py-2.5 px-2 rounded-lg border text-center transition-all"
                              style={{
                                backgroundColor: isSelected ? `${config.color}15` : 'transparent',
                                borderColor: isSelected ? config.color : `${OCEAN}15`,
                              }}>
                              <p className="text-[11px] font-mono font-bold" style={{ color: isSelected ? config.color : `${OCEAN}50` }}>{config.label}</p>
                              <p className="text-[8px] font-mono mt-0.5" style={{ color: isSelected ? `${config.color}88` : `${OCEAN}25` }}>{config.desc}</p>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ── SECTION: Mission Area & Notes ── */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-px flex-1" style={{ backgroundColor: `${OCEAN}15` }} />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: `${OCEAN}50` }}>Mission Area & Notes</span>
                      <div className="h-px flex-1" style={{ backgroundColor: `${OCEAN}15` }} />
                    </div>

                    {/* Area Status */}
                    <div className="flex items-center gap-2 p-2.5 rounded-lg mb-3" style={{ backgroundColor: drawingPoints.length >= 3 ? 'rgba(0,221,102,0.06)' : 'rgba(255,170,0,0.06)', border: `1px solid ${drawingPoints.length >= 3 ? 'rgba(0,221,102,0.2)' : 'rgba(255,170,0,0.15)'}` }}>
                      {drawingPoints.length >= 3 ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <div>
                            <p className="text-[11px] font-mono text-green-300 font-bold">{drawingPoints.length} waypoints mapped</p>
                            <p className="text-[9px] font-mono text-green-400/50">Custom mission area defined on map</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 text-yellow-400/70" />
                          <div>
                            <p className="text-[11px] font-mono text-yellow-300/80 font-bold">No area drawn</p>
                            <p className="text-[9px] font-mono text-yellow-400/40">Will auto-generate patrol zone around drone&apos;s base camp</p>
                          </div>
                        </>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono mb-1.5 uppercase tracking-wider" style={{ color: `${OCEAN}70` }}>Mission Notes <span className="text-[9px] normal-case" style={{ color: `${OCEAN}30` }}>(optional)</span></label>
                      <textarea value={missionForm.notes} onChange={(e) => setMissionForm({ ...missionForm, notes: e.target.value })}
                        rows={2} placeholder="Special instructions, observation targets, weather notes..."
                        className="w-full px-3 py-2.5 bg-[#0A1628] border rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-1 transition-all resize-none placeholder:text-white/15"
                        style={{ borderColor: `${OCEAN}25`, '--tw-ring-color': `${OCEAN}40` } as any} />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t" style={{ borderColor: `${OCEAN}15`, background: `linear-gradient(135deg, ${OCEAN}05, transparent)` }}>
                  <div className="flex gap-3">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => createMission(false)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-mono text-sm font-bold transition-all hover:brightness-110"
                      style={{ background: `linear-gradient(135deg, ${OCEAN}25, ${OCEAN}12)`, border: `1px solid ${OCEAN}50`, color: OCEAN }}>
                      <Calendar className="w-4 h-4" />SCHEDULE MISSION
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => createMission(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-mono text-sm font-bold transition-all hover:brightness-110 bg-green-500/12 border border-green-500/40 text-green-300">
                      <Rocket className="w-4 h-4" />LAUNCH NOW
                    </motion.button>
                  </div>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowMissionForm(false)}
                    className="w-full mt-2 flex items-center justify-center px-4 py-2 rounded-lg font-mono text-xs transition-all hover:bg-white/5"
                    style={{ color: `${OCEAN}50` }}>
                    Cancel
                  </motion.button>
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
