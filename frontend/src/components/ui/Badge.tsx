import type { ReactNode } from 'react'
import { classNames } from '../../utils/helpers'

export type BadgeTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'accent' | 'dangerSoft' | 'warningSoft' | 'infoSoft' | 'successSoft'

const TONES: Record<BadgeTone, string> = {
  success: 'bg-success text-accent-ink',
  danger: 'bg-danger text-white',
  warning: 'bg-warning text-black',
  info: 'bg-info text-white',
  neutral: 'bg-panel text-muted border border-line',
  accent: 'bg-accent text-accent-ink',
  dangerSoft: 'bg-danger-soft text-danger',
  warningSoft: 'bg-warning-soft text-warning',
  infoSoft: 'bg-info/15 text-info',
  successSoft: 'bg-success/15 text-success',
}

export function Badge({ tone = 'neutral', children, className, dot }: { tone?: BadgeTone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={classNames('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold', TONES[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export function SeverityBadge({ severity }: { severity: 'critical' | 'warning' | 'info' }) {
  const tone: BadgeTone = severity === 'critical' ? 'danger' : severity === 'warning' ? 'warning' : 'info'
  return (
    <Badge tone={tone} dot={severity !== 'info'}>
      {severity.toUpperCase()}
    </Badge>
  )
}

export function RiskBadge({ risk }: { risk: 'low' | 'medium' | 'high' }) {
  const tone: BadgeTone = risk === 'high' ? 'danger' : risk === 'medium' ? 'warning' : 'successSoft'
  return (
    <Badge tone={tone} dot>
      {risk.toUpperCase()}
    </Badge>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const tone: BadgeTone =
    status === 'online' || status === 'resolved' || status === 'available'
      ? 'successSoft'
      : status === 'offline' || status === 'critical'
        ? 'dangerSoft'
        : status === 'warning' || status === 'active' || status === 'on-patrol' || status === 'acknowledged'
          ? 'warningSoft'
          : 'neutral'
  return (
    <Badge tone={tone} dot>
      {status.replace('-', ' ').toUpperCase()}
    </Badge>
  )
}