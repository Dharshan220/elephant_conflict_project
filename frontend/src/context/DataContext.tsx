import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  DashboardResponse,
  AlertItem,
  Detection,
  Device,
  PredictionsResponse,
  AnalyticsResponse,
  ReportData,
  Zone,
  Officer,
} from '../types'
import { api, isBackendOnline } from '../services/api'
import { useToast } from './ToastContext'
import { useAlertSound } from './AppContext'

interface DataContextValue {
  dashboard: DashboardResponse | null
  alerts: AlertItem[]
  history: Detection[]
  devices: Device[]
  predictions: PredictionsResponse | null
  analytics: AnalyticsResponse | null
  zones: Zone[]
  officers: Officer[]
  loading: boolean
  backendOnline: boolean
  refresh: () => Promise<void>
  sendMotion: (zoneId: string) => Promise<void>
  raiseAlert: (zoneId: string, message?: string) => Promise<void>
  acknowledgeAlert: (alertId: string) => Promise<void>
  markSafe: (detectionId: string) => Promise<void>
  fetchReport: () => Promise<ReportData>
  toggleSimulation: (on: boolean) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { push } = useToast()
  const beep = useAlertSound()
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [history, setHistory] = useState<Detection[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [predictions, setPredictions] = useState<PredictionsResponse | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [officers, setOfficers] = useState<Officer[]>([])
  const [loading, setLoading] = useState(true)
  const lastAlertIds = useRef<Set<string>>(new Set())

  const refresh = useCallback(async () => {
    const [dash, al, his, dev, pred, an, zn, off] = await Promise.all([
      api.fetchDashboard(),
      api.fetchAlerts(),
      api.fetchHistory(),
      api.fetchDevices(),
      api.fetchPredictions(),
      api.fetchAnalytics(),
      api.fetchZones(),
      api.fetchOfficers(),
    ])
    setDashboard(dash)
    setAlerts(al)
    setHistory(his)
    setDevices(dev)
    setPredictions(pred)
    setAnalytics(an)
    if (zn.length) setZones(zn)
    if (off.length) setOfficers(off)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    const t = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, 5000)
    return () => window.clearInterval(t)
  }, [refresh])

  useEffect(() => {
    if (!dashboard) return
    const fresh = dashboard.recentAlerts.filter((a) => a.status === 'active' && !lastAlertIds.current.has(a.id))
    fresh.forEach((a) => {
      lastAlertIds.current.add(a.id)
      beep(a.title)
    })
  }, [dashboard, beep])

  const sendMotion = useCallback(async (zoneId: string) => {
    const res = await api.sendMotion(zoneId)
    push('info', 'PIR motion event sent', res.message)
    if (!res.detection) await refresh()
  }, [push, refresh])

  const raiseAlert = useCallback(
    async (zoneId: string, message?: string) => {
      const res = await api.raiseAlert(zoneId)
      push('warning', 'Test alert raised', message ?? res.message)
      beep('Test alert')
      await refresh()
    },
    [push, refresh, beep],
  )

  const acknowledgeAlert = useCallback(
    async (alertId: string) => {
      await api.acknowledgeAlert(alertId)
      push('success', `Alert ${alertId} acknowledged`)
      await refresh()
    },
    [push, refresh],
  )

  const markSafe = useCallback(
    async (detectionId: string) => {
      await api.markDetectionSafe(detectionId)
      push('success', 'Detection marked safe', 'Officer verification recorded')
      await refresh()
    },
    [push, refresh],
  )

  const fetchReport = useCallback(async () => api.fetchReport(), [])

  const toggleSimulation = useCallback(async (on: boolean) => {
    await api.setSimulation(on)
  }, [])

  const backendOnline = isBackendOnline()

  const value = useMemo(
    () => ({
      dashboard,
      alerts,
      history,
      devices,
      predictions,
      analytics,
      zones,
      officers,
      loading,
      backendOnline,
      refresh,
      sendMotion,
      raiseAlert,
      acknowledgeAlert,
      markSafe,
      fetchReport,
      toggleSimulation,
    }),
    [dashboard, alerts, history, devices, predictions, analytics, zones, officers, loading, backendOnline, refresh, sendMotion, raiseAlert, acknowledgeAlert, markSafe, fetchReport, toggleSimulation],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}