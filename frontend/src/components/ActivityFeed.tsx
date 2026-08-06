import type { ActivityItem } from '../types'
import { Activity, ScanEye, BellRing, CheckCheck, Wifi, Car, Volume2, ShieldCheck } from 'lucide-react'
import type { ActivityType } from '../types'
import { timeAgo, formatTime } from '../utils/format'
import { classNames } from '../utils/helpers'

const ICONS: Record<ActivityType, { icon: typeof Wifi; cls: string }> = {
  motion: { icon: Activity, cls: 'bg-info/15 text-info' },
  detection: { icon: ScanEye, cls: 'bg-accentSoft text-accent' },
  alert: { icon: BellRing, cls: 'bg-danger-soft text-danger' },
  ack: { icon: CheckCheck, cls: 'bg-success/15 text-success' },
  device: { icon: Wifi, cls: 'bg-warning-soft text-warning' },
  patrol: { icon: Car, cls: 'bg-violet-500/15 text-violet-400' },
  buzzer: { icon: Volume2, cls: 'bg-amber-500/15 text-amber-500' },
  safe: { icon: ShieldCheck, cls: 'bg-teal-500/15 text-teal-400' },
}

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="space-y-1">
      {items.map((item, i) => {
        const meta = ICONS[item.type]
        const Icon = meta.icon
        return (
          <div key={item.id} className="group relative flex gap-3 rounded-xl px-2 py-2.5 transition hover:bg-panelHover">
            {i < items.length - 1 && <span className="absolute left-[27px] top-11 bottom-0 w-px bg-line" />}
            <span className={classNames('relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-xl', meta.cls)}>
              <Icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                <span className="shrink-0 text-[11px] font-medium text-faint" title={formatTime(item.timestamp)}>
                  {timeAgo(item.timestamp)}
                </span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{item.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}