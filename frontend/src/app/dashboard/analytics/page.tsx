'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Brain, TrendingUp, AlertTriangle, CheckCircle, Download,
  FileText, Filter, Calendar, ArrowLeft, BarChart3, Activity,
  Target, Zap, Eye, Shield, Layers, Database, RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Mock Data
const MODEL_PERFORMANCE = {
  overall: { accuracy: 94.2, precision: 92.8, recall: 95.1, f1Score: 93.9 },
  animalDetection: { accuracy: 96.5, precision: 95.2, recall: 97.1, f1Score: 96.1 },
  healthAssessment: { accuracy: 91.3, precision: 89.8, recall: 92.4, f1Score: 91.1 },
  wildlifeClassification: { accuracy: 94.8, precision: 93.5, recall: 95.6, f1Score: 94.5 }
}

const SPECIES_RECOGNITION = [
  { species: 'Cattle', accuracy: 98.2, detections: 1247, falsePositives: 12 },
  { species: 'Elephant', accuracy: 96.8, detections: 342, falsePositives: 8 },
  { species: 'Lion', accuracy: 94.5, detections: 156, falsePositives: 7 },
  { species: 'Giraffe', accuracy: 95.3, detections: 278, falsePositives: 11 },
  { species: 'Zebra', accuracy: 93.7, detections: 412, falsePositives: 19 },
  { species: 'Buffalo', accuracy: 92.1, detections: 534, falsePositives: 24 },
  { species: 'Goat', accuracy: 89.6, detections: 623, falsePositives: 38 }
]

const TREND_DATA = [
  { month: 'Jan', diseaseRisk: 12, mortalityRisk: 3, grazingCapacity: 85 },
  { month: 'Feb', diseaseRisk: 15, mortalityRisk: 4, grazingCapacity: 82 },
  { month: 'Mar', diseaseRisk: 18, mortalityRisk: 5, grazingCapacity: 78 },
  { month: 'Apr', diseaseRisk: 22, mortalityRisk: 6, grazingCapacity: 75 },
  { month: 'May', diseaseRisk: 19, mortalityRisk: 5, grazingCapacity: 79 },
  { month: 'Jun', diseaseRisk: 16, mortalityRisk: 4, grazingCapacity: 83 },
  { month: 'Jul', diseaseRisk: 14, mortalityRisk: 3, grazingCapacity: 86 },
  { month: 'Aug', diseaseRisk: 13, mortalityRisk: 3, grazingCapacity: 88 }
]

const DETECTION_TIMELINE = [
  { date: 'Week 1', detections: 1247, errors: 23, accuracy: 98.2 },
  { date: 'Week 2', detections: 1312, errors: 19, accuracy: 98.6 },
  { date: 'Week 3', detections: 1198, errors: 21, accuracy: 98.3 },
  { date: 'Week 4', detections: 1425, errors: 17, accuracy: 98.8 }
]

