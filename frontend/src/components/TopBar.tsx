import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, Bell, Sun, Moon, Cloud, CloudRain, CloudSun, Wind, Wifi, WifiOff } from 'lucide-react'
import { NAV_ITEMS } from '../config/nav'
import { useData } from '../context/DataContext'
import { useApp } from '../context/AppContext'
import { useTuskerLang } from '../i18n/LanguageContext'
import { formatClock, formatFullDate } from '../utils/format'

interface TopBarProps {
  onMenu: () => void
}

function WeatherIcon({ condition }: { condition: string }) {
  const c = condition.toLowerCase()
  if (c.includes('rain')) return <CloudRain className="text-info" size={18} />
  if (c.includes('cloud')) return <Cloud className="text-muted" size={18} />
  if (c.includes('sun')) return <CloudSun className="text-warning" size={18} />
  return <Sun className="text-warning" size={18} />
}

export default function TopBar({ onMenu }: TopBarProps) {
  const { pathname } = useLocation()
  const { alerts, dashboard, backendOnline } = useData()
  const { settings, update } = useApp()
  const { t } = useTuskerLang()
  const [now, setNow] = useState(new Date())
  const activeAlerts = alerts.filter((a) => a.status === 'active').length
  const item = NAV_ITEMS.find((n) => n.path === pathname) ?? NAV_ITEMS.find((n) => pathname.startsWith(n.path) && n.path !== '/')
  const title = item ? t(item.labelKey) : t('navDashboard')
  const weather = dashboard?.weather

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/70 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
        <button onClick={onMenu} className="rounded-lg p-2 text-muted transition hover:bg-panelHover hover:text-ink lg:hidden">
          <Menu size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <motion.h1
            key={title}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="truncate font-display text-lg font-bold text-ink lg:text-xl"
          >
            {title}
          </motion.h1>
          <p className="hidden text-xs text-muted sm:block">{formatFullDate(now)}</p>
        </div>

        {weather && (
          <div className="hidden items-center gap-2 rounded-xl border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-muted lg:flex">
            <WeatherIcon condition={weather.condition} />
            <span>{weather.temp}°C</span>
            <span className="text-faint">·</span>
            <span>{weather.humidity}%</span>
          </div>
        )}

        <span className="hidden items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-muted md:flex">
          <Wind size={14} className="text-info" />
          {formatClock(now)}
        </span>

        <button
          onClick={() => update({ darkMode: !settings.darkMode })}
          className="hidden rounded-xl border border-line bg-panel p-2 text-muted transition hover:text-ink sm:block"
          title="Toggle theme"
        >
          {settings.darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="relative">
          <button className="relative rounded-xl border border-line bg-panel p-2 text-muted transition hover:text-ink" title="Active alerts">
            <Bell size={16} />
            {activeAlerts > 0 && (
              <motion.span
                key={activeAlerts}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1.5 -top-1.5 grid h-5 min-w-[18px] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white"
              >
                {activeAlerts}
              </motion.span>
            )}
          </button>
        </div>

        <div
          className={classNamesFor(
            'flex items-center gap-2 rounded-xl border px-2.5 py-1.5',
            backendOnline ? 'border-success/30 bg-success/10' : 'border-warning/30 bg-warning/10',
          )}
          title={backendOnline ? 'FastAPI gateway connected' : 'Backend offline — demo data'}
        >
          {backendOnline ? <Wifi size={14} className="text-success" /> : <WifiOff size={14} className="text-warning" />}
          <span className={classNamesFor('hidden text-xs font-bold sm:inline', backendOnline ? 'text-success' : 'text-warning')}>
            {backendOnline ? t('live') : t('demo')}
          </span>
        </div>
      </div>
    </header>
  )
}

function classNamesFor(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ')
}