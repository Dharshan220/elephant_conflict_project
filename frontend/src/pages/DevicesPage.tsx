import { useMemo } from 'react'
import { Cpu, Plus, Wifi, WifiOff, Bluetooth } from 'lucide-react'
import { useData } from '../context/DataContext'
import GlassCard from '../components/ui/GlassCard'
import DeviceCard from '../components/DeviceCard'
import { Button } from '../components/ui/Button'
import { useToast } from '../context/ToastContext'
import { EmptyState } from '../components/ui/Skeleton'

export default function DevicesPage() {
  const { devices, loading } = useData()
  const { push } = useToast()

  const online = devices.filter((d) => d.status === 'online').length
  const offline = devices.filter((d) => d.status === 'offline').length
  const warning = devices.filter((d) => d.status === 'warning').length
  const avgBattery = useMemo(
    () => (devices.length ? Math.round(devices.filter((d) => d.status !== 'offline').reduce((s, d) => s + d.battery, 0) / Math.max(1, devices.filter((d) => d.status !== 'offline').length)) : 0),
    [devices],
  )

  if (loading && devices.length === 0) {
    return <EmptyState icon={<Cpu size={24} />} title="Loading device grid…" />
  }

  return (
    <div className="space-y-5">
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">ESP8266 Edge Node Grid</h2>
            <p className="text-sm text-muted">PIR sensors + buzzer/LED deterrents · heartbeat via FastAPI</p>
          </div>
          <Button
            size="sm"
            icon={<Plus size={15} />}
            onClick={() => push('success', 'Simulating provisioning', 'A new ESP8266 node would be flashed via OTA here.')}
          >
            Provision Node
          </Button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Online" value={online} total={devices.length} icon={<Wifi size={15} className="text-success" />} tone="text-success" />
          <Metric label="Degraded" value={warning} icon={<Bluetooth size={15} className="text-warning" />} tone="text-warning" />
          <Metric label="Offline" value={offline} icon={<WifiOff size={15} className="text-danger" />} tone="text-danger" />
          <Metric label="Avg battery" value={avgBattery} suffix="%" icon={<Cpu size={15} className="text-info" />} tone="text-info" />
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {devices.map((d) => (
          <DeviceCard key={d.id} device={d} />
        ))}
      </div>
    </div>
  )
}

function Metric({ label, value, total, suffix, icon, tone }: { label: string; value: number; total?: number; suffix?: string; icon: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-faint">{label}</span>
        {icon}
      </div>
      <p className={`mt-1.5 font-display text-2xl font-bold ${tone}`}>
        {value}
        {total !== undefined && <span className="text-sm font-semibold text-faint">/{total}</span>}
        {suffix}
      </p>
    </div>
  )
}