import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Camera, Users, AlertTriangle, Radar, Siren, CheckCircle2 } from 'lucide-react'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'
import { useLiveAlerts } from '../context/LiveAlertContext'
import GlassCard from '../components/ui/GlassCard'
import type { AdminStats, AlertRecord, CameraItem } from '../types'

interface CameraForm {
  name: string
  latitude: string
  longitude: string
  village: string
  status: string
}

const EMPTY_FORM: CameraForm = { name: '', latitude: '', longitude: '', village: '', status: 'online' }

export default function AdminPage() {
  const { push } = useToast()
  const { triggerLocalAlert } = useLiveAlerts()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [cameras, setCameras] = useState<CameraItem[]>([])
  const [feed, setFeed] = useState<AlertRecord[]>([])
  const [form, setForm] = useState<CameraForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    api.fetchAdminStats().then(setStats).catch(() => undefined)
    api.fetchCameras().then(setCameras).catch(() => undefined)
    api.fetchAlertFeed('month', '').then(setFeed).catch(() => undefined)
  }, [])

  useEffect(load, [load])

  function saveCamera(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      name: form.name.trim(),
      latitude: parseFloat(form.latitude) || 0,
      longitude: parseFloat(form.longitude) || 0,
      village: form.village.trim(),
      status: form.status,
    }
    setBusy(true)
    const action = editingId ? api.updateCamera(editingId, payload) : api.addCamera(payload)
    action
      .then(() => {
        push('success', editingId ? 'Camera updated' : 'Camera added', payload.name)
        setForm(EMPTY_FORM)
        setEditingId(null)
        load()
      })
      .catch(() => push('error', 'Save failed', 'Backend unreachable'))
      .finally(() => setBusy(false))
  }

  function edit(cam: CameraItem) {
    setEditingId(cam.id)
    setForm({
      name: cam.name,
      latitude: String(cam.latitude),
      longitude: String(cam.longitude),
      village: cam.village,
      status: cam.status,
    })
  }

  function remove(cam: CameraItem) {
    api.deleteCamera(cam.id).then(() => {
      push('info', 'Camera deleted', cam.name)
      load()
    })
  }

  function manualAlert() {
    setBusy(true)
    api
      .manualAlert({ village: 'Karamadai', camera: 'CAM01', latitude: 11.23, longitude: 76.95, confidence: 0.95, animal: 'elephant' })
      .then((res) => {
        push('warning', 'Manual alert raised', res.alert.alert_id)
        triggerLocalAlert(res.alert)
        load()
      })
      .catch(() => push('error', 'Failed', 'Backend unreachable'))
      .finally(() => setBusy(false))
  }

  function resolve(a: AlertRecord) {
    api.resolveDbAlert(a.alert_id).then(() => {
      push('success', `Alert ${a.alert_id} resolved`)
      load()
    })
  }

  const inputCls =
    'w-full rounded-xl border border-line bg-panel px-3 py-2 text-sm outline-none transition placeholder:text-faint focus:border-accent/50'

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-accentSoft text-accent">
            <Radar size={20} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Admin Command Center</h2>
            <p className="text-sm text-muted">Camera grid, alerts and system overview</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={manualAlert}
            disabled={busy}
            className="flex items-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-sm font-bold text-white transition hover:shadow-glow disabled:opacity-50"
          >
            <Siren size={15} /> Manual Alert
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Radar, k: 'Total Detections', v: stats?.totalDetections ?? '—' },
          { icon: AlertTriangle, k: 'Active Alerts', v: stats?.activeAlerts ?? '—', danger: true },
          { icon: Users, k: 'Registered Users', v: stats?.totalUsers ?? '—' },
          { icon: Camera, k: 'Cameras', v: stats?.totalCameras ?? '—' },
        ].map((s) => (
          <GlassCard key={s.k} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-faint">{s.k}</p>
              <s.icon size={16} className={s.danger ? 'text-danger' : 'text-accent'} />
            </div>
            <p className={`mt-2 font-display text-3xl font-extrabold ${s.danger ? 'text-danger' : 'text-ink'}`}>{s.v}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Camera CRUD */}
        <GlassCard className="p-5 lg:col-span-3">
          <h3 className="font-display text-base font-bold">Cameras</h3>
          <form onSubmit={saveCamera} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input required placeholder="Camera name (e.g. CAM01)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            <input required placeholder="Village" value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} className={inputCls} />
            <input placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className={inputCls} />
            <input placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className={inputCls} />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <button
              type="submit"
              disabled={busy}
              className="flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white transition hover:shadow-glow disabled:opacity-50"
            >
              <Plus size={15} /> {editingId ? 'Update camera' : 'Add camera'}
            </button>
          </form>

          <div className="mt-4 space-y-2">
            {cameras.map((cam) => (
              <div key={cam.id} className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3">
                <Camera size={16} className="shrink-0 text-accent" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{cam.name}</p>
                  <p className="truncate text-[11px] text-faint">
                    {cam.village} · {cam.latitude.toFixed(4)}, {cam.longitude.toFixed(4)}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cam.status === 'online' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                  {cam.status.toUpperCase()}
                </span>
                <button onClick={() => edit(cam)} className="rounded-lg p-1.5 text-muted transition hover:bg-panelHover hover:text-accent" title="Edit">
                  <Pencil size={14} />
                </button>
                <button onClick={() => remove(cam)} className="rounded-lg p-1.5 text-muted transition hover:bg-panelHover hover:text-danger" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {cameras.length === 0 && <p className="py-4 text-center text-sm text-faint">No cameras yet</p>}
          </div>
        </GlassCard>

        {/* Active alerts + resolve */}
        <GlassCard className="p-5 lg:col-span-2">
          <h3 className="font-display text-base font-bold">Recent alerts</h3>
          <div className="mt-3 space-y-2">
            {feed.slice(0, 8).map((a) => (
              <div key={a.alert_id} className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-3.5 py-2.5">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${a.status === 'active' ? 'bg-danger' : 'bg-success'}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{a.village} · {a.camera}</p>
                  <p className="text-[10px] text-faint">
                    {a.alert_id} · {Math.round(a.confidence * 100)}% · {new Date(a.time).toLocaleString()}
                  </p>
                </div>
                {a.status === 'active' && (
                  <button
                    onClick={() => resolve(a)}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-success/10 px-2 py-1 text-[10px] font-bold text-success transition hover:bg-success/20"
                  >
                    <CheckCircle2 size={12} /> Resolve
                  </button>
                )}
              </div>
            ))}
            {feed.length === 0 && <p className="py-4 text-center text-sm text-faint">No alerts this month</p>}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
