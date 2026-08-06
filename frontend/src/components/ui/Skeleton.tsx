import type { ReactNode } from 'react'
import GlassCard from './GlassCard'
import { classNames } from '../../utils/helpers'

export function Skeleton({ className }: { className?: string }) {
  return <div className={classNames('animate-pulse rounded-xl bg-panelHover', className)} />
}

export function CardSkeleton({ className, rows = 1 }: { className?: string; rows?: number }) {
  return (
    <GlassCard className={classNames('p-5', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-24" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </GlassCard>
  )
}

export function SkeletonGroup({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function EmptyState({ icon, title, subtitle, action }: { icon: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-panel text-faint">{icon}</div>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        {subtitle && <p className="mt-1 max-w-sm text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}