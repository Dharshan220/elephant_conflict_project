import axios from 'axios'
import type {
  DashboardResponse,
  AlertItem,
  Detection,
  Device,
  PredictionsResponse,
  AnalyticsResponse,
  ReportData,
  SimulateResponse,
  Zone,
  Officer,
  UserInfo,
  AuthResponse,
  CameraItem,
  AlertRecord,
  EmergencyContact,
  AdminStats,
  RegisterPayload,
} from '../types'
import { genDashboard } from '../mockData/dashboard'
import { genAlerts } from '../mockData/alerts'
import { genHistory } from '../mockData/history'
import { DEVICES } from '../mockData/static'
import { genPredictions } from '../mockData/predictions'
import { genAnalytics } from '../mockData/analytics'

const API = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000',
  timeout: 4000,
})

let backendOnline = false

const TOKEN_KEY = 'tuskerguard-token'

export function authToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

// Attach the JWT to every request when present.
API.interceptors.request.use((config) => {
  const token = authToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function isBackendOnline(): boolean {
  return backendOnline
}

export function setBackendOnline(v: boolean) {
  backendOnline = v
}

async function guarded<T>(fn: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    const res = await fn()
    backendOnline = true
    return res
  } catch {
    backendOnline = false
    return fallback()
  }
}

export const api = {
  fetchDashboard: (): Promise<DashboardResponse> =>
    guarded(async () => (await API.get<DashboardResponse>('/api/dashboard')).data, genDashboard),

  fetchAlerts: (): Promise<AlertItem[]> =>
    guarded(async () => (await API.get<AlertItem[]>('/api/alerts')).data, genAlerts),

  fetchHistory: (): Promise<Detection[]> =>
    guarded(async () => (await API.get<Detection[]>('/api/history')).data, genHistory),

  fetchDevices: (): Promise<Device[]> =>
    guarded(async () => (await API.get<Device[]>('/api/devices')).data, () => DEVICES),

  fetchPredictions: (): Promise<PredictionsResponse> =>
    guarded(async () => (await API.get<PredictionsResponse>('/api/predictions')).data, genPredictions),

  fetchAnalytics: (): Promise<AnalyticsResponse> =>
    guarded(async () => (await API.get<AnalyticsResponse>('/api/analytics')).data, genAnalytics),

  fetchZones: (): Promise<Zone[]> =>
    guarded(async () => (await API.get<Zone[]>('/api/zones')).data, () => []),

  fetchOfficers: (): Promise<Officer[]> =>
    guarded(async () => (await API.get<Officer[]>('/api/officers')).data, () => []),

  sendMotion: (zoneId: string): Promise<SimulateResponse> =>
    guarded(async () => (await API.post<SimulateResponse>('/api/motion', { zone_id: zoneId })).data, () => ({
      accepted: true,
      eventId: 'sim_' + Date.now(),
      message: 'Motion event queued (demo mode)',
    })),

  sendDetection: (payload: Partial<Detection>): Promise<SimulateResponse> =>
    guarded(async () => (await API.post<SimulateResponse>('/api/detection', payload)).data, () => ({
      accepted: true,
      eventId: 'det_sim_' + Date.now(),
      message: 'Detection ingested (demo mode)',
    })),

  raiseAlert: (zoneId: string): Promise<SimulateResponse> =>
    guarded(async () => (await API.post<SimulateResponse>('/api/alert', { zone_id: zoneId })).data, () => ({
      accepted: true,
      eventId: 'al_sim_' + Date.now(),
      message: 'Test alert raised (demo mode)',
    })),

  acknowledgeAlert: (alertId: string): Promise<{ ok: boolean }> =>
    guarded(async () => (await API.post<{ ok: boolean }>(`/api/alerts/${alertId}/ack`)).data, () => ({ ok: true })),

  markDetectionSafe: (detectionId: string): Promise<{ ok: boolean }> =>
    guarded(async () => (await API.post<{ ok: boolean }>(`/api/detection/${detectionId}/safe`)).data, () => ({ ok: true })),

  fetchReport: (): Promise<ReportData> =>
    guarded(async () => (await API.get<ReportData>('/api/report')).data, () => mockReport()),

  setSimulation: (on: boolean): Promise<{ running: boolean }> =>
    guarded(async () => (await API.get<{ running: boolean }>(`/api/simulate?on=${on}`)).data, () => ({ running: on })),

  // ---- Elephant Early Warning System ----
  login: (email: string, password: string): Promise<AuthResponse> =>
    guarded(async () => (await API.post<AuthResponse>('/api/auth/login', { email, password })).data, () => {
      throw new Error('Backend offline')
    }),

  register: (payload: RegisterPayload): Promise<AuthResponse> =>
    guarded(async () => (await API.post<AuthResponse>('/api/auth/register', payload)).data, () => {
      throw new Error('Backend offline')
    }),

  me: (): Promise<UserInfo> =>
    guarded(async () => (await API.get<UserInfo>('/api/me')).data, () => {
      throw new Error('Backend offline')
    }),

  fetchCameras: (): Promise<CameraItem[]> =>
    guarded(async () => (await API.get<CameraItem[]>('/api/cameras')).data, () => []),

  addCamera: (payload: Omit<CameraItem, 'id' | 'created_at'>): Promise<CameraItem> =>
    guarded(async () => (await API.post<CameraItem>('/api/cameras', payload)).data, () => {
      throw new Error('Backend offline')
    }),

  updateCamera: (id: number, payload: Omit<CameraItem, 'id' | 'created_at'>): Promise<CameraItem> =>
    guarded(async () => (await API.put<CameraItem>(`/api/cameras/${id}`, payload)).data, () => {
      throw new Error('Backend offline')
    }),

  deleteCamera: (id: number): Promise<{ ok: boolean }> =>
    guarded(async () => (await API.delete<{ ok: boolean }>(`/api/cameras/${id}`)).data, () => ({ ok: true })),

  fetchAlertFeed: (range: string = '', village: string = ''): Promise<AlertRecord[]> =>
    guarded(
      async () =>
        (
          await API.get<AlertRecord[]>('/api/alerts/feed', {
            params: { range: range || undefined, village: village || undefined },
          })
        ).data,
      () => [],
    ),

  manualAlert: (payload: Partial<AlertRecord>): Promise<{ accepted: boolean; alert: AlertRecord; message: string }> =>
    guarded(
      async () => (await API.post<{ accepted: boolean; alert: AlertRecord; message: string }>('/api/alerts/manual', payload)).data,
      () => {
        throw new Error('Backend offline')
      },
    ),

  resolveDbAlert: (alertId: string): Promise<{ ok: boolean; alert: AlertRecord }> =>
    guarded(
      async () => (await API.post<{ ok: boolean; alert: AlertRecord }>(`/api/alerts/${alertId}/resolve`)).data,
      () => ({ ok: true, alert: { alert_id: alertId } as AlertRecord }),
    ),

  fetchAdminStats: (): Promise<AdminStats> =>
    guarded(
      async () =>
        (await API.get<AdminStats>('/api/admin/stats')).data,
      () => ({ totalDetections: 0, activeAlerts: 0, totalUsers: 0, totalCameras: 0, latestAlert: null }),
    ),

  fetchEmergencyContacts: (): Promise<EmergencyContact[]> =>
    guarded(async () => (await API.get<EmergencyContact[]>('/api/emergency/contacts')).data, () => []),

  exportAlertsCSV: async (range: string = '', village: string = ''): Promise<void> => {
    try {
      const res = await API.get('/api/alerts/export.csv', {
        responseType: 'blob',
        params: { range: range || undefined, village: village || undefined },
      })
      const url = URL.createObjectURL(res.data as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'tuskerguard-alerts.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      /* backend offline - silent */
    }
  },

  registerPushToken: (token: string): Promise<{ ok: boolean }> =>
    guarded(async () => (await API.post<{ ok: boolean }>('/api/push-token', { token })).data, () => ({ ok: false })),
}

function mockReport(): ReportData {
  const det = genHistory()
  const today = det.filter((d) => new Date(d.timestamp).getDate() === new Date().getDate())
  return {
    summary: `Today, ${Math.max(6, today.length)} elephant movement event(s) were detected and analysed by the YOLOv8 model. Muthanga–Wayanad Fringe experienced the highest activity with 3 confirmed events. Two critical alerts were raised; both were acknowledged by forest officers within 6 minutes. No human or elephant injuries were reported.`,
    recommendations: [
      'Deploy a rapid response team to Muthanga–Wayanad Fringe between 18:00 and 06:00 hours.',
      'Warn villagers of Villages 3 & 5 near Mudumalai about the lone bull elephant.',
      'Increase camera monitoring in Hassan–Sakleshpur Corridor during dusk hours.',
      'Schedule solar maintenance for esp-07 (battery 23%, offline).',
    ],
    stats: {
      detections: Math.max(6, today.length),
      topZone: 'Muthanga–Wayanad Fringe',
      alertsRaised: 2,
      acknowledged: 2,
      activeOfficers: 4,
    },
    generatedAt: new Date().toISOString(),
  }
}