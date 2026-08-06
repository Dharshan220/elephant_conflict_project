import type { Detection } from '../types'
import { formatTime } from '../utils/format'
import { classNames } from '../utils/helpers'
import { motion } from 'framer-motion'

interface CameraFeedProps {
  detection: Detection | null
  demo?: boolean
}

export default function CameraFeed({ detection, demo = false }: CameraFeedProps) {
  const conf = detection ? Math.round(detection.confidence * 100) : 0
  const boxColor = conf >= 90 ? 'border-danger' : conf >= 75 ? 'border-warning' : 'border-accent'
  const labelColor = conf >= 90 ? 'bg-danger' : conf >= 75 ? 'bg-warning text-black' : 'bg-accent text-black'

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="absolute inset-0">
        <div
          className="h-full w-full"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 30%, rgba(16,185,129,0.12), transparent 55%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: 'auto, 36px 36px, 36px 36px',
          }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      {detection ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className={classNames('absolute inset-x-[12%] top-[18%] bottom-[22%] rounded-lg border-2', boxColor)}
        >
          <span className="absolute -top-6 left-0 flex items-center gap-1.5 rounded-t-lg px-2 py-1 text-[11px] font-bold text-white">
            <span className={classNames('rounded-t-lg px-2 py-1', labelColor)}>{detection.animalClass}</span>
          </span>
          <span className={classNames('absolute -bottom-6 right-0 rounded-b-lg px-2 py-1 text-[11px] font-bold', labelColor)}>
            {conf}%
          </span>
          <span className="absolute left-2 bottom-8 text-[10px] font-semibold text-white/70">
            {detection.count} detected · {detection.adults} adults · {detection.calves} calves
          </span>
        </motion.div>
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <div className="relative">
            <span className="absolute inset-0 animate-pulseRing rounded-full bg-accent/30" />
            <span className="absolute inset-0 animate-pulseRing rounded-full bg-accent/20" style={{ animationDelay: '0.7s' }} />
            <div className="relative grid h-20 w-20 place-items-center rounded-full bg-accentSoft ring-1 ring-accent/40">
              <ScanLine />
            </div>
          </div>
          <p className="absolute bottom-12 text-center text-sm font-medium text-muted">
            {demo ? 'Awaiting simulated forest camera feed' : 'Awaiting camera feed'}
            <span className="mt-0.5 block text-xs text-faint">PIR triggers the capture pipeline on motion</span>
          </p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 animate-scan bg-gradient-to-b from-transparent via-accent/12 to-transparent" />

      <div className="absolute left-3 top-3 flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
          <span className="h-2 w-2 animate-blink rounded-full bg-danger" /> REC
        </span>
        <span className="rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
          YOLOv8n · Edge AI
        </span>
      </div>

      <div className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
        {detection ? `Detected ${formatTime(detection.timestamp)}` : 'No motion signal'}
      </div>
      <div className="absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
        1280p · 24 fps · {demo ? 'SIM' : 'LIVE'}
      </div>
    </div>
  )
}

function ScanLine() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="h-9 w-9 text-accent">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  )
}