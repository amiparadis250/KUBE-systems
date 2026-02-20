/**
 * API Client for KUBE Platform
 * Handles all API requests with authentication
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      const token = this.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearToken()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // Token management
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kube_token')
    }
    return null
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kube_token', token)
    }
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kube_token')
    }
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password })
    if (response.data.data.token) {
      this.setToken(response.data.data.token)
    }
    return response.data
  }

  async register(data: any) {
    const response = await this.client.post('/auth/register', data)
    if (response.data.data.token) {
      this.setToken(response.data.data.token)
    }
    return response.data
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile')
    return response.data
  }

  async updateProfile(data: any) {
    const response = await this.client.put('/auth/profile', data)
    return response.data
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.client.post('/auth/change-password', {
      currentPassword,
      newPassword
    })
    return response.data
  }

  logout() {
    this.clearToken()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  // Farms (KUBE-Farm)
  async getFarms() {
    const response = await this.client.get('/farms')
    return response.data
  }

  async getFarmById(id: string) {
    const response = await this.client.get(`/farms/${id}`)
    return response.data
  }

  async createFarm(data: any) {
    const response = await this.client.post('/farms', data)
    return response.data
  }

  async getHerds(farmId: string) {
    const response = await this.client.get(`/farms/${farmId}/herds`)
    return response.data
  }

  async getAnimals(herdId: string) {
    const response = await this.client.get(`/farms/herds/${herdId}/animals`)
    return response.data
  }

  async getAnimalById(id: string) {
    const response = await this.client.get(`/farms/animals/${id}`)
    return response.data
  }

  // Parks (KUBE-Park)
  async getParks() {
    const response = await this.client.get('/parks')
    return response.data
  }

  async getParkById(id: string) {
    const response = await this.client.get(`/parks/${id}`)
    return response.data
  }

  async getWildlife(parkId: string) {
    const response = await this.client.get(`/parks/${parkId}/wildlife`)
    return response.data
  }

  async getPatrols(parkId: string) {
    const response = await this.client.get(`/parks/${parkId}/patrols`)
    return response.data
  }

  async getIncidents(parkId: string) {
    const response = await this.client.get(`/parks/${parkId}/incidents`)
    return response.data
  }

  // Land (KUBE-Land)
  async getLandZones() {
    const response = await this.client.get('/land/zones')
    return response.data
  }

  async getLandZoneById(id: string) {
    const response = await this.client.get(`/land/zones/${id}`)
    return response.data
  }

  async getLandSurveys(zoneId: string) {
    const response = await this.client.get(`/land/zones/${zoneId}/surveys`)
    return response.data
  }

  async getLandChanges(zoneId: string) {
    const response = await this.client.get(`/land/zones/${zoneId}/changes`)
    return response.data
  }

  // Alerts
  async getAlerts(params?: any) {
    const response = await this.client.get('/alerts', { params })
    return response.data
  }

  async getAlertById(id: string) {
    const response = await this.client.get(`/alerts/${id}`)
    return response.data
  }

  async getAlertStats() {
    const response = await this.client.get('/alerts/stats')
    return response.data
  }

  async updateAlertStatus(id: string, status: string, actionTaken?: string) {
    const response = await this.client.put(`/alerts/${id}/status`, {
      status,
      actionTaken
    })
    return response.data
  }

  // Dashboard
  async getDashboardOverview() {
    const response = await this.client.get('/dashboard/overview')
    return response.data
  }

  async getFarmDashboard() {
    const response = await this.client.get('/dashboard/farm')
    return response.data
  }

  async getParkDashboard() {
    const response = await this.client.get('/dashboard/park')
    return response.data
  }

  async getLandDashboard() {
    const response = await this.client.get('/dashboard/land')
    return response.data
  }

  // Reports
  async getReports() {
    const response = await this.client.get('/reports')
    return response.data
  }

  async getReportById(id: string) {
    const response = await this.client.get(`/reports/${id}`)
    return response.data
  }

  async generateReport(data: any) {
    const response = await this.client.post('/reports', data)
    return response.data
  }

  // Users
  async getUsers() {
    const response = await this.client.get('/users')
    return response.data
  }

  async getUserById(id: string) {
    const response = await this.client.get(`/users/${id}`)
    return response.data
  }

  async createUser(data: any) {
    const response = await this.client.post('/users', data)
    return response.data
  }

  async updateUser(id: string, data: any) {
    const response = await this.client.put(`/users/${id}`, data)
    return response.data
  }
}

// Export singleton instance
export const api = new ApiClient()
export default api
