import { motion } from 'framer-motion'
import { classNames } from '../../utils/helpers'

interface ProgressBarProps {
  value: number
  color?: 'danger' | 'warning' | 'success' | 'info' | 'accent'
  className?: string
  showLabel?: boolean
}

const COLORS = {
  danger: 'bg-danger',
  warning: 'bg-warning',
  success: 'bg-success',
  info: 'bg-info',
  accent: 'bg-accent',
}

export default function ProgressBar({ value, color = 'accent', className, showLabel = false }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className={classNames('flex items-center gap-2', className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-panelHover">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 20 }}
          className={classNames('h-full rounded-full', COLORS[color])}
        />
      </div>
      {showLabel && <span className="w-10 text-right text-xs font-bold text-muted">{v.toFixed(0)}%</span>}
    </div>
  )
}