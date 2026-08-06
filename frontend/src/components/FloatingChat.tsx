import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'
import ChatPanel from './chat/ChatPanel'
import ElephantLogo from './ElephantLogo'

export default function FloatingChat() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-5 right-4 z-[70] flex flex-col items-end gap-3 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-[min(92vw,400px)]"
          >
            <div style={{ height: 'min(600px, calc(100vh - 140px))' }}>
              <ChatPanel onClose={() => setOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => setOpen(true)}
            title="Open Tusker AI Assistant"
            className="grad-primary relative grid h-14 w-14 place-items-center rounded-full text-white shadow-glow transition hover:scale-105"
          >
            <span className="absolute inset-0 animate-pulseRing rounded-full bg-accent/40" />
            <ElephantLogo className="relative z-10 h-7 w-7" />
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-success ring-2 ring-surface" />
          </motion.button>
        )}
      </AnimatePresence>

      {open && (
        <button
          onClick={() => setOpen(false)}
          title="Close"
          className="grad-primary grid h-14 w-14 place-items-center rounded-full text-white shadow-glow transition hover:scale-105"
        >
          <X size={22} />
        </button>
      )}
    </div>
  )
}