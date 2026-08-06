import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BellRing,
  BellOff,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  MapPin,
  Camera,
  PhoneCall,
  Clock,
  CalendarDays,
  Map,
  Radio,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLiveAlerts } from '../context/LiveAlertContext'
import { api } from '../services/api'
import type { AlertRecord, EmergencyContact } from '../types'
import { formatClock, formatFullDate } from '../utils/format'
import GlassCard from '../components/ui/GlassCard'

export default function PortalDashboard() {
  const { user } = useAuth()
  const { latestAlert, liveAlerts, alertCount, notificationEnabled, askNotificationPermission, connected } = useLiveAlerts()
  const [monthCount, setMonthCount] = useState(0)
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [now, setNow] = useState(new Date())

  const status = latestAlert && latestAlert.status === 'active' ? 'detected' : 'safe'
  const myVillage = latestAlert?.village === user?.village

  useEffect(() => {
    api.fetchAlertFeed('month', '').then((list: AlertRecord[]) => setMonthCount(list.length)).catch(() => undefined)
    api.fetchEmergencyContacts().then(setContacts).catch(() => undefined)
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-extrabold">Welcome, {user?.name}</h2>
          <p className="mt-0.5 text-sm text-muted">
            {user?.village || 'Your village'} · {user?.phone || 'no phone on file'}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden items-center gap-1.5 rounded-xl border border-line bg-panel px-3 py-1.5 font-semibold sm:flex">
            <Clock size={14} className="text-info" /> {formatClock(now)}
          </span>
          <span className="hidden items-center gap-1.5 rounded-xl border border-line bg-panel px-3 py-1.5 text-xs font-semibold md:flex">
            <CalendarDays size={14} className="text-info" /> {formatFullDate(now)}
          </span>
          <span
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${
              connected ? 'border-success/30 bg-success/10 text-success' : 'border-warning/30 bg-warning/10 text-warning'
            }`}
          >
            <Radio size={13} /> {connected ? 'LIVE' : 'RECONNECTING'}
          </span>
        </div>
      </div>

      {/* Current status band */}
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className={`flex flex-wrap items-center justify-between gap-4 rounded-3xl border p-6 ${
            status === 'safe' ? 'border-success/30 bg-success/10' : 'border-danger/40 bg-danger/15'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`grid h-14 w-14 place-items-center rounded-2xl ${
                status === 'safe' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
              }`}
            >
              {status === 'safe' ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
            </div>
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${status === 'safe' ? 'text-success' : 'text-danger'}`}>
                Current Status
              </p>
              <h3 className={`font-display text-2xl font-extrabold ${status === 'safe' ? 'text-success' : 'text-danger'}`}>
                {status === 'safe' ? 'SAFE' : 'ELEPHANT DETECTED'}
              </h3>
              <p className="mt-0.5 text-xs text-muted">
                {status === 'safe'
                  ? 'No active elephant alerts near your village right now.'
                  : myVillage
                    ? `Alert near YOUR village (${latestAlert?.village}). Stay indoors and keep away from forest edges.`
                    : `Active alert at ${latestAlert?.village} — ${Math.round((latestAlert?.confidence ?? 0) * 100)}% confidence.`}
              </p>
            </div>
          </div>
          <Link
            to="/app/alerts"
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              status === 'safe'
                ? 'border border-success/40 bg-success/15 text-success hover:bg-success/25'
                : 'grad-primary text-white hover:shadow-glow'
            }`}
          >
            <Map size={16} /> {status === 'safe' ? 'View live map' : 'Open live alerts'}
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-faint">Current Alerts</p>
            <AlertTriangle size={17} className="text-warning" />
          </div>
          <p className="mt-2 font-display text-3xl font-extrabold">{liveAlerts.filter((a) => a.status === 'active').length}</p>
          <p className="mt-1 text-[11px] text-muted">Active in this session</p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-faint">Last Alert</p>
            <Clock size={17} className="text-info" />
          </div>
          <p className="mt-2 truncate font-display text-xl font-extrabold">
            {latestAlert ? `${latestAlert.village} · ${Math.round(latestAlert.confidence * 100)}%` : '—'}
          </p>
          <p className="mt-1 text-[11px] text-muted">{latestAlert ? new Date(latestAlert.time).toLocaleString() : 'No alerts yet'}</p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-faint">Total This Month</p>
            <CalendarDays size={17} className="text-success" />
          </div>
          <p className="mt-2 font-display text-3xl font-extrabold">{monthCount}</p>
          <p className="mt-1 text-[11px] text-muted">Alerts across all villages</p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-faint">Notification Status</p>
            {notificationEnabled ? <BellRing size={17} className="text-success" /> : <BellOff size={17} className="text-faint" />}
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold">{notificationEnabled ? 'ON' : 'OFF'}</p>
          <button
            onClick={askNotificationPermission}
            className="mt-1 text-[11px] font-bold text-success underline-offset-2 hover:underline"
          >
            {notificationEnabled ? 'Manage notifications' : 'Enable notifications'}
          </button>
        </GlassCard>
      </div>

      {/* Live alert card */}
      {latestAlert && latestAlert.status === 'active' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-danger/40 bg-danger/10 p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-display text-lg font-extrabold text-danger">
              <span className="relative flex h-3 w-3">
                <span className="absolute h-full w-full animate-ping rounded-full bg-danger" />
                <span className="relative h-3 w-3 rounded-full bg-danger" />
              </span>
              🔴 Elephant Detected
            </p>
            <span className="text-xs font-bold uppercase tracking-wider text-danger">{latestAlert.alert_id}</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: MapPin, k: 'Location', v: latestAlert.village },
              { icon: Camera, k: 'Camera', v: latestAlert.camera },
              { icon: AlertTriangle, k: 'Confidence', v: `${Math.round(latestAlert.confidence * 100)}%` },
              { icon: Clock, k: 'Time', v: new Date(latestAlert.time).toLocaleTimeString() },
            ].map((r) => (
              <div key={r.k} className="flex items-center gap-2.5 rounded-xl bg-panel/80 px-3.5 py-2.5">
                <r.icon size={16} className="shrink-0 text-danger" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-faint">{r.k}</p>
                  <p className="truncate text-sm font-semibold">{r.v}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Emergency contacts */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-2">
          <PhoneCall size={17} className="text-danger" />
          <h3 className="font-display text-base font-bold">Emergency Contact Numbers</h3>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {contacts.map((c) => (
            <a
              key={c.label}
              href={`tel:${c.phone.replace(/\s/g, '')}`}
              className="group flex items-center justify-between rounded-2xl border border-line bg-panel p-4 transition hover:border-danger/40"
            >
              <div>
                <p className="text-xs font-bold text-ink">{c.label}</p>
                <p className="mt-1 text-sm font-semibold text-success">{c.phone}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-faint">{c.type}</p>
              </div>
              <PhoneCall size={16} className="text-muted transition group-hover:text-danger" />
            </a>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