export default function AnalyticsPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')
  const [reportType, setReportType] = useState<'livestock' | 'wildlife' | 'comprehensive'>('comprehensive')

  const COLORS = {
    primary: '#00AAFF',
    success: '#00DD66',
    warning: '#FFAA00',
    danger: '#FF3366',
    purple: '#AA44FF',
    cyan: '#00DDFF'
  }

  const handleExportReport = (format: 'pdf' | 'excel') => {
    alert(`Exporting ${reportType} report as ${format.toUpperCase()}...`)
  }

  return (
    <div className="min-h-screen bg-[#040810] text-white p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 rounded border border-blue-500/30 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-blue-400" />
              </button>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Brain className="w-7 h-7 text-cyan-400" />
                AI & Analytics Center
              </h1>
            </div>
            <p className="text-sm text-blue-400/70 font-mono ml-14">Model Performance & Intelligence Insights</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 rounded-lg bg-[#0D1B2E] border border-blue-500/30 text-white text-sm font-mono focus:outline-none focus:border-cyan-400/50"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30 hover:bg-cyan-500/20 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-300 font-mono">Refresh</span>
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-cyan-400" />
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white font-mono">{MODEL_PERFORMANCE.overall.accuracy}%</p>
            <p className="text-xs text-cyan-400/70 font-mono uppercase mt-1">Overall Accuracy</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-xs text-green-300 font-mono">+2.3%</span>
            </div>
            <p className="text-3xl font-bold text-white font-mono">{MODEL_PERFORMANCE.overall.precision}%</p>
            <p className="text-xs text-green-400/70 font-mono uppercase mt-1">Precision Rate</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-purple-400" />
              <span className="text-xs text-purple-300 font-mono">+1.8%</span>
            </div>
            <p className="text-3xl font-bold text-white font-mono">{MODEL_PERFORMANCE.overall.recall}%</p>
            <p className="text-xs text-purple-400/70 font-mono uppercase mt-1">Recall Rate</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-400/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-8 h-8 text-orange-400" />
              <span className="text-xs text-orange-300 font-mono">98.6%</span>
            </div>
            <p className="text-3xl font-bold text-white font-mono">4,892</p>
            <p className="text-xs text-orange-400/70 font-mono uppercase mt-1">Total Detections</p>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Model Performance Radar */}
          <div className="bg-[#0A1628]/50 border border-blue-900/30 rounded-lg p-6">
            <h3 className="text-sm font-bold text-cyan-300 font-mono mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              MODEL PERFORMANCE BREAKDOWN
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={[
                { metric: 'Accuracy', value: MODEL_PERFORMANCE.overall.accuracy },
                { metric: 'Precision', value: MODEL_PERFORMANCE.overall.precision },
                { metric: 'Recall', value: MODEL_PERFORMANCE.overall.recall },
                { metric: 'F1 Score', value: MODEL_PERFORMANCE.overall.f1Score },
                { metric: 'Speed', value: 91.5 },
                { metric: 'Reliability', value: 96.2 }
              ]}>
                <PolarGrid stroke="#0066FF30" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#00AAFF', fontSize: 11, fontFamily: 'monospace' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#0066FF80', fontSize: 10 }} />
                <Radar name="Performance" dataKey="value" stroke={COLORS.cyan} fill={COLORS.cyan} fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Species Recognition Accuracy */}
          <div className="bg-[#0A1628]/50 border border-blue-900/30 rounded-lg p-6">
            <h3 className="text-sm font-bold text-cyan-300 font-mono mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              SPECIES RECOGNITION ACCURACY
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={SPECIES_RECOGNITION}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0066FF20" />
                <XAxis dataKey="species" tick={{ fill: '#00AAFF', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis tick={{ fill: '#0066FF80', fontSize: 10 }} domain={[80, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D1B2E', border: '1px solid #00AAFF50', borderRadius: '8px' }}
                  labelStyle={{ color: '#00DDFF', fontFamily: 'monospace', fontSize: '12px' }}
                />
                <Bar dataKey="accuracy" fill={COLORS.success} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trends & Forecasts */}
        <div className="bg-[#0A1628]/50 border border-blue-900/30 rounded-lg p-6 mb-6">
          <h3 className="text-sm font-bold text-cyan-300 font-mono mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            PREDICTIVE TRENDS & FORECASTS
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0066FF20" />
              <XAxis dataKey="month" tick={{ fill: '#00AAFF', fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis tick={{ fill: '#0066FF80', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0D1B2E', border: '1px solid #00AAFF50', borderRadius: '8px' }}
                labelStyle={{ color: '#00DDFF', fontFamily: 'monospace', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }} />
              <Line type="monotone" dataKey="diseaseRisk" stroke={COLORS.danger} strokeWidth={3} dot={{ r: 5 }} name="Disease Risk %" />
              <Line type="monotone" dataKey="mortalityRisk" stroke={COLORS.warning} strokeWidth={3} dot={{ r: 5 }} name="Mortality Risk %" />
              <Line type="monotone" dataKey="grazingCapacity" stroke={COLORS.success} strokeWidth={3} dot={{ r: 5 }} name="Grazing Capacity %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Detection Timeline & Report Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Detection Timeline */}
          <div className="lg:col-span-2 bg-[#0A1628]/50 border border-blue-900/30 rounded-lg p-6">
            <h3 className="text-sm font-bold text-cyan-300 font-mono mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              DETECTION TIMELINE & ERROR RATE
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={DETECTION_TIMELINE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0066FF20" />
                <XAxis dataKey="date" tick={{ fill: '#00AAFF', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis yAxisId="left" tick={{ fill: '#0066FF80', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#FF336680', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D1B2E', border: '1px solid #00AAFF50', borderRadius: '8px' }}
                  labelStyle={{ color: '#00DDFF', fontFamily: 'monospace', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }} />
                <Bar yAxisId="left" dataKey="detections" fill={COLORS.primary} radius={[8, 8, 0, 0]} name="Detections" />
                <Bar yAxisId="right" dataKey="errors" fill={COLORS.danger} radius={[8, 8, 0, 0]} name="Errors" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Report Generator */}
          <div className="bg-gradient-to-br from-[#0A1628] to-[#0D1B2E] border border-blue-900/30 rounded-lg p-6">
            <h3 className="text-sm font-bold text-cyan-300 font-mono mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              REPORT GENERATOR
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-cyan-400/70 font-mono mb-2 uppercase">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#0D1B2E] border border-blue-500/30 rounded text-white text-sm font-mono focus:outline-none focus:border-cyan-400/50"
                >
                  <option value="livestock">Livestock Health Summary</option>
                  <option value="wildlife">Wildlife Census Report</option>
                  <option value="comprehensive">Comprehensive Analytics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-cyan-400/70 font-mono mb-2 uppercase">Time Period</label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#0D1B2E] border border-blue-500/30 rounded text-white text-sm font-mono focus:outline-none focus:border-cyan-400/50"
                >
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                  <option value="year">Annual</option>
                </select>
              </div>

              <div className="pt-4 border-t border-blue-900/30 space-y-2">
                <button
                  onClick={() => handleExportReport('pdf')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-400/30 hover:bg-red-500/20 text-red-300 font-mono text-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export as PDF
                </button>
                <button
                  onClick={() => handleExportReport('excel')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-400/30 hover:bg-green-500/20 text-green-300 font-mono text-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export as Excel
                </button>
              </div>

              <div className="text-[10px] text-blue-400/50 font-mono pt-2">
                Reports include model performance, detection logs, and trend analysis.
              </div>
            </div>
          </div>
        </div>

        {/* Detection Statistics Table */}
        <div className="mt-6 bg-[#0A1628]/50 border border-blue-900/30 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-blue-900/30">
            <h3 className="text-sm font-bold text-cyan-300 font-mono flex items-center gap-2">
              <Database className="w-4 h-4" />
              SPECIES DETECTION STATISTICS
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0D1B2E] border-b border-blue-900/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-mono font-bold text-cyan-400 uppercase">Species</th>
                  <th className="px-6 py-3 text-left text-xs font-mono font-bold text-cyan-400 uppercase">Accuracy</th>
                  <th className="px-6 py-3 text-left text-xs font-mono font-bold text-cyan-400 uppercase">Total Detections</th>
                  <th className="px-6 py-3 text-left text-xs font-mono font-bold text-cyan-400 uppercase">False Positives</th>
                  <th className="px-6 py-3 text-left text-xs font-mono font-bold text-cyan-400 uppercase">Error Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/20">
                {SPECIES_RECOGNITION.map((species, index) => {
                  const errorRate = ((species.falsePositives / species.detections) * 100).toFixed(2)
                  return (
                    <motion.tr
                      key={species.species}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-blue-500/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-white">{species.species}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-blue-900/30 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                              style={{ width: `${species.accuracy}%` }}
                            />
                          </div>
                          <span className="text-sm text-green-300 font-mono font-bold">{species.accuracy}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-cyan-300 font-mono">{species.detections.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-orange-300 font-mono">{species.falsePositives}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-mono ${
                          parseFloat(errorRate) < 1 ? 'text-green-300' :
                          parseFloat(errorRate) < 2 ? 'text-yellow-300' :
                          'text-red-300'
                        }`}>
                          {errorRate}%
                        </span>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
