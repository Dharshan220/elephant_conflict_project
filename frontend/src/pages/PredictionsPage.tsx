import { BrainCircuit, TrendingUp, CalendarClock, Activity, RefreshCw, ShieldCheck } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useApp } from '../context/AppContext'
import GlassCard from '../components/ui/GlassCard'
import SectionHeader from '../components/ui/SectionHeader'
import ProgressBar from '../components/ui/ProgressBar'
import HeatmapGrid from '../components/HeatmapGrid'
import { MultipurposeChart } from '../components/charts/ChartBlocks'
import { RiskBadge, Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { CardSkeleton } from '../components/ui/Skeleton'
import { useToast } from '../context/ToastContext'
import { classNames } from '../utils/helpers'
import { ZONES as STATIC_ZONES } from '../mockData/static'

export default function PredictionsPage() {
  const { predictions, zones, loading, refresh } = useData()
  const { zoneName } = useApp()
  const { push } = useToast()

  if (loading || !predictions) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <CardSkeleton className="lg:col-span-2" rows={5} />
        <CardSkeleton rows={5} />
      </div>
    )
  }

  const zoneList = zones.length ? zones : STATIC_ZONES
  const hourlyLabels = predictions.hourly.map((h) => `${String(h.hour).padStart(2, '0')}:00`)

  const riskTone = (v: number) => (v >= 70 ? 'danger' : v >= 40 ? 'warning' : 'success')

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">AI Risk Prediction</h2>
          <p className="text-sm text-muted">Hourly elephant ingress probability · temporal + zone aware model</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="accent" dot>Model live</Badge>
          <Button variant="outline" size="sm" icon={<RefreshCw size={14} />} onClick={() => { refresh(); push('success', 'Prediction engine refreshed') }}>
            Re-run
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="grid gap-4 sm:grid-cols-2 xl:col-span-2">
          {predictions.zones.map((z, i) => (
            <GlassCard key={z.zoneId} hover delay={i * 0.05} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <RiskBadge risk={z.risk} />
                    <span className={classNames('text-[10px] font-bold uppercase tracking-wide', z.trend > 0 ? 'text-danger' : 'text-success')}>
                      {z.trend > 0 ? `▲ +${z.trend}%` : `▼ ${z.trend}%`}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-sm font-bold text-ink" title={zoneName(z.zoneId)}>{zoneName(z.zoneId)}</p>
                </div>
                <span className="font-display text-3xl font-bold text-ink">{z.riskScore}<span className="text-base text-faint">%</span></span>
              </div>
              <div className="mt-3">
                <ProgressBar value={z.riskScore} color={riskTone(z.riskScore)} showLabel />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1.5"><Activity size={12} className="text-accent" /> Ingress prob. {z.elephantProbability}%</span>
                <span>Peak 18:00–06:00</span>
              </div>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-5" delay={0.1}>
          <SectionHeader title="Model Health" subtitle="YOLOv8 risk engine" icon={<BrainCircuit size={16} />} />
          {predictions.model && (
            <div className="mt-4 space-y-2.5">
              <Row label="Model" value={predictions.model.model} />
              <Row label="Accuracy" value={`${predictions.model.accuracy}%`} />
              <Row label="MAE" value={predictions.model.mae.toFixed(2)} />
              <Row label="Training set" value={`${predictions.model.datasetSize.toLocaleString()} frames`} />
              <Row label="Last trained" value={predictions.model.lastTrained} />
              <Row label="Inference" value={`${predictions.model.inferenceMs} ms`} />
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-accentSoft p-3">
              <p className="font-display text-2xl font-bold text-accent">2</p>
              <p className="text-[11px] font-medium text-muted">High risk zones</p>
            </div>
            <div className="rounded-xl bg-warning-soft p-3">
              <p className="font-display text-2xl font-bold text-warning">18:00</p>
              <p className="text-[11px] font-medium text-muted">Activity onset</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2">
          <SectionHeader
            title="Prediction Graph"
            subtitle="Risk index · today vs tomorrow"
            icon={<TrendingUp size={16} />}
            action={
              <div className="flex items-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#22c55e]" /> Today</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#38bdf8]" /> Tomorrow</span>
              </div>
            }
          />
          <div className="mt-4">
            <MultipurposeChart
              labels={hourlyLabels}
              datasets={[
                { label: 'Today', data: predictions.hourly.map((h) => h.today) },
                { label: 'Tomorrow', data: predictions.hourly.map((h) => h.tomorrow), borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.15)' },
              ]}
              height={260}
              yLabel="Risk index"
            />
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <SectionHeader title="Heatmap" subtitle="Risk × time-slot" icon={<ShieldCheck size={16} />} />
          <div className="mt-4">
            <HeatmapGrid cells={predictions.heatmap} zones={zoneList} />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-2.5 text-xs text-muted">
            <CalendarClock size={14} className="text-warning" />
            Most probable window: <span className="font-bold text-warning">20:00 – 22:00</span>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-panel px-3 py-2 text-xs">
      <span className="font-medium text-faint">{label}</span>
      <span className="font-bold text-ink">{value}</span>
    </div>
  )
}