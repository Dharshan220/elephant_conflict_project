import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { classNames } from '../../utils/helpers'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  delay?: number
}

export default function GlassCard({ children, className, hover = false, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className={classNames('glass rounded-2xl shadow-card', hover && 'card-hover', className)}
    >
      {children}
    </motion.div>
  )
}