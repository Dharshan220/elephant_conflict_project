import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import GlassCard from './GlassCard'
import AnimatedCounter from './AnimatedCounter'
import { classNames } from '../../utils/helpers'

export type StatTone = 'forest' | 'danger' | 'warning' | 'info' | 'slate'

const GRADIENTS: Record<StatTone, string> = {
  forest: 'grad-primary',
  danger: 'grad-danger',
  warning: 'grad-warning',
  info: 'grad-info',
  slate: 'bg-gradient-to-br from-slate-500 to-slate-700',
}

interface StatCardProps {
  label: string
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  icon: LucideIcon
  tone?: StatTone
  sublabel?: string
  delay?: number
}

export function StatCard({
  label,
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  icon: Icon,
  tone = 'forest',
  sublabel,
  delay = 0,
}: StatCardProps) {
  return (
    <GlassCard hover delay={delay} className="relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accentSoft blur-2xl" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-faint">{label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <AnimatedCounter
              value={value}
              suffix={suffix}
              prefix={prefix}
              decimals={decimals}
              className="font-display text-3xl font-bold text-ink"
            />
          </div>
          {sublabel && <p className="mt-1 truncate text-xs text-muted">{sublabel}</p>}
        </div>
        <motion.div
          whileHover={{ scale: 1.08, rotate: 3 }}
          className={classNames('grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-lg', GRADIENTS[tone])}
        >
          <Icon size={20} />
        </motion.div>
      </div>
    </GlassCard>
  )
}