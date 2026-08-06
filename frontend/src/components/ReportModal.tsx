import { useEffect, useState } from 'react'
import { FileText, Sparkles, TrendingUp, Users, BadgeCheck, Loader2 } from 'lucide-react'
import Modal from './ui/Modal'
import { useData } from '../context/DataContext'
import { useApp } from '../context/AppContext'
import { formatDateTime } from '../utils/format'

interface ReportModalProps {
  open: boolean
  onClose: () => void
}

export default function ReportModal({ open, onClose }: ReportModalProps) {
  const { fetchReport } = useData()
  const { zoneName } = useApp()
  const [report, setReport] = useState<Awaited<ReturnType<typeof fetchReport>> | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setLoading(true)
      setReport(null)
      fetchReport().then((r) => {
        setReport(r)
        setLoading(false)
      })
    }
  }, [open, fetchReport])

  return (
    <Modal open={open} onClose={onClose} title="AI Incident Summary" subtitle="Auto-generated daily intelligence report" wide>
      {loading || !report ? (
        <div className="grid place-items-center py-16" style={{ minHeight: 320 }}>
          <div className="flex flex-col items-center gap-3 text-muted">
            <Loader2 size={28} className="animate-spin text-accent" />
            <p className="text-sm font-medium">Analysing today's detection feed…</p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-2xl bg-accentSoft p-4 ring-1 ring-accent/20">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl grad-primary text-white">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-accent">AI Generated Summary</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink">{report.summary}</p>
              <p className="mt-2 text-xs text-faint">Generated at {formatDateTime(report.generatedAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ReportStat icon={<ScanCnt />} label="Detections" value={report.stats.detections} tone="text-accent" />
            <ReportStat icon={<TrendingUp size={16} className="text-warning" />} label="Top zone" value={shortZone(report.stats.topZone)} tone="text-warning" />
            <ReportStat icon={<BadgeCheck size={16} className="text-info" />} label="Alerts ack." value={`${report.stats.acknowledged}/${report.stats.alertsRaised}`} tone="text-info" />
            <ReportStat icon={<Users size={16} className="text-success" />} label="Officers active" value={report.stats.activeOfficers} tone="text-success" />
          </div>

          <div>
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
              <FileText size={16} className="text-info" /> Recommended Actions
            </p>
            <ul className="space-y-2">
              {report.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl border border-line bg-panel px-3.5 py-3 text-sm text-muted">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-info/15 text-[11px] font-bold text-info">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-center text-[11px] text-faint">
            Recommendations reference live zones · {zoneName('z2')} flagged as highest activity
          </p>
        </div>
      )}
    </Modal>
  )
}

function shortZone(name: string): string {
  return name.length > 14 ? name.split('–')[0].trim().slice(0, 14) + '…' : name
}

function ScanCnt() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-accent">
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
    </svg>
  )
}

function ReportStat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string | number; tone: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-3.5 text-center">
      <div className={`mx-auto mb-1.5 grid h-9 w-9 place-items-center rounded-xl bg-panel ${tone}`}>{icon}</div>
      <p className="font-display text-xl font-bold text-ink">{value}</p>
      <p className="text-[11px] font-medium text-faint">{label}</p>
    </div>
  )
}