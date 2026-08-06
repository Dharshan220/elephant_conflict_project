import type { Device } from '../types'
import { Cpu, Wifi, WifiOff, Battery, Thermometer, Volume2 } from 'lucide-react'
import { timeAgo } from '../utils/format'
import { Badge, StatusBadge } from './ui/Badge'
import { useApp } from '../context/AppContext'
import ProgressBar from './ui/ProgressBar'
import { classNames } from '../utils/helpers'

export default function DeviceCard({ device, onDispatch }: { device: Device; onDispatch?: (d: Device) => void }) {
  const { zoneName } = useApp()
  const online = device.status === 'online'
  const batteryTone = device.battery > 55 ? 'success' : device.battery > 30 ? 'warning' : 'danger'

  return (
    <div className="glass rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={classNames(
              'grid h-11 w-11 place-items-center rounded-xl',
              online ? 'grad-primary text-white' : 'bg-panel text-faint',
            )}
          >
            <Cpu size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink" title={device.name}>
              {device.name}
            </p>
            <p className="font-mono text-xs text-faint">{device.id} · {device.firmware}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={device.status} />
          {device.buzzerActive && (
            <Badge tone="dangerSoft">
              <Volume2 size={11} /> BUZZER
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl bg-panel p-2.5">
          <p className="flex items-center gap-1.5 text-faint">
            {online ? <Wifi size={12} className="text-success" /> : <WifiOff size={12} className="text-danger" />}
            Wi-Fi RSSI
          </p>
          <p className="mt-1 font-bold text-ink">{online ? `${device.wifiRssi} dBm` : '—'}</p>
        </div>
        <div className="rounded-xl bg-panel p-2.5">
          <p className="flex items-center gap-1.5 text-faint">
            <Thermometer size={12} className="text-warning" /> Temp
          </p>
          <p className="mt-1 font-bold text-ink">{device.temperature ? `${device.temperature.toFixed(1)}°C` : '—'}</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-faint">
            <Battery size={12} />
            Battery
          </span>
          <span className="font-bold text-muted">{online ? `${device.battery}%` : '—'}</span>
        </div>
        <ProgressBar value={device.battery} color={batteryTone} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[11px]">
        <span className="truncate text-faint">
          Zone: <span className="font-semibold text-muted">{zoneName(device.zoneId)}</span>
        </span>
        <span className="shrink-0 text-faint">
          {online ? `last ${timeAgo(device.lastComm)}` : `offline ${timeAgo(device.lastComm)} ago`}
        </span>
      </div>
    </div>
  )
}