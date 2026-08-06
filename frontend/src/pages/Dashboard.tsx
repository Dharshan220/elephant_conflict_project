import { useState } from 'react'
import {
  ScanEye,
  BellRing,
  Cpu,
  ShieldCheck,
  MapPin,
  CloudSun,
  FileText,
  Car,
  Siren,
  Activity,
  TrendingUp,
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useApp } from '../context/AppContext'
import { StatCard } from '../components/ui/StatCard'
import GlassCard from '../components/ui/GlassCard'
import SectionHeader from '../components/ui/SectionHeader'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import ActivityFeed from '../components/ActivityFeed'
import RecentAlerts from '../components/RecentAlerts'
import ReportModal from '../components/ReportModal'
import { MultipurposeChart, DoughnutChart } from '../components/charts/ChartBlocks'
import { SkeletonGroup, CardSkeleton } from '../components/ui/Skeleton'
import { timeAgo, formatTime } from '../utils/format'

export default function Dashboard() {
  const { dashboard, alerts, predictions, analytics, loading, acknowledgeAlert, raiseAlert, refresh } = useData()
  const { zoneName } = useApp()
  const [reportOpen, setReportOpen] = useState(false)

  if (loading || !dashboard) {
    return (
      <div className="space-y-5">
        <SkeletonGroup count={4} />
        <div className="grid gap-4 lg:grid-cols-3">
          <CardSkeleton className="lg:col-span-2" rows={4} />
          <CardSkeleton rows={4} />
        </div>
      </div>
    )
  }

  const { stats, weather, activity, recentAlerts, latestDetection } = dashboard
  const zoneData = predictions?.zones ?? []
  const topRisk = [...zoneData].sort((a, b) => b.riskScore - a.riskScore)[0]
  const weekly = analytics?.daily ?? [12, 18, 9, 21, 15, 27, 19]
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Command Overview</h2>
          <p className="text-sm text-muted">Live status of the elephant movement monitoring grid</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" icon={<FileText size={15} />} onClick={() => setReportOpen(true)}>
            Generate Report
          </Button>
          <Button variant="warning" size="sm" icon={<Car size={15} />} onClick={() => refresh()}>
            Dispatch Officer
          </Button>
          <Button variant="danger" size="sm" icon={<Siren size={15} />} onClick={() => raiseAlert('z2', 'Test alert broadcast to Muthanga nodes')}>
            Trigger Test Alert
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's Detections" value={stats.todayDetections} icon={ScanEye} tone="forest" sublabel={`Model: ${stats.modelStatus}`} delay={0} />
        <StatCard label="Active Alerts" value={stats.activeAlerts} icon={BellRing} tone="danger" sublabel="Require officer attention" delay={0.05} />
        <StatCard label="Online Devices" value={stats.onlineDevices} suffix={`/${stats.totalDevices}`} icon={Cpu} tone="info" sublabel="ESP8266 edge nodes" delay={0.1} />
        <StatCard label="System Status" value={stats.systemStatus === 'Operational' ? 1 : 0} icon={ShieldCheck} tone={stats.systemStatus === 'Operational' ? 'forest' : 'warning'} sublabel={stats.systemStatus} delay={0.15} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="relative overflow-hidden p-5 lg:col-span-2" delay={0.1}>
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-danger/10 blur-3xl" />
          <SectionHeader
            title="High Risk Zone"
            subtitle="Live risk scoring from AI prediction engine"
            icon={<MapPin size={16} />}
            action={topRisk ? <Badge tone="danger">{topRisk.riskScore}% risk</Badge> : undefined}
          />
          {topRisk && (
            <div className="mt-4 flex flex-wrap items-center gap-6">
              <div className="grad-danger grid h-20 w-20 place-items-center rounded-2xl text-white shadow-glow-danger">
                <TrendingUp size={30} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold text-ink">{zoneName(topRisk.zoneId)}</p>
                <p className="mt-0.5 text-xs text-muted">Elephant presence probability ~{topRisk.elephantProbability}% · trend {topRisk.trend > 0 ? '+' : ''}{topRisk.trend}% vs yesterday</p>
                <div className="mt-3 max-w-sm">
                  <ProgressBar value={topRisk.riskScore} color="danger" showLabel />
                </div>
              </div>
              <div className="flex gap-3">
                {zoneData.filter((z) => z.risk === 'high').map((z) => (
                  <div key={z.zoneId} className="rounded-xl border border-danger/25 bg-danger-soft px-3 py-2 text-center">
                    <p className="text-[10px] font-bold uppercase text-danger">High risk</p>
                    <p className="max-w-[110px] truncate text-xs font-semibold text-ink">{zoneName(z.zoneId)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5" delay={0.15}>
          <SectionHeader title="Weather" subtitle="Nilgiris–Western Ghats grid" icon={<CloudSun size={16} />} />
          <div className="mt-4 flex items-center gap-5">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-warning-soft text-warning">
              <CloudSun size={30} />
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-ink">{weather.temp}°C</p>
              <p className="text-sm font-medium text-muted">{weather.condition}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-panel p-2.5">
              <p className="text-[10px] font-bold uppercase text-faint">Humidity</p>
              <p className="mt-0.5 font-bold text-ink">{weather.humidity}%</p>
            </div>
            <div className="rounded-xl bg-panel p-2.5">
              <p className="text-[10px] font-bold uppercase text-faint">Wind</p>
              <p className="mt-0.5 font-bold text-ink">{weather.windSpeed} km/h</p>
            </div>
            <div className="rounded-xl bg-panel p-2.5">
              <p className="text-[10px] font-bold uppercase text-faint">Rainfall</p>
              <p className="mt-0.5 truncate text-[11px] font-bold text-ink" title={weather.rainfall}>{weather.rainfall.split(' ')[0]}</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-faint">Updated {timeAgo(weather.updatedAt)} · elephant activity peaks in drizzle hours</p>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2" delay={0.1}>
          <SectionHeader title="Detection Trend" subtitle="Last 7 days · YOLOv8 confirmed events" icon={<TrendingUp size={16} />} />
          <div className="mt-4">
            <MultipurposeChart labels={days} datasets={[{ label: 'Detections', data: weekly }]} height={240} yLabel="Events" />
          </div>
        </GlassCard>
        <GlassCard className="p-5" delay={0.15}>
          <SectionHeader title="Detections by Zone" subtitle="30-day share" icon={<Activity size={16} />} />
          <div className="mt-4">
            <DoughnutChart
              labels={(analytics?.zoneComparison ?? []).map((z) => z.zone)}
              values={(analytics?.zoneComparison ?? []).map((z) => z.count)}
              height={240}
            />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5" delay={0.1}>
          <SectionHeader
            title="Latest Activity"
            subtitle="Real-time event stream"
            icon={<Activity size={16} />}
            action={
              latestDetection ? (
                <Badge tone="accent" dot>
                  Live · {latestDetection.animalClass} {Math.round(latestDetection.confidence * 100)}%
                </Badge>
              ) : undefined
            }
          />
          <div className="mt-4">
            <ActivityFeed items={activity} />
          </div>
        </GlassCard>
        <GlassCard className="p-5" delay={0.15}>
          <SectionHeader
            title="Recent Alerts"
            subtitle={`${stats.activeAlerts} active · acknowledge to dispatch`}
            icon={<BellRing size={16} />}
            action={<span className="text-xs text-faint">Latest at {formatTime(recentAlerts[0]?.timestamp ?? new Date().toISOString())}</span>}
          />
          <div className="mt-4">
            <RecentAlerts alerts={recentAlerts} onAck={acknowledgeAlert} />
          </div>
        </GlassCard>
      </div>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  )
}