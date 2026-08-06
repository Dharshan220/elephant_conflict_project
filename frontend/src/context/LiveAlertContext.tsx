import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { AlertRecord } from '../types'
import { useToast } from './ToastContext'
import { useAlertSound } from './AppContext'

const WS_URL = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/alerts`

export interface LiveAlertEvent {
  type: 'alert' | 'resolve' | 'welcome'
  alert?: AlertRecord
  online?: number
}

interface LiveAlertContextValue {
  connected: boolean
  liveAlerts: AlertRecord[]
  latestAlert: AlertRecord | null
  alertCount: number
  notificationEnabled: boolean
  askNotificationPermission: () => void
  triggerLocalAlert: (alert: AlertRecord) => void
}

const LiveAlertContext = createContext<LiveAlertContextValue | null>(null)

const MAX_ALERTS = 12

export function LiveAlertProvider({ children }: { children: ReactNode }) {
  const { push } = useToast()
  const beep = useAlertSound()
  const [connected, setConnected] = useState(false)
  const [liveAlerts, setLiveAlerts] = useState<AlertRecord[]>([])
  const [latestAlert, setLatestAlert] = useState<AlertRecord | null>(null)
  const [alertCount, setAlertCount] = useState(0)
  const [notificationEnabled, setNotificationEnabled] = useState(false)
  const seenRef = useRef<Set<string>>(new Set())

  // Broadcast a new alert: sound + toast + browser notification.
  const handleAlert = useCallback(
    (alert: AlertRecord) => {
      if (seenRef.current.has(alert.alert_id)) return
      seenRef.current.add(alert.alert_id)
      setLiveAlerts((list) => [alert, ...list].slice(0, MAX_ALERTS))
      setLatestAlert(alert)
      setAlertCount((c) => c + 1)
      beep(alert.village)
      push('warning', '⚠ Elephant Alert', `Elephant detected near ${alert.village} Village. Stay indoors.`)

      // In-page notification (fallback when FCM is not configured).
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          const n = new Notification('⚠ Elephant Alert', {
            body: `Elephant detected near ${alert.village} Village. Avoid the area and stay indoors.`,
            icon: '/favicon.ico',
          })
          n.onclick = () => {
            window.focus()
            window.location.hash = '#/live'
          }
        }
      } catch {
        /* notification unavailable */
      }
    },
    [beep, push],
  )

  useEffect(() => {
    const ws = new WebSocket(WS_URL)
    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onerror = () => setConnected(false)
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data as string) as LiveAlertEvent
        if (data.type === 'welcome') setConnected(true)
        if (data.type === 'alert' && data.alert) handleAlert(data.alert)
      } catch {
        /* ignore malformed frame */
      }
    }
    // reconnect every 5s while disconnected
    const retry = window.setInterval(() => {
      if (ws.readyState !== WebSocket.CLOSED) return
      try {
        ws.close()
      } catch {
        /* ignore */
      }
    }, 5000)
    return () => {
      window.clearInterval(retry)
      ws.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ask for browser notification permission and register a (mock) FCM token.
  const askNotificationPermission = useCallback(() => {
    if (!('Notification' in window)) {
      push('info', 'Notifications unsupported in this browser')
      return
    }
    Notification.requestPermission().then((perm) => {
      setNotificationEnabled(perm === 'granted')
      push(perm === 'granted' ? 'success' : 'info', perm === 'granted' ? 'Notifications enabled' : 'Notifications blocked')
      if (perm === 'granted') {
        // Real FCM tokens are registered by the messaging service worker once
        // firebase config is added; this placeholder keeps the backend wired.
        import('../services/api').then(({ api }) => api.registerPushToken(`mock-fcm-${Date.now()}`))
      }
    })
  }, [push])

  const triggerLocalAlert = useCallback(
    (alert: AlertRecord) => {
      setAlertCount((c) => c + 1)
      handleAlert(alert)
    },
    [handleAlert],
  )

  const value = useMemo<LiveAlertContextValue>(
    () => ({
      connected,
      liveAlerts,
      latestAlert,
      alertCount,
      notificationEnabled,
      askNotificationPermission,
      triggerLocalAlert,
    }),
    [connected, liveAlerts, latestAlert, alertCount, notificationEnabled, askNotificationPermission, triggerLocalAlert],
  )

  return <LiveAlertContext.Provider value={value}>{children}</LiveAlertContext.Provider>
}

export function useLiveAlerts(): LiveAlertContextValue {
  const ctx = useContext(LiveAlertContext)
  if (!ctx) throw new Error('useLiveAlerts must be used within LiveAlertProvider')
  return ctx
}
