import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  wide?: boolean
}

export default function Modal({ open, onClose, title, subtitle, children, wide }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1100] grid place-items-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className={classNamesFor('glass relative w-full rounded-3xl border-line shadow-2xl', wide ? 'max-w-3xl' : 'max-w-lg')}
            style={{ maxHeight: '90vh' }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
                {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="rounded-lg p-2 text-muted transition hover:bg-panelHover hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function classNamesFor(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ')
}