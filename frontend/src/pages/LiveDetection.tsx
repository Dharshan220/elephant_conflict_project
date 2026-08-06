import { useState } from 'react'
import { Siren, ShieldCheck, Zap, Users, Baby, Footprints, Compass, MapPin, Cpu, BrainCircuit, Activity } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useApp } from '../context/AppContext'
import GlassCard from '../components/ui/GlassCard'
import CameraFeed from '../components/CameraFeed'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { CardSkeleton } from '../components/ui/Skeleton'
import ProgressBar from '../components/ui/ProgressBar'
import { formatTime, timeAgo } from '../utils/format'
import { classNames } from '../utils/helpers'

export default function LiveDetection() {
  const { dashboard, history, loading, sendMotion, raiseAlert, markSafe } = useData()
  const { zoneName } = useApp()
  const [busy, setBusy] = useState(false)
  const det = dashboard?.latestDetection ?? null
  const recent = history.slice(0, 6)

  const handleMotion = async () => {
    setBusy(true)
    await sendMotion(det?.zoneId ?? 'z2')
    setBusy(false)
  }

  if (loading || !dashboard) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <CardSkeleton className="lg:col-span-2" rows={5} />
        <CardSkeleton rows={8} />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-4 lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge tone={det ? 'danger' : 'neutral'} dot>
                {det ? 'DETECTION ACTIVE' : 'ARMED — MONITORING'}
              </Badge>
              <span className="text-xs text-faint">Live inference · 4 fps poll</span>
            </div>
            <Button size="sm" variant="outline" icon={<Zap size={14} />} onClick={handleMotion} loading={busy}>
              Simulate PIR Motion
            </Button>
          </div>
          <CameraFeed detection={det} demo />
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-ink">
              <BrainCircuit size={16} className="text-accent" /> AI Detection Details
            </p>
            {det ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-faint">Animal</span>
                  <span className="text-sm font-bold text-ink">{det.animalClass}</span>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wide text-faint">Confidence</span>
                    <span className={classNames('font-bold', det.confidence > 0.9 ? 'text-danger' : det.confidence > 0.75 ? 'text-warning' : 'text-accent')}>
                      {(det.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar value={det.confidence * 100} color={det.confidence > 0.9 ? 'danger' : det.confidence > 0.75 ? 'warning' : 'success'} />
                </div>
                <DetailRow icon={<Users size={14} />} label="Elephant count" value={`${det.count} (${det.adults} adults · ${det.calves} calves)`} />
                <DetailRow icon={<Baby size={14} />} label="Calf present" value={det.calves > 0 ? `Yes · ${det.calves} calf` : 'No'} />
                <DetailRow icon={<Footprints size={14} />} label="Behaviour" value={det.behavior} accent />
                <DetailRow icon={<Compass size={14} />} label="Direction" value={det.direction} />
                <DetailRow icon={<MapPin size={14} />} label="Zone" value={zoneName(det.zoneId)} />
                <DetailRow icon={<Activity size={14} />} label="Detection time" value={`${formatTime(det.timestamp)} · ${timeAgo(det.timestamp)}`} />
              </div>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-muted">
                No detection in this session yet. Use <span className="font-semibold text-ink">Simulate PIR Motion</span> to run the full
                ESP8266 → FastAPI → YOLOv8 pipeline and watch it here in real time.
              </p>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-ink">
              <Cpu size={16} className="text-info" /> AI Status
            </p>
            <div className="mt-3 space-y-2 text-xs">
              <StatusRow label="Model" value="YOLOv8n · 1280px" />
              <StatusRow label="Inference" value="28 ms / frame" />
              <StatusRow label="FPS" value="24" />
              <StatusRow label="Avg confidence" value="88.7%" />
              <StatusRow label="Tracker" value="ByteTrack v2 · active" />
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="danger" size="sm" icon={<Siren size={15} />} onClick={() => raiseAlert(det?.zoneId ?? 'z2')}>
                Trigger Alert
              </Button>
              <Button variant="outline" size="sm" icon={<ShieldCheck size={15} />} onClick={() => det && markSafe(det.id)} disabled={!det}>
                Mark Safe
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>

      <GlassCard className="p-5">
        <p className="mb-4 text-sm font-bold text-ink">Recent Detections</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {recent.map((d) => (
            <div key={d.id} className="rounded-xl border border-line bg-panel p-3.5 transition hover:bg-panelHover">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-faint">{d.id}</span>
                <Badge tone={d.confidence > 0.9 ? 'danger' : d.confidence > 0.75 ? 'warning' : 'successSoft'}>
                  {(d.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
              <p className="mt-2 text-sm font-bold text-ink">{d.animalClass} · {d.behavior}</p>
              <p className="mt-0.5 truncate text-xs text-muted">{zoneName(d.zoneId)} · {formatTime(d.timestamp)}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

function DetailRow({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wide text-faint">
        <span className="text-muted">{icon}</span>
        {label}
      </span>
      <span className={classNames('truncate font-semibold', accent ? 'text-accent' : 'text-ink')}>{value}</span>
    </div>
  )
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-panel px-3 py-2">
      <span className="font-medium text-faint">{label}</span>
      <span className="font-bold text-ink">{value}</span>
    </div>
  )
}