import { useMemo, useState } from 'react'
import { Search, Download, List, Clock } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useApp } from '../context/AppContext'
import GlassCard from '../components/ui/GlassCard'
import { Badge } from '../components/ui/Badge'
import { Select } from '../components/ui/Form'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/Skeleton'
import { formatDateTime, formatTime, timeAgo } from '../utils/format'
import { toCsv, downloadFile, classNames } from '../utils/helpers'

export default function HistoryPage() {
  const { history } = useData()
  const { zoneName } = useApp()
  const [search, setSearch] = useState('')
  const [zone, setZone] = useState('all')
  const [view, setView] = useState<'table' | 'timeline'>('table')

  const zones = useMemo(() => [...new Set(history.map((h) => h.zoneId))], [history])

  const filtered = useMemo(() => {
    let list = [...history]
    if (zone !== 'all') list = list.filter((h) => h.zoneId === zone)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((h) => h.animalClass.toLowerCase().includes(q) || h.behavior.toLowerCase().includes(q) || h.id.toLowerCase().includes(q))
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [history, zone, search])

  const downloadCsv = () => {
    const rows = filtered.map((h) => [h.id, 2, zoneName(h.zoneId), h.animalClass, h.behavior, h.count, (h.confidence * 100).toFixed(1) + '%', formatDateTime(h.timestamp)])
    const csv = toCsv(['Detection ID', 'Device', 'Zone', 'Animal', 'Behaviour', 'Count', 'Confidence', 'Timestamp'], rows)
    downloadFile(`tuskerguard-detections-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv')
  }

  return (
    <div className="space-y-4">
      <GlassCard className="p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto_auto]">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search animal, behaviour, detection ID…"
              className="w-full rounded-xl border border-line bg-panel py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition placeholder:text-faint focus:border-accent/50"
            />
          </div>
          <Select value={zone} onChange={(e) => setZone(e.target.value)}>
            <option value="all">All zones</option>
            {zones.map((z) => (
              <option key={z} value={z}>{zoneName(z)}</option>
            ))}
          </Select>
          <div className="flex rounded-xl border border-line bg-panel p-1">
            <button
              onClick={() => setView('table')}
              className={classNames('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition', view === 'table' ? 'bg-accentSoft text-accent' : 'text-muted')}
            >
              <List size={13} /> Table
            </button>
            <button
              onClick={() => setView('timeline')}
              className={classNames('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition', view === 'timeline' ? 'bg-accentSoft text-accent' : 'text-muted')}
            >
              <Clock size={13} /> Timeline
            </button>
          </div>
          <Button variant="outline" size="sm" icon={<Download size={15} />} onClick={downloadCsv}>
            Download CSV
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        {filtered.length === 0 ? (
          <EmptyState icon={<Search size={24} />} title="No detections found" subtitle="Adjust filters or search term." />
        ) : view === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wider text-faint">
                  <th className="px-5 py-3.5">Detection</th>
                  <th className="px-4 py-3.5">Zone</th>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Behaviour</th>
                  <th className="px-4 py-3.5">Count</th>
                  <th className="px-4 py-3.5">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((h) => (
                  <tr key={h.id} className="border-b border-line/60 transition hover:bg-panelHover/50">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-bold text-ink">{h.id}</span>
                      <p className="mt-0.5 text-xs font-semibold text-muted">{h.animalClass}</p>
                    </td>
                    <td className="px-4 py-3.5"><Badge tone="neutral">{zoneName(h.zoneId)}</Badge></td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-ink">{formatDateTime(h.timestamp)}</span>
                      <p className="text-[11px] text-faint">{timeAgo(h.timestamp)}</p>
                    </td>
                    <td className="px-4 py-3.5"><Badge tone="infoSoft">{h.behavior}</Badge></td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-ink">{h.count}</span>
                      <span className="text-[11px] text-faint"> ({h.adults} ad · {h.calves} cf)</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-panelHover">
                          <div
                            className={classNames('h-full rounded-full', h.confidence > 0.9 ? 'bg-danger' : h.confidence > 0.75 ? 'bg-warning' : 'bg-success')}
                            style={{ width: `${h.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-muted">{(h.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-0 px-5 py-6">
            {filtered.map((h, i) => (
              <div key={h.id} className="relative flex gap-4 pb-6">
                {i < filtered.length - 1 && <span className="absolute left-[15px] top-9 bottom-0 w-px bg-line" />}
                <span
                  className={classNames(
                    'relative z-10 mt-2 h-2 w-8 shrink-0 rounded-full',
                    h.confidence > 0.9 ? 'bg-danger' : h.confidence > 0.75 ? 'bg-warning' : 'bg-success',
                  )}
                />
                <div className="min-w-0 flex-1 rounded-xl border border-line bg-panel p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-faint">{h.id}</span>
                    <Badge tone="infoSoft">{h.behavior}</Badge>
                    <Badge tone={h.confidence > 0.9 ? 'danger' : 'warning'}>{Math.round(h.confidence * 100)}% conf</Badge>
                    <span className="ml-auto text-xs text-muted">{formatTime(h.timestamp)} · {timeAgo(h.timestamp)}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ink">
                    {h.animalClass} · {h.count} animal{h.count > 1 ? 's' : ''} ({h.adults} adults, {h.calves} calves)
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Zone <span className="font-semibold text-accent">{zoneName(h.zoneId)}</span> · direction: {h.direction}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}