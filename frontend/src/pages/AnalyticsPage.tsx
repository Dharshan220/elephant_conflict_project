import { ScanEye, Gauge, BadgeCheck, Users, TrendingUp, Activity, BarChart3 } from 'lucide-react'
import { useData } from '../context/DataContext'
import GlassCard from '../components/ui/GlassCard'
import SectionHeader from '../components/ui/SectionHeader'
import { StatCard } from '../components/ui/StatCard'
import { MultipurposeChart, DoughnutChart, PieChart } from '../components/charts/ChartBlocks'
import { SkeletonGroup, CardSkeleton } from '../components/ui/Skeleton'

export default function AnalyticsPage() {
  const { analytics, loading } = useData()

  if (loading || !analytics) {
    return (
      <div className="space-y-5">
        <SkeletonGroup count={4} />
        <div className="grid gap-4 lg:grid-cols-2">
          <CardSkeleton rows={4} />
          <CardSkeleton rows={4} />
        </div>
      </div>
    )
  }

  const weeklyLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']
  const monthlyLabels = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const dailyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hourlyLabels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Detections (30d)" value={analytics.total30d} icon={ScanEye} tone="forest" sublabel="YOLOv8 confirmed" />
        <StatCard label="Avg Confidence" value={analytics.confidenceAvg} suffix="%" decimals={1} icon={Gauge} tone="info" sublabel="Across all events" />
        <StatCard label="Alerts Resolved" value={analytics.alertsResolvedPct} suffix="%" icon={BadgeCheck} tone="warning" sublabel="Officer turnaround" />
        <StatCard label="Active Officers" value={analytics.activeOfficers} icon={Users} tone="slate" sublabel="Field deployment" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <SectionHeader title="Daily Detections" subtitle="Last 7 days" icon={<Activity size={16} />} />
          <div className="mt-4">
            <MultipurposeChart labels={dailyLabels} datasets={[{ label: 'Events', data: analytics.daily }]} type="line" height={250} yLabel="Events" />
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <SectionHeader title="Weekly Detections" subtitle="Last 8 weeks" icon={<BarChart3 size={16} />} />
          <div className="mt-4">
            <MultipurposeChart labels={weeklyLabels} datasets={[{ label: 'Events', data: analytics.weekly }]} type="bar" height={250} yLabel="Events" />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <SectionHeader title="Monthly Trend" subtitle="6-month outlook" icon={<TrendingUp size={16} />} />
          <div className="mt-4">
            <MultipurposeChart labels={monthlyLabels} datasets={[{ label: 'Events', data: analytics.monthly }]} type="line" height={250} yLabel="Events" />
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <SectionHeader title="Zone Comparison" subtitle="30-day totals" icon={<BarChart3 size={16} />} />
          <div className="mt-4">
            <MultipurposeChart
              labels={analytics.zoneComparison.map((z) => z.zone.split('–')[0].split('-')[0])}
              datasets={[{ label: 'Detections', data: analytics.zoneComparison.map((z) => z.count) }]}
              type="bar"
              height={250}
              yLabel="Events"
            />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-5">
          <SectionHeader title="Behaviour Mix" subtitle="Where elephants spend time" icon={<Activity size={16} />} />
          <div className="mt-4">
            <DoughnutChart labels={analytics.behavior.map((b) => b.label)} values={analytics.behavior.map((b) => b.value)} height={250} />
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <SectionHeader title="Alert Severity Share" subtitle="All time" icon={<Activity size={16} />} />
          <div className="mt-4">
            <PieChart labels={analytics.severity.map((s) => s.label)} values={analytics.severity.map((s) => s.value)} height={250} />
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <SectionHeader title="Hourly Activity" subtitle="Circadian movement pattern" icon={<TrendingUp size={16} />} />
          <div className="mt-4">
            <MultipurposeChart
              labels={hourlyLabels}
              datasets={[{ label: 'Detections', data: analytics.hourly }]}
              type="radar"
              height={250}
            />
          </div>
        </GlassCard>
      </div>
    </div>
  )
}