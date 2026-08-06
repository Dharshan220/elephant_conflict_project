import type { ReactNode } from 'react'
import { classNames } from '../../utils/helpers'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export default function SectionHeader({ title, subtitle, icon, action, className }: SectionHeaderProps) {
  return (
    <div className={classNames('flex flex-wrap items-center justify-between gap-3', className)}>
      <div className="flex items-center gap-3">
        {icon && <div className="grid h-9 w-9 place-items-center rounded-xl bg-accentSoft text-accent">{icon}</div>}
        <div>
          <h2 className="font-display text-base font-bold text-ink sm:text-lg">{title}</h2>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}