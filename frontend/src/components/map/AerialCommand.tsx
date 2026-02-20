'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import Map, { Source, Layer, Marker, NavigationControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Radio, Battery, Gauge, Navigation2, Signal,
  AlertTriangle, Satellite, Wind, Thermometer, Eye, Cloud,
  Activity, Wifi, Database, Zap, Shield, MapPin, Plane,
  Target, TrendingUp, CheckCircle2, Users, BarChart3
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

// ==================== TYPES ====================

interface DroneData {
  id: string
  name: string
  model: string
  type: 'surveillance' | 'census' | 'mapping' | 'patrol'
  status: 'active' | 'returning' | 'standby' | 'charging'
  battery: number
  altitude: number
  speed: number
  heading: number
  mission: string
  path: [number, number][]
  progress: number
  color: string
  trail: [number, number][]
}

interface FarmLocation {
  id: string
  name: string
  lng: number
  lat: number
  animals: number
  healthRate: number
  type: 'dairy' | 'livestock' | 'mixed'
}

interface LiveEvent {
  id: string
  timestamp: Date
  type: 'info' | 'warning' | 'alert' | 'success'
  drone?: string
  message: string
}

// ==================== MAP STYLE ====================

const MAP_STYLE = {
  version: 8 as const,
  sources: {
    'carto-dark': {
      type: 'raster' as const,
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster' as const,
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
}

// ==================== GEOGRAPHIC DATA ====================

// Rwanda border (simplified but accurate outline)
const RWANDA_BORDER_COORDS: [number, number][] = [
  [29.02, -1.07], [29.30, -1.07], [29.60, -1.08], [29.90, -1.10],
  [30.15, -1.15], [30.35, -1.25], [30.47, -1.39], [30.51, -1.50],
  [30.52, -1.60], [30.85, -1.80], [30.83, -2.00], [30.78, -2.15],
  [30.65, -2.25], [30.55, -2.35], [30.47, -2.40], [30.25, -2.43],
  [30.00, -2.50], [29.85, -2.60], [29.60, -2.65], [29.38, -2.75],
  [29.15, -2.82], [29.02, -2.83], [28.86, -2.68], [28.87, -2.45],
  [28.90, -2.30], [29.00, -2.20], [29.05, -2.00], [29.02, -1.80],
  [29.03, -1.50], [29.05, -1.30], [29.02, -1.07]
]

// Major forests/parks
const FORESTS = [
  {
    name: 'Nyungwe National Park',
    type: 'Tropical Rainforest',
    color: '#00CC66',
    area: 970,
    coordinates: [
      [29.05, -2.35], [29.25, -2.37], [29.38, -2.42], [29.40, -2.50],
      [29.35, -2.55], [29.20, -2.58], [29.05, -2.55], [29.00, -2.48],
      [29.05, -2.35]
    ] as [number, number][]
  },
  {
    name: 'Volcanoes National Park',
    type: 'Montane Forest',
    color: '#0099FF',
    area: 160,
    coordinates: [
      [29.38, -1.42], [29.48, -1.38], [29.55, -1.40], [29.63, -1.43],
      [29.60, -1.50], [29.52, -1.52], [29.42, -1.50], [29.38, -1.42]
    ] as [number, number][]
  },
  {
    name: 'Akagera National Park',
    type: 'Savanna & Wetlands',
    color: '#66CC00',
    area: 1122,
    coordinates: [
      [30.38, -1.42], [30.55, -1.40], [30.78, -1.50], [30.85, -1.65],
      [30.82, -1.85], [30.75, -2.00], [30.65, -2.08], [30.50, -2.10],
      [30.38, -1.95], [30.35, -1.75], [30.38, -1.55], [30.38, -1.42]
    ] as [number, number][]
  },
  {
    name: 'Gishwati-Mukura',
    type: 'Tropical Forest',
    color: '#00AA88',
    area: 34,
    coordinates: [
      [29.32, -1.82], [29.38, -1.80], [29.42, -1.83], [29.40, -1.90],
      [29.35, -1.92], [29.30, -1.88], [29.32, -1.82]
    ] as [number, number][]
  }
]

// Initial drone fleet configuration
const INITIAL_DRONES: Omit<DroneData, 'trail' | 'heading'>[] = [
  {
    id: 'KD-001',
    name: 'Eagle Eye Alpha',
    model: 'DJI M300 RTK',
    type: 'surveillance',
    status: 'active',
    battery: 87,
    altitude: 120,
    speed: 45,
    mission: 'Akagera Anti-Poaching Patrol',
    path: [
      [30.50, -1.50], [30.60, -1.55], [30.70, -1.60], [30.75, -1.70],
      [30.72, -1.80], [30.65, -1.85], [30.55, -1.80], [30.50, -1.65],
      [30.50, -1.50]
    ],
    progress: 0,
    color: '#FF6B35'
  },
  {
    id: 'KD-002',
    name: 'Forest Sentinel',
    model: 'DJI M350 Pro',
    type: 'census',
    status: 'active',
    battery: 62,
    altitude: 80,
    speed: 38,
    mission: 'Nyungwe Canopy Survey',
    path: [
      [29.10, -2.38], [29.20, -2.42], [29.30, -2.45], [29.35, -2.50],
      [29.28, -2.55], [29.15, -2.52], [29.08, -2.46], [29.10, -2.38]
    ],
    progress: 0.3,
    color: '#00DD66'
  },
  {
    id: 'KD-003',
    name: 'Gorilla Guardian',
    model: 'Autel EVO II',
    type: 'surveillance',
    status: 'active',
    battery: 91,
    altitude: 95,
    speed: 42,
    mission: 'Volcanoes Gorilla Monitor',
    path: [
      [29.42, -1.42], [29.48, -1.40], [29.55, -1.42], [29.58, -1.47],
      [29.52, -1.50], [29.45, -1.48], [29.42, -1.42]
    ],
    progress: 0.15,
    color: '#AA44FF'
  },
  {
    id: 'KD-004',
    name: 'Crop Hawk',
    model: 'DJI Mavic 3',
    type: 'mapping',
    status: 'active',
    battery: 58,
    altitude: 110,
    speed: 40,
    mission: 'Bugesera Farm Monitor',
    path: [
      [30.10, -2.08], [30.15, -2.12], [30.22, -2.15], [30.18, -2.20],
      [30.10, -2.18], [30.05, -2.12], [30.10, -2.08]
    ],
    progress: 0.5,
    color: '#0099FF'
  },
  {
    id: 'KD-005',
    name: 'Land Scanner',
    model: 'Parrot Anafi',
    type: 'mapping',
    status: 'active',
    battery: 45,
    altitude: 130,
    speed: 35,
    mission: 'Kayonza Crop Survey',
    path: [
      [30.55, -1.85], [30.62, -1.88], [30.68, -1.92], [30.65, -1.98],
      [30.58, -1.95], [30.52, -1.90], [30.55, -1.85]
    ],
    progress: 0.7,
    color: '#00DDFF'
  },
  {
    id: 'KD-006',
    name: 'Urban Eye',
    model: 'DJI Phantom 4',
    type: 'mapping',
    status: 'active',
    battery: 73,
    altitude: 100,
    speed: 48,
    mission: 'Kigali Perimeter Survey',
    path: [
      [29.82, -1.90], [29.88, -1.93], [29.95, -1.95], [29.92, -2.00],
      [29.85, -1.98], [29.80, -1.95], [29.82, -1.90]
    ],
    progress: 0.25,
    color: '#FFAA00'
  },
  {
    id: 'KD-007',
    name: 'Night Owl',
    model: 'DJI Matrice 30',
    type: 'patrol',
    status: 'charging',
    battery: 23,
    altitude: 0,
    speed: 0,
    mission: 'Maintenance',
    path: [[29.87, -1.95]],
    progress: 0,
    color: '#888888'
  },
  {
    id: 'KD-008',
    name: 'Sky Relay',
    model: 'Custom Relay',
    type: 'surveillance',
    status: 'standby',
    battery: 100,
    altitude: 500,
    speed: 0,
    mission: 'Communication Relay',
    path: [[29.87, -1.94]],
    progress: 0,
    color: '#FFFFFF'
  }
]

// Farm locations from seed data
const FARMS: FarmLocation[] = [
  {
    id: 'F001',
    name: 'Mugabo Family Farm',
    lng: 30.120,
    lat: -2.120,
    animals: 45,
    healthRate: 98,
    type: 'livestock'
  },
  {
    id: 'F002',
    name: 'Uwase Livestock Ranch',
    lng: 30.650,
    lat: -1.880,
    animals: 78,
    healthRate: 95,
    type: 'dairy'
  },
  {
    id: 'F003',
    name: 'Bugesera Cooperative',
    lng: 30.200,
    lat: -2.180,
    animals: 32,
    healthRate: 92,
    type: 'mixed'
  },
  {
    id: 'F004',
    name: 'Kayonza Dairy',
    lng: 30.600,
    lat: -1.920,
    animals: 56,
    healthRate: 97,
    type: 'dairy'
  }
]

// Event templates for simulation
const EVENT_TEMPLATES = [
  { type: 'info' as const, template: 'detected elephant herd ({{count}} individuals) - Akagera Sector {{sector}}' },
  { type: 'success' as const, template: 'completed livestock health scan - {{farm}} - {{health}}% healthy' },
  { type: 'info' as const, template: 'entering {{forest}} airspace - altitude {{alt}}m' },
  { type: 'warning' as const, template: 'battery warning: {{battery}}% remaining' },
  { type: 'success' as const, template: 'census complete: {{count}} {{animal}} sighted in {{location}}' },
  { type: 'alert' as const, template: 'poaching alert Level {{level}} - {{location}} boundary' },
  { type: 'info' as const, template: 'mission progress {{percent}}% - {{mission}}' },
  { type: 'success' as const, template: 'high-resolution imagery captured - {{area}} hectares' },
  { type: 'info' as const, template: 'wildlife movement detected - {{species}} migrating {{direction}}' },
  { type: 'warning' as const, template: 'weather advisory: strong winds {{speed}} km/h at {{altitude}}m' }
]

// ==================== HELPER FUNCTIONS ====================

function interpolatePosition(path: [number, number][], progress: number): [number, number] {
  if (path.length === 0) return [0, 0]
  if (path.length === 1) return path[0]

  const totalSegments = path.length - 1
  const position = progress * totalSegments
  const segmentIndex = Math.min(Math.floor(position), totalSegments - 1)
  const segmentProgress = position - segmentIndex

  const start = path[segmentIndex]
  const end = path[Math.min(segmentIndex + 1, path.length - 1)]

  return [
    start[0] + (end[0] - start[0]) * segmentProgress,
    start[1] + (end[1] - start[1]) * segmentProgress
  ]
}

function calculateHeading(from: [number, number], to: [number, number]): number {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  return Math.atan2(dx, -dy) * (180 / Math.PI)
}

function generateEvent(drones: DroneData[]): LiveEvent {
  const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)]
  const activeDrones = drones.filter(d => d.status === 'active')
  const drone = activeDrones[Math.floor(Math.random() * activeDrones.length)]

  let message = template.template
    .replace('{{count}}', String(Math.floor(Math.random() * 20) + 3))
    .replace('{{sector}}', String(Math.floor(Math.random() * 12) + 1))
    .replace('{{farm}}', FARMS[Math.floor(Math.random() * FARMS.length)].name)
    .replace('{{health}}', String(Math.floor(Math.random() * 10) + 90))
    .replace('{{forest}}', FORESTS[Math.floor(Math.random() * FORESTS.length)].name)
    .replace('{{alt}}', String(Math.floor(Math.random() * 100) + 80))
    .replace('{{battery}}', String(Math.floor(Math.random() * 30) + 15))
    .replace('{{animal}}', ['buffalo', 'zebra', 'giraffe', 'elephant'][Math.floor(Math.random() * 4)])
    .replace('{{location}}', FORESTS[Math.floor(Math.random() * FORESTS.length)].name)
    .replace('{{level}}', String(Math.floor(Math.random() * 3) + 1))
    .replace('{{percent}}', String(Math.floor(Math.random() * 40) + 60))
    .replace('{{mission}}', drone?.mission || 'patrol')
    .replace('{{area}}', String(Math.floor(Math.random() * 500) + 100))
    .replace('{{species}}', ['Elephant', 'Buffalo', 'Zebra'][Math.floor(Math.random() * 3)])
    .replace('{{direction}}', ['north', 'south', 'east', 'west'][Math.floor(Math.random() * 4)])
    .replace('{{speed}}', String(Math.floor(Math.random() * 20) + 25))
    .replace('{{altitude}}', String(Math.floor(Math.random() * 100) + 100))

  return {
    id: `evt-${Date.now()}-${Math.random()}`,
    timestamp: new Date(),
    type: template.type,
    drone: drone?.id,
    message: `${drone?.id || 'SYS'} ${message}`
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour12: false })
}

