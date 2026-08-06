import { useCallback, useEffect, useState } from 'react'
import { Download, Search, History } from 'lucide-react'
import { api } from '../services/api'
import GlassCard from '../components/ui/GlassCard'
import type { AlertRecord } from '../types'

type Range = '' | 'today' | 'week' | 'month'

const RANGES: { key: Range; label: string }[] = [
  { key: '', label: 'All time' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Last Week' },
  { key: 'month', label: 'Last Month' },
]

export default function AlertHistoryPage() {
  const [range, setRange] = useState<Range>('month')
  const [village, setVillage] = useState('')
  const [rows, setRows] = useState<AlertRecord[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    api
      .fetchAlertFeed(range, village.trim())
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [range, village])

  useEffect(() => {
    const t = window.setTimeout(load, 250) // debounce the village search
    return () => window.clearTimeout(t)
  }, [load])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-accentSoft text-accent">
            <History size={20} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Alert History</h2>
            <p className="text-sm text-muted">{rows.length} record(s) · filter by date range and village</p>
          </div>
        </div>
        <button
          onClick={() => api.exportAlertsCSV(range, village.trim())}
          className="flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2.5 text-sm font-bold transition hover:border-accent/40 hover:text-accent"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-line bg-panel p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  range === r.key ? 'bg-accent text-white' : 'text-muted hover:text-ink'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <label className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="Search by village…"
              className="w-full rounded-xl border border-line bg-panel py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-faint focus:border-accent/50"
            />
          </label>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[10px] font-bold uppercase tracking-wider text-faint">
                <th className="py-2.5 pr-3">Date</th>
                <th className="py-2.5 pr-3">Time</th>
                <th className="py-2.5 pr-3">Village</th>
                <th className="py-2.5 pr-3">Camera</th>
                <th className="py-2.5 pr-3">Confidence</th>
                <th className="py-2.5 pr-3">Alert ID</th>
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const d = new Date(a.time)
                return (
                  <tr key={a.alert_id} className="border-b border-line/60 transition hover:bg-panel/60">
                    <td className="py-2.5 pr-3 text-muted">{d.toLocaleDateString()}</td>
                    <td className="py-2.5 pr-3 text-muted">{d.toLocaleTimeString()}</td>
                    <td className="py-2.5 pr-3 font-semibold">{a.village || '—'}</td>
                    <td className="py-2.5 pr-3 font-mono text-xs">{a.camera}</td>
                    <td className="py-2.5 pr-3">
                      <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-bold text-warning">
                        {Math.round(a.confidence * 100)}%
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-xs text-faint">{a.alert_id}</td>
                    <td className="py-2.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          a.status === 'active' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!loading && rows.length === 0 && <p className="py-10 text-center text-sm text-faint">No alerts match these filters.</p>}
          {loading && <p className="py-10 text-center text-sm text-faint">Loading…</p>}
        </div>
      </GlassCard>
    </div>
  )
}
