import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Camera, AlertTriangle, Clock, Radio, BellRing } from 'lucide-react'
import { useLiveAlerts } from '../context/LiveAlertContext'
import { useToast } from '../context/ToastContext'
import GlassCard from '../components/ui/GlassCard'

export default function LiveAlertsPage() {
  const { connected, liveAlerts, latestAlert, alertCount, notificationEnabled, askNotificationPermission, triggerLocalAlert } = useLiveAlerts()
  const { push } = useToast()

  // Simulate an incoming camera payload when the backend is unreachable,
  // so the live page always demonstrates the real-time flow.
  useEffect(() => {
    if (connected || liveAlerts.length > 0) return
    const t = window.setTimeout(() => {
      triggerLocalAlert({
        id: Date.now(),
        alert_id: `AL-DEMO-${Date.now() % 10000}`,
        animal: 'elephant',
        confidence: 0.95,
        camera: 'CAM01',
        village: 'Karamadai',
        latitude: 11.23,
        longitude: 76.95,
        time: new Date().toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
      })
    }, 2500)
    return () => window.clearTimeout(t)
  }, [connected, liveAlerts.length, triggerLocalAlert])

  const active = liveAlerts.filter((a) => a.status === 'active')

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-danger/15 text-danger">
            <Radio size={20} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Live Alert System</h2>
            <p className="text-sm text-muted">Real-time WebSocket stream from the YOLO detection pipeline</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={askNotificationPermission}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
              notificationEnabled ? 'border-success/30 bg-success/10 text-success' : 'border-line bg-panel text-muted hover:text-ink'
            }`}
          >
            <BellRing size={14} /> {notificationEnabled ? 'Notifications ON' : 'Enable notifications'}
          </button>
          <span
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold ${
              connected ? 'border-success/30 bg-success/10 text-success' : 'border-warning/30 bg-warning/10 text-warning'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`absolute h-full w-full animate-ping rounded-full ${connected ? 'bg-success' : 'bg-warning'}`} />
              <span className={`relative h-2 w-2 rounded-full ${connected ? 'bg-success' : 'bg-warning'}`} />
            </span>
            {connected ? 'WebSocket connected' : 'Offline (demo mode)'}
          </span>
        </div>
      </div>

      {/* Live counter strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { k: 'Alerts this session', v: alertCount },
          { k: 'Active alerts', v: active.length },
          { k: 'Received via WS', v: liveAlerts.length },
          { k: 'Sound alerts', v: '🔊 ON' },
        ].map((s) => (
          <GlassCard key={s.k} className="p-4 text-center">
            <p className="font-display text-3xl font-extrabold text-danger">{s.v}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-faint">{s.k}</p>
          </GlassCard>
        ))}
      </div>

      {/* Latest detection card */}
      {latestAlert && (
        <motion.div
          key={latestAlert.alert_id}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-danger/40 bg-danger/10 p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-display text-2xl font-extrabold text-danger">
              <span className="relative flex h-3.5 w-3.5">
                <span className="absolute h-full w-full animate-ping rounded-full bg-danger" />
                <span className="relative h-3.5 w-3.5 rounded-full bg-danger" />
              </span>
              🔴 Elephant Detected
            </p>
            <span className="rounded-lg bg-danger/15 px-2.5 py-1 text-[11px] font-bold text-danger">{latestAlert.alert_id}</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: MapPin, k: 'Location', v: `${latestAlert.village} Village`, sub: `${latestAlert.latitude.toFixed(4)}, ${latestAlert.longitude.toFixed(4)}` },
              { icon: Camera, k: 'Camera', v: latestAlert.camera, sub: 'YOLOv8 detection' },
              { icon: AlertTriangle, k: 'Confidence', v: `${Math.round(latestAlert.confidence * 100)}%`, sub: 'Threshold > 80%' },
              { icon: Clock, k: 'Time', v: new Date(latestAlert.time).toLocaleTimeString(), sub: new Date(latestAlert.time).toLocaleDateString() },
            ].map((r) => (
              <div key={r.k} className="rounded-2xl bg-panel/80 p-4">
                <div className="flex items-center gap-2">
                  <r.icon size={16} className="text-danger" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-faint">{r.k}</p>
                </div>
                <p className="mt-2 text-base font-bold text-ink">{r.v}</p>
                <p className="mt-0.5 text-[11px] text-muted">{r.sub}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-warning">
            <AlertTriangle size={15} /> Avoid the area and stay indoors. Forest officers have been notified.
          </p>
        </motion.div>
      )}

      {/* Stream */}
      <GlassCard className="p-5">
        <h3 className="font-display text-base font-bold">Live stream</h3>
        <div className="mt-3 space-y-2.5">
          {liveAlerts.length === 0 && <p className="py-6 text-center text-sm text-faint">Waiting for elephant detections…</p>}
          {liveAlerts.map((a, i) => (
            <motion.div
              key={a.alert_id}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 ${
                a.status === 'active' ? 'border-danger/30 bg-danger/5' : 'border-line bg-panel'
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${a.status === 'active' ? 'bg-danger' : 'bg-success'}`} />
              <span className="font-mono text-xs text-faint">#{liveAlerts.length - i}</span>
              <span className="font-bold text-ink">{a.village}</span>
              <span className="text-xs text-muted">{a.camera} · {Math.round(a.confidence * 100)}%</span>
              <span className="ml-auto text-xs text-faint">{new Date(a.time).toLocaleTimeString()}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