// ==================== COMPONENT ====================

export default function AerialCommand() {
  const router = useRouter()
  const { user } = useAuth()
  const [drones, setDrones] = useState<DroneData[]>([])
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null)
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mapLoaded, setMapLoaded] = useState(false)

  // Initialize drones
  useEffect(() => {
    const initialDrones = INITIAL_DRONES.map(d => ({
      ...d,
      trail: [] as [number, number][],
      heading: 0
    }))
    setDrones(initialDrones)

    // Add initial event
    setEvents([{
      id: 'evt-init',
      timestamp: new Date(),
      type: 'success',
      message: 'KUBE Aerial Command Center initialized - All systems operational'
    }])
  }, [])

  // Animate drones
  useEffect(() => {
    const interval = setInterval(() => {
      setDrones(prev => prev.map(drone => {
        if (drone.status !== 'active' || drone.path.length <= 1) return drone

        // Calculate new progress
        const speed = 0.001 + (drone.speed / 10000)
        const newProgress = (drone.progress + speed) % 1

        // Get positions
        const oldPos = interpolatePosition(drone.path, drone.progress)
        const newPos = interpolatePosition(drone.path, newProgress)

        // Calculate heading
        const heading = calculateHeading(oldPos, newPos)

        // Update trail (keep last 40 positions)
        const newTrail = [...drone.trail, newPos].slice(-40)

        // Simulate battery drain and speed variation
        const batteryDrain = Math.random() * 0.008
        const speedVariation = (Math.random() - 0.5) * 3

        return {
          ...drone,
          progress: newProgress,
          heading,
          trail: newTrail,
          battery: Math.max(0, drone.battery - batteryDrain),
          speed: Math.max(30, Math.min(60, drone.speed + speedVariation))
        }
      }))
    }, 80)

    return () => clearInterval(interval)
  }, [])

  // Generate events
  useEffect(() => {
    if (drones.length === 0) return

    const interval = setInterval(() => {
      const newEvent = generateEvent(drones)
      setEvents(prev => [newEvent, ...prev.slice(0, 99)])
    }, 4000)

    return () => clearInterval(interval)
  }, [drones])

  // Clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // GeoJSON data
  const rwandaBorderGeoJSON = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: [{
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: RWANDA_BORDER_COORDS
      }
    }]
  }), [])

  const forestsGeoJSON = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: FORESTS.map(f => ({
      type: 'Feature' as const,
      properties: { name: f.name, color: f.color, area: f.area },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [f.coordinates]
      }
    }))
  }), [])

  const activeDrones = drones.filter(d => d.status === 'active')
  const selected = selectedDrone ? drones.find(d => d.id === selectedDrone) : null

  return (
    <div className="fixed inset-0 bg-[#040810] overflow-hidden">
      {/* TOP BAR */}
      <div className="h-14 bg-gradient-to-r from-[#0A1628] via-[#0D1B2E] to-[#0A1628] border-b border-blue-900/30 flex items-center justify-between px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,170,255,0.03)_50%,transparent_100%)] animate-[shimmer_3s_infinite]" />

        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-blue-500/30 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs text-blue-300 font-mono">DASHBOARD</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded flex items-center justify-center">
              <Satellite className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wider font-mono">KUBE AERIAL COMMAND</h1>
              <p className="text-[10px] text-blue-400/70 font-mono">Rwanda Air Operations Center</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 border border-green-400/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-green-300 font-mono font-bold">LIVE</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/10 border border-blue-400/20">
            <Plane className="w-3 h-3 text-blue-300" />
            <span className="text-xs text-blue-200 font-mono">{activeDrones.length}/{drones.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono text-blue-300">
            <Signal className="w-3.5 h-3.5" />
            <span>98%</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
            <Wifi className="w-3.5 h-3.5" />
            <span>24ms</span>
          </div>

          <div className="px-3 py-1 rounded bg-cyan-500/10 border border-cyan-400/30">
            <span className="text-sm font-mono text-cyan-300 font-bold">{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex h-[calc(100vh-56px-48px)]">
        {/* LEFT PANEL - DRONE FLEET */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-80 bg-[#0A1628]/80 backdrop-blur-sm border-r border-blue-900/30 flex flex-col"
        >
          <div className="p-4 border-b border-blue-900/30">
            <h2 className="text-xs font-bold text-cyan-300 font-mono tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4" />
              DRONE FLEET STATUS
            </h2>
            <p className="text-[10px] text-blue-400/60 mt-1 font-mono">
              {activeDrones.length} ACTIVE • {drones.filter(d => d.status === 'charging').length} CHARGING • {drones.filter(d => d.status === 'standby').length} STANDBY
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {drones.map((drone) => (
              <motion.button
                key={drone.id}
                onClick={() => setSelectedDrone(drone.id === selectedDrone ? null : drone.id)}
                className={`w-full p-3 rounded-lg border transition-all text-left ${
                  selectedDrone === drone.id
                    ? 'bg-blue-500/20 border-blue-400/50 shadow-lg shadow-blue-500/20'
                    : 'bg-[#0D1B2E]/50 border-blue-900/30 hover:border-blue-700/50 hover:bg-[#0D1B2E]/80'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        drone.status === 'active' ? 'bg-green-400 animate-pulse' :
                        drone.status === 'charging' ? 'bg-yellow-400' :
                        'bg-gray-500'
                      }`}
                    />
                    <span className="text-xs font-bold text-white font-mono">{drone.id}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Battery className={`w-3 h-3 ${
                      drone.battery > 60 ? 'text-green-400' :
                      drone.battery > 30 ? 'text-yellow-400' :
                      'text-red-400'
                    }`} />
                    <span className={`text-[10px] font-mono font-bold ${
                      drone.battery > 60 ? 'text-green-300' :
                      drone.battery > 30 ? 'text-yellow-300' :
                      'text-red-300'
                    }`}>
                      {Math.round(drone.battery)}%
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-blue-200 font-medium mb-1">{drone.name}</p>
                <p className="text-[10px] text-blue-400/70 mb-2 font-mono">{drone.model}</p>

                {drone.status === 'active' ? (
                  <>
                    <div className="flex items-center gap-3 text-[10px] text-cyan-300 font-mono mb-1">
                      <span className="flex items-center gap-1">
                        <Navigation2 className="w-3 h-3" />
                        {Math.round(drone.altitude)}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Gauge className="w-3 h-3" />
                        {Math.round(drone.speed)} km/h
                      </span>
                    </div>
                    <div className="h-1 bg-blue-900/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                        style={{ width: `${drone.battery}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-blue-300/80 mt-2 font-mono truncate">{drone.mission}</p>
                  </>
                ) : (
                  <div className="text-[10px] text-gray-400 font-mono uppercase">{drone.status}</div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* CENTER - MAP */}
        <div className="flex-1 relative">
          <Map
            initialViewState={{
              longitude: 29.8739,
              latitude: -1.9403,
              zoom: 8.2
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle={MAP_STYLE}
            onLoad={() => setMapLoaded(true)}
          >
            <NavigationControl position="top-right" />

            {/* Rwanda Border */}
            <Source id="rwanda-border" type="geojson" data={rwandaBorderGeoJSON}>
              <Layer
                id="rwanda-border-line"
                type="line"
                paint={{
                  'line-color': '#00AAFF',
                  'line-width': 2,
                  'line-opacity': 0.6
                }}
              />
            </Source>

            {/* Forests */}
            <Source id="forests" type="geojson" data={forestsGeoJSON}>
              <Layer
                id="forests-fill"
                type="fill"
                paint={{
                  'fill-color': ['get', 'color'],
                  'fill-opacity': 0.15
                }}
              />
              <Layer
                id="forests-outline"
                type="line"
                paint={{
                  'line-color': ['get', 'color'],
                  'line-width': 1.5,
                  'line-opacity': 0.5
                }}
              />
            </Source>

            {/* Drone Trails */}
            {activeDrones.map((drone) => {
              if (drone.trail.length < 2) return null
              const trailGeoJSON = {
                type: 'FeatureCollection' as const,
                features: [{
                  type: 'Feature' as const,
                  properties: {},
                  geometry: {
                    type: 'LineString' as const,
                    coordinates: drone.trail
                  }
                }]
              }
              return (
                <Source key={`trail-${drone.id}`} id={`trail-${drone.id}`} type="geojson" data={trailGeoJSON}>
                  <Layer
                    id={`trail-line-${drone.id}`}
                    type="line"
                    paint={{
                      'line-color': drone.color,
                      'line-width': 2,
                      'line-opacity': 0.4,
                      'line-blur': 1
                    }}
                  />
                </Source>
              )
            })}

            {/* Farm Markers */}
            {FARMS.map((farm) => (
              <Marker key={farm.id} longitude={farm.lng} latitude={farm.lat}>
                <div className="relative group cursor-pointer">
                  <div className="absolute -inset-2 bg-blue-500/20 rounded-full animate-ping opacity-75" />
                  <div className="relative w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[#0D1B2E] border border-blue-400/30 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    <p className="text-[10px] text-white font-mono font-bold">{farm.name}</p>
                    <p className="text-[9px] text-blue-300 font-mono">{farm.animals} animals • {farm.healthRate}% healthy</p>
                  </div>
                </div>
              </Marker>
            ))}

            {/* Drone Markers */}
            {activeDrones.map((drone) => {
              const [lng, lat] = interpolatePosition(drone.path, drone.progress)
              return (
                <Marker key={drone.id} longitude={lng} latitude={lat}>
                  <motion.div
                    className="relative cursor-pointer group"
                    animate={{ rotate: drone.heading }}
                    onClick={() => setSelectedDrone(drone.id)}
                  >
                    {/* Coverage Circle */}
                    <div
                      className="absolute -inset-8 rounded-full border-2 opacity-20"
                      style={{
                        borderColor: drone.color,
                        boxShadow: `0 0 20px ${drone.color}40`
                      }}
                    />

                    {/* Pulse Effect */}
                    <div
                      className="absolute -inset-4 rounded-full animate-ping opacity-30"
                      style={{ backgroundColor: drone.color }}
                    />

                    {/* Drone Icon */}
                    <svg viewBox="0 0 32 32" className="w-8 h-8">
                      {/* Drone body */}
                      <circle cx="16" cy="16" r="4" fill={drone.color} stroke="white" strokeWidth="1" />

                      {/* Arms */}
                      <line x1="16" y1="16" x2="8" y2="8" stroke={drone.color} strokeWidth="1.5" />
                      <line x1="16" y1="16" x2="24" y2="8" stroke={drone.color} strokeWidth="1.5" />
                      <line x1="16" y1="16" x2="8" y2="24" stroke={drone.color} strokeWidth="1.5" />
                      <line x1="16" y1="16" x2="24" y2="24" stroke={drone.color} strokeWidth="1.5" />

                      {/* Rotors */}
                      <circle cx="8" cy="8" r="2.5" fill={drone.color} stroke="white" strokeWidth="1" className="animate-spin" style={{ transformOrigin: '8px 8px' }} />
                      <circle cx="24" cy="8" r="2.5" fill={drone.color} stroke="white" strokeWidth="1" className="animate-spin" style={{ transformOrigin: '24px 8px' }} />
                      <circle cx="8" cy="24" r="2.5" fill={drone.color} stroke="white" strokeWidth="1" className="animate-spin" style={{ transformOrigin: '8px 24px' }} />
                      <circle cx="24" cy="24" r="2.5" fill={drone.color} stroke="white" strokeWidth="1" className="animate-spin" style={{ transformOrigin: '24px 24px' }} />
                    </svg>

                    {/* Tooltip */}
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#0D1B2E] border border-blue-400/30 rounded px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                      <p className="text-[10px] text-white font-mono font-bold">{drone.id} • {drone.name}</p>
                      <p className="text-[9px] text-cyan-300 font-mono">ALT {Math.round(drone.altitude)}m • SPD {Math.round(drone.speed)} km/h</p>
                      <p className="text-[9px] text-emerald-300 font-mono">Battery: {Math.round(drone.battery)}%</p>
                    </div>
                  </motion.div>
                </Marker>
              )
            })}
          </Map>

          {/* Map Overlay Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 via-transparent to-blue-900/5 pointer-events-none" />

          {/* Scanning Line Effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-[scan_4s_ease-in-out_infinite]" />
        </div>

        {/* RIGHT PANEL - MISSION CONTROL */}
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-80 bg-[#0A1628]/80 backdrop-blur-sm border-l border-blue-900/30 flex flex-col"
        >
          <div className="p-4 border-b border-blue-900/30">
            <h2 className="text-xs font-bold text-cyan-300 font-mono tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4" />
              MISSION CONTROL
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#0D1B2E]/60 border border-emerald-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400/70 font-mono uppercase">Active</span>
                </div>
                <p className="text-2xl font-bold text-emerald-300 font-mono">{activeDrones.length}</p>
              </div>

              <div className="bg-[#0D1B2E]/60 border border-cyan-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] text-cyan-400/70 font-mono uppercase">Complete</span>
                </div>
                <p className="text-2xl font-bold text-cyan-300 font-mono">12</p>
              </div>

              <div className="bg-[#0D1B2E]/60 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-3 h-3 text-blue-400" />
                  <span className="text-[10px] text-blue-400/70 font-mono uppercase">Data</span>
                </div>
                <p className="text-lg font-bold text-blue-300 font-mono">2.4 TB</p>
              </div>

              <div className="bg-[#0D1B2E]/60 border border-purple-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3 h-3 text-purple-400" />
                  <span className="text-[10px] text-purple-400/70 font-mono uppercase">Coverage</span>
                </div>
                <p className="text-lg font-bold text-purple-300 font-mono">68%</p>
              </div>
            </div>

            {/* Alert Level */}
            <div className="bg-[#0D1B2E]/60 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-yellow-400 font-mono uppercase font-bold">Alert Level</span>
                <span className="text-[10px] text-yellow-300 font-mono">MODERATE</span>
              </div>
              <div className="h-2 bg-blue-900/30 rounded-full overflow-hidden">
                <div className="h-full w-[45%] bg-gradient-to-r from-green-500 via-yellow-500 to-yellow-500 rounded-full" />
              </div>
            </div>

            {/* Weather */}
            <div className="bg-[#0D1B2E]/60 border border-blue-500/30 rounded-lg p-3">
              <h3 className="text-[10px] text-blue-400 font-mono uppercase font-bold mb-3">Weather Conditions</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-blue-300">
                    <Thermometer className="w-3 h-3" />
                    <span className="font-mono">Temperature</span>
                  </div>
                  <span className="font-mono text-white">24°C</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-blue-300">
                    <Wind className="w-3 h-3" />
                    <span className="font-mono">Wind Speed</span>
                  </div>
                  <span className="font-mono text-white">12 km/h</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-blue-300">
                    <Cloud className="w-3 h-3" />
                    <span className="font-mono">Conditions</span>
                  </div>
                  <span className="font-mono text-white">Clear</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-blue-300">
                    <Eye className="w-3 h-3" />
                    <span className="font-mono">Visibility</span>
                  </div>
                  <span className="font-mono text-white">15 km</span>
                </div>
              </div>
            </div>

            {/* Selected Drone Details */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/50 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] text-cyan-300 font-mono uppercase font-bold">Selected Drone</h3>
                    <button
                      onClick={() => setSelectedDrone(null)}
                      className="text-blue-400 hover:text-white transition-colors"
                    >
                      <span className="text-xs">✕</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-bold text-white font-mono">{selected.id}</p>
                      <p className="text-[10px] text-blue-300 font-mono">{selected.name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div>
                        <span className="text-blue-400">Model:</span>
                        <p className="text-white text-[9px]">{selected.model}</p>
                      </div>
                      <div>
                        <span className="text-blue-400">Type:</span>
                        <p className="text-white uppercase">{selected.type}</p>
                      </div>
                      <div>
                        <span className="text-blue-400">Altitude:</span>
                        <p className="text-cyan-300 font-bold">{Math.round(selected.altitude)}m</p>
                      </div>
                      <div>
                        <span className="text-blue-400">Speed:</span>
                        <p className="text-cyan-300 font-bold">{Math.round(selected.speed)} km/h</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-blue-400">Battery:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-blue-900/30 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                selected.battery > 60 ? 'bg-green-500' :
                                selected.battery > 30 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${selected.battery}%` }}
                            />
                          </div>
                          <span className="text-white font-bold text-[10px]">{Math.round(selected.battery)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-blue-400/30">
                      <span className="text-[10px] text-blue-400 font-mono">Mission:</span>
                      <p className="text-[10px] text-white font-mono mt-1">{selected.mission}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forest Coverage Info */}
            <div className="bg-[#0D1B2E]/60 border border-green-500/30 rounded-lg p-3">
              <h3 className="text-[10px] text-green-400 font-mono uppercase font-bold mb-2">Protected Areas</h3>
              <div className="space-y-1.5">
                {FORESTS.map((forest) => (
                  <div key={forest.name} className="flex items-center justify-between text-[10px]">
                    <span className="text-blue-300 font-mono text-[9px]">{forest.name}</span>
                    <span className="text-white font-mono font-bold">{forest.area} km²</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM BAR - ACTIVITY FEED */}
      <div className="h-12 bg-[#0A1628]/80 backdrop-blur-sm border-t border-blue-900/30 flex items-center px-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,170,255,0.02)_50%,transparent_100%)] animate-[shimmer_3s_infinite]" />

        <div className="flex items-center gap-2 mr-4 relative z-10">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] text-cyan-300 font-mono font-bold uppercase">Live Feed</span>
        </div>

        <div className="flex-1 overflow-hidden relative z-10">
          <motion.div
            className="flex gap-6"
            animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {[...events, ...events].slice(0, 20).map((event, idx) => (
              <div key={`${event.id}-${idx}`} className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-[10px] text-blue-500 font-mono">[{formatTime(event.timestamp)}]</span>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  event.type === 'alert' ? 'bg-red-400' :
                  event.type === 'warning' ? 'bg-yellow-400' :
                  event.type === 'success' ? 'bg-green-400' :
                  'bg-blue-400'
                }`} />
                <span className="text-[10px] text-blue-200 font-mono">{event.message}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
