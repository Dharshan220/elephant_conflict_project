import type { AlertItem } from '../types'
import { SeverityBadge, StatusBadge } from './ui/Badge'
import { timeAgo } from '../utils/format'
import { useApp } from '../context/AppContext'
import { CheckCheck } from 'lucide-react'

interface RecentAlertsProps {
  alerts: AlertItem[]
  onAck: (id: string) => void
}

export default function RecentAlerts({ alerts, onAck }: RecentAlertsProps) {
  const { zoneName } = useApp()
  return (
    <div className="space-y-2">
      {alerts.map((a) => (
        <div key={a.id} className="group rounded-xl border border-line bg-panel/60 p-3 transition hover:bg-panelHover">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-faint">{a.id}</span>
                <SeverityBadge severity={a.severity} />
                <StatusBadge status={a.status} />
              </div>
              <p className="mt-1.5 text-sm font-semibold text-ink">{a.title}</p>
              <p className="mt-0.5 truncate text-xs text-muted">
                {zoneName(a.zoneId)} · {timeAgo(a.timestamp)}
              </p>
            </div>
            {a.status === 'active' && (
              <button
                onClick={() => onAck(a.id)}
                className="mt-1 shrink-0 rounded-lg border border-line bg-panel p-2 text-muted transition hover:border-success/40 hover:text-success"
                title="Acknowledge"
              >
                <CheckCheck size={15} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}