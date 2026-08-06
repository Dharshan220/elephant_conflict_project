import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { classNames } from '../../utils/helpers'

type Variant = 'primary' | 'danger' | 'warning' | 'outline' | 'ghost' | 'info'

const VARIANTS: Record<Variant, string> = {
  primary: 'grad-primary text-white shadow-lg shadow-emerald-900/30 hover:shadow-glow',
  danger: 'grad-danger text-white shadow-lg shadow-rose-900/30 hover:shadow-glow-danger',
  warning: 'grad-warning text-black shadow-lg hover:brightness-110',
  info: 'grad-info text-white shadow-lg hover:brightness-110',
  outline: 'border border-line bg-panel text-ink hover:bg-panelHover hover:border-accent/40',
  ghost: 'text-muted hover:bg-panel hover:text-ink',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', icon, loading, className, children, ...rest }: ButtonProps) {
  const sizes = {
    sm: 'gap-1.5 px-3 py-1.5 text-xs',
    md: 'gap-2 px-4 py-2.5 text-sm',
    lg: 'gap-2 px-5 py-3 text-base',
  }
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={classNames(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50',
        sizes[size],
        VARIANTS[variant],
        className,
      )}
      disabled={loading || rest.disabled}
      {...(rest as any)}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </motion.button>
  )
}

export function IconButton({ children, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={classNames(
        'inline-flex items-center justify-center rounded-lg border border-line bg-panel p-2 text-muted transition hover:border-accent/40 hover:text-ink',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}