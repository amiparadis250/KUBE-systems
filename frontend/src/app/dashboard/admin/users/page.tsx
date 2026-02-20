'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, UserCheck, Building2, UserX, Search, Filter,
  Mail, Phone, MapPin, Calendar, Shield, Edit, Trash2,
  CheckCircle, XCircle, Clock, TrendingUp, BarChart3,
  Download, RefreshCw, Eye, Ban, UserPlus, ArrowLeft
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: string
  status: string
  businessType?: string
  services?: string[]
  companyName?: string
  organization?: string
  createdAt: string
  lastLoginAt?: string
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#FF3366',
  FARMER: '#00CC66',
  RANGER: '#FFAA00',
  ANALYST: '#00AAFF'
}

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: any }> = {
  ACTIVE: { bg: 'bg-green-500/20', text: 'text-green-300', icon: CheckCircle },
  SUSPENDED: { bg: 'bg-red-500/20', text: 'text-red-300', icon: XCircle },
  PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', icon: Clock }
}

export default function UserManagementPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'FARMER',
    businessType: 'B2C' as 'B2B' | 'B2C',
    services: [] as string[],
    companyName: '',
    organization: ''
  })

  // Check admin access
  useEffect(() => {
    if (currentUser && currentUser.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [currentUser, router])

  // Fetch users
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.getUsers()
      setUsers(response.data.users || [])
      setFilteredUsers(response.data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    try {
      setLoading(true)
      await api.createUser(newUser)
      await fetchUsers()
      setShowAddModal(false)
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'FARMER',
        businessType: 'B2C',
        services: [],
        companyName: '',
        organization: ''
      })
      alert('User created successfully!')
    } catch (error: any) {
      console.error('Failed to create user:', error)
      alert(error.response?.data?.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  // Filter users
  useEffect(() => {
    let filtered = users

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(u =>
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(u => u.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(u => u.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }, [searchQuery, roleFilter, statusFilter, users])

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    b2b: users.filter(u => u.businessType === 'B2B').length,
    b2c: users.filter(u => u.businessType === 'B2C').length,
    byRole: {
      ADMIN: users.filter(u => u.role === 'ADMIN').length,
      FARMER: users.filter(u => u.role === 'FARMER').length,
      RANGER: users.filter(u => u.role === 'RANGER').length,
      ANALYST: users.filter(u => u.role === 'ANALYST').length
    }
  }

  if (currentUser?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-[#040810] text-white p-6">
      {/* Header */}
      <div className="max-w-[1800px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Back</span>
              </motion.button>
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="w-7 h-7 text-cyan-400" />
              User Management Center
            </h1>
            <p className="text-sm text-blue-400/70 mt-1 font-mono">Administrator Control Panel</p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30 hover:bg-cyan-500/20 transition-all"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm text-cyan-300 font-mono">Refresh</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-400/30 hover:bg-blue-500/20 transition-all"
            >
              <UserPlus className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300 font-mono">Add User</span>
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
              <Users className="w-8 h-8 text-cyan-400" />
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white font-mono">{stats.total}</p>
            <p className="text-xs text-cyan-400/70 font-mono uppercase mt-1">Total Users</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="w-8 h-8 text-green-400" />
              <span className="text-xs text-green-300 font-mono">{Math.round((stats.active / stats.total) * 100)}%</span>
            </div>
            <p className="text-3xl font-bold text-white font-mono">{stats.active}</p>
            <p className="text-xs text-green-400/70 font-mono uppercase mt-1">Active Users</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-8 h-8 text-purple-400" />
              <span className="text-xs text-purple-300 font-mono">B2B</span>
            </div>
            <p className="text-3xl font-bold text-white font-mono">{stats.b2b}</p>
            <p className="text-xs text-purple-400/70 font-mono uppercase mt-1">Business Accounts</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-400/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-orange-400" />
              <span className="text-xs text-orange-300 font-mono">B2C</span>
            </div>
            <p className="text-3xl font-bold text-white font-mono">{stats.b2c}</p>
            <p className="text-xs text-orange-400/70 font-mono uppercase mt-1">Individual Users</p>
          </motion.div>
        </div>

        {/* Filters & Search */}
        <div className="bg-[#0A1628]/50 border border-blue-900/30 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0D1B2E] border border-blue-500/30 rounded-lg text-white placeholder-blue-400/50 focus:outline-none focus:border-cyan-400/50 font-mono text-sm"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0D1B2E] border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 font-mono text-sm appearance-none cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="FARMER">Farmer</option>
                <option value="RANGER">Ranger</option>
                <option value="ANALYST">Analyst</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0D1B2E] border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 font-mono text-sm appearance-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-[#0A1628]/50 border border-blue-900/30 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0D1B2E] border-b border-blue-900/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Registered</th>
                  <th className="px-6 py-3 text-left text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/20">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center gap-2 text-blue-400">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span className="font-mono text-sm">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-blue-400/50 font-mono text-sm">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => {
                    const StatusIcon = STATUS_COLORS[user.status]?.icon || CheckCircle
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-blue-500/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                              <p className="text-xs text-blue-400/70 font-mono">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="px-2 py-1 rounded text-xs font-mono font-bold uppercase"
                            style={{
                              backgroundColor: `${ROLE_COLORS[user.role]}20`,
                              color: ROLE_COLORS[user.role]
                            }}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-blue-300 font-mono">{user.businessType || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-blue-200 max-w-[200px] truncate">{user.companyName || user.organization || '-'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${STATUS_COLORS[user.status]?.bg} w-fit`}>
                            <StatusIcon className={`w-3 h-3 ${STATUS_COLORS[user.status]?.text}`} />
                            <span className={`text-xs font-mono ${STATUS_COLORS[user.status]?.text}`}>{user.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-blue-400/70 font-mono">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="p-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 transition-all"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-cyan-400" />
                            </button>
                            <button
                              className="p-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 transition-all"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4 text-blue-400" />
                            </button>
                            {user.status === 'ACTIVE' && (
                              <button
                                className="p-1.5 rounded bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-400/30 transition-all"
                                title="Suspend User"
                              >
                                <Ban className="w-4 h-4 text-yellow-400" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Details Modal */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedUser(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0A1628] border border-cyan-400/30 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-cyan-400" />
                    User Details
                  </h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-blue-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-4 p-4 bg-[#0D1B2E] rounded-lg border border-blue-500/20">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                      {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{selectedUser.firstName} {selectedUser.lastName}</h3>
                      <p className="text-sm text-blue-400 font-mono">{selectedUser.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase"
                          style={{
                            backgroundColor: `${ROLE_COLORS[selectedUser.role]}20`,
                            color: ROLE_COLORS[selectedUser.role]
                          }}
                        >
                          {selectedUser.role}
                        </span>
                        <span className="text-xs text-blue-400 font-mono">{selectedUser.businessType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[#0D1B2E] rounded-lg border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs text-cyan-400/70 font-mono uppercase">Email</span>
                      </div>
                      <p className="text-sm text-white font-mono">{selectedUser.email}</p>
                    </div>

                    <div className="p-3 bg-[#0D1B2E] rounded-lg border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400/70 font-mono uppercase">Phone</span>
                      </div>
                      <p className="text-sm text-white font-mono">{selectedUser.phone || 'N/A'}</p>
                    </div>

                    <div className="p-3 bg-[#0D1B2E] rounded-lg border border-blue-500/20 col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-purple-400/70 font-mono uppercase">Organization</span>
                      </div>
                      <p className="text-sm text-white">{selectedUser.companyName || selectedUser.organization || 'N/A'}</p>
                    </div>

                    <div className="p-3 bg-[#0D1B2E] rounded-lg border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-blue-400/70 font-mono uppercase">Registered</span>
                      </div>
                      <p className="text-sm text-white font-mono">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="p-3 bg-[#0D1B2E] rounded-lg border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-orange-400/70 font-mono uppercase">Last Login</span>
                      </div>
                      <p className="text-sm text-white font-mono">
                        {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>

                  {/* Services */}
                  {selectedUser.services && selectedUser.services.length > 0 && (
                    <div className="p-3 bg-[#0D1B2E] rounded-lg border border-blue-500/20">
                      <p className="text-xs text-cyan-400/70 font-mono uppercase mb-2">Subscribed Services</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.services.map((service: string) => (
                          <span
                            key={service}
                            className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-400/30 text-xs text-cyan-300 font-mono"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-blue-900/30">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-400/30 hover:bg-blue-500/20 transition-all">
                      <Edit className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-blue-300 font-mono">Edit User</span>
                    </button>
                    {selectedUser.status === 'ACTIVE' && (
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-400/30 hover:bg-yellow-500/20 transition-all">
                        <Ban className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-yellow-300 font-mono">Suspend</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add User Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0D1B2E] border border-blue-500/30 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Add New User</h2>

                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-4 py-2 bg-[#040810] border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white"
                      placeholder="user@example.com"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full px-4 py-2 bg-[#040810] border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white"
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>

                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        First Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                        className="w-full px-4 py-2 bg-[#040810] border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                        className="w-full px-4 py-2 bg-[#040810] border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-[#040810] border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white"
                      placeholder="+250 XXX XXX XXX"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Role <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full px-4 py-2 bg-[#040810] border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white"
                    >
                      <option value="FARMER">Farmer</option>
                      <option value="RANGER">Ranger</option>
                      <option value="ANALYST">Analyst</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  {/* Business Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Business Type
                    </label>
                    <select
                      value={newUser.businessType}
                      onChange={(e) => setNewUser({ ...newUser, businessType: e.target.value as 'B2B' | 'B2C' })}
                      className="w-full px-4 py-2 bg-[#040810] border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white"
                    >
                      <option value="B2C">B2C (Individual)</option>
                      <option value="B2B">B2B (Business)</option>
                    </select>
                  </div>

                  {/* Services */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Services
                    </label>
                    <div className="space-y-2">
                      {['KUBE_FARM', 'KUBE_PARK', 'KUBE_LAND'].map((service) => (
                        <label key={service} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newUser.services.includes(service)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewUser({ ...newUser, services: [...newUser.services, service] })
                              } else {
                                setNewUser({ ...newUser, services: newUser.services.filter(s => s !== service) })
                              }
                            }}
                            className="w-4 h-4 bg-[#040810] border-gray-700 rounded focus:ring-cyan-400"
                          />
                          <span className="text-gray-300">{service.replace('_', '-')}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddUser}
                      disabled={loading || !newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Create User'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
