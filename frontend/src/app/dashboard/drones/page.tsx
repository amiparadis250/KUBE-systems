'use client'

import dynamic from 'next/dynamic'

const DroneControlCenter = dynamic(
  () => import('@/components/drones/DroneControlCenter'),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-[#040810] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-400 font-mono text-sm tracking-wider">INITIALIZING DRONE CONTROL CENTER...</p>
        </div>
      </div>
    )
  }
)

export default function DronesPage() {
  return <DroneControlCenter />
}
