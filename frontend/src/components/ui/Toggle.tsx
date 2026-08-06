import { motion } from 'framer-motion'
import { classNames } from '../../utils/helpers'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
}

export default function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={classNames('flex items-start gap-3 text-left', disabled && 'cursor-not-allowed opacity-50')}
    >
      <motion.span
        animate={{ backgroundColor: checked ? 'rgba(34,197,94,0.9)' : 'rgba(255,255,255,0.12)' }}
        className={classNames('mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors', checked ? 'justify-end' : 'justify-start')}
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className={classNames('h-5 w-5 rounded-full shadow', checked ? 'bg-white' : 'bg-muted/70')}
        />
      </motion.span>
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block text-sm font-semibold text-ink">{label}</span>}
          {description && <span className="mt-0.5 block text-xs leading-relaxed text-muted">{description}</span>}
        </span>
      )}
    </button>
  )
}