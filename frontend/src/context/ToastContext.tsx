import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react'
import { uid } from '../utils/helpers'

export type ToastKind = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  kind: ToastKind
  title: string
  message?: string
}

interface ToastContextValue {
  push: (kind: ToastKind, title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS = {
  success: { icon: CheckCircle2, cls: 'text-success', bar: 'bg-success' },
  error: { icon: XCircle, cls: 'text-danger', bar: 'bg-danger' },
  warning: { icon: AlertTriangle, cls: 'text-warning', bar: 'bg-warning' },
  info: { icon: Info, cls: 'text-info', bar: 'bg-info' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const push = useCallback((kind: ToastKind, title: string, message?: string) => {
    const id = uid('toast')
    setToasts((t) => [...t.slice(-4), { id, kind, title, message }])
    window.setTimeout(() => dismiss(id), 5200)
  }, [dismiss])

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[1200] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const meta = ICONS[t.kind]
            const Icon = meta.icon
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="glass relative overflow-hidden rounded-2xl p-3.5 pl-4 shadow-card"
              >
                <span className={`absolute inset-y-0 left-0 w-1 ${meta.bar}`} />
                <div className="flex items-start gap-3">
                  <Icon size={18} className={`mt-0.5 shrink-0 ${meta.cls}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{t.title}</p>
                    {t.message && <p className="mt-0.5 text-xs leading-relaxed text-muted">{t.message}</p>}
                  </div>
                  <button
                    onClick={() => dismiss(t.id)}
                    className="shrink-0 rounded-lg p-1 text-faint transition hover:bg-panelHover hover:text-ink"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}