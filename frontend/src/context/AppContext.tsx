import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppSettings } from '../types'
import { ZONES } from '../mockData/static'

const STORAGE_KEY = 'tuskerguard-settings'

const DEFAULT_SETTINGS: AppSettings = {
  alertSound: true,
  darkMode: true,
  smsEnabled: true,
  emailEnabled: false,
  zoneNames: Object.fromEntries(ZONES.map((z) => [z.id, z.name])),
  scanInterval: 2,
  buzzerDuration: 30,
  sensitivity: 65,
}

interface AppContextValue {
  settings: AppSettings
  update: (patch: Partial<AppSettings>) => void
  zoneName: (id: string) => string
}

const AppContext = createContext<AppContextValue | null>(null)

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', settings.darkMode)
    root.classList.toggle('light', !settings.darkMode)
  }, [settings.darkMode])

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const zoneName = useCallback(
    (id: string) => settings.zoneNames[id] ?? ZONES.find((z) => z.id === id)?.name ?? id,
    [settings.zoneNames],
  )

  const value = useMemo(() => ({ settings, update, zoneName }), [settings, update, zoneName])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function useAlertSound(): (title?: string) => void {
  const { settings } = useApp()
  return useCallback(() => {
    if (!settings.alertSound) return
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.18, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.65)
    } catch {
      /* audio unavailable */
    }
  }, [settings.alertSound])
}