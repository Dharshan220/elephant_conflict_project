import { useMemo, useState } from 'react'
import { Search, CheckCheck, BellRing, ArrowUpDown } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useApp } from '../context/AppContext'
import GlassCard from '../components/ui/GlassCard'
import { Badge, SeverityBadge, StatusBadge } from '../components/ui/Badge'
import { Select, Input } from '../components/ui/Form'
import { EmptyState } from '../components/ui/Skeleton'
import { formatTime, timeAgo } from '../utils/format'
import { OFFICERS } from '../mockData/static'

type SortKey = 'time' | 'severity'

export default function AlertsPage() {
  const { alerts, acknowledgeAlert, loading } = useData()
  const { zoneName } = useApp()
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState<SortKey>('time')

  const filtered = useMemo(() => {
    let list = [...alerts]
    if (severity !== 'all') list = list.filter((a) => a.severity === severity)
    if (status !== 'all') list = list.filter((a) => a.status === status)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.title.toLowerCase().includes(q) ||
          zoneName(a.zoneId).toLowerCase().includes(q) ||
          a.message.toLowerCase().includes(q),
      )
    }
    const order = { critical: 0, warning: 1, info: 2 }
    list.sort((a, b) =>
      sort === 'time' ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime() : order[a.severity] - order[b.severity],
    )
    return list
  }, [alerts, severity, status, search, sort, zoneName])

  const officerName = (id: string | null) => OFFICERS.find((o) => o.id === id)?.name ?? '—'

  return (
    <div className="space-y-4">
      <GlassCard className="p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_160px_160px_150px_auto]">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, zone, title, message…"
              className="w-full rounded-xl border border-line bg-panel py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition placeholder:text-faint focus:border-accent/50"
            />
          </div>
          <Select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="time">Sort: newest</option>
            <option value="severity">Sort: severity</option>
          </Select>
          <div className="hidden items-center gap-2 rounded-xl border border-line bg-panel px-4 text-xs font-semibold text-muted md:flex">
            <ArrowUpDown size={13} className="text-faint" /> {filtered.length} alerts
          </div>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        {filtered.length === 0 ? (
          <EmptyState icon={<BellRing size={24} />} title="No alerts match" subtitle="Try clearing filters or search terms." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wider text-faint">
                  <th className="px-5 py-3.5">Alert ID</th>
                  <th className="px-4 py-3.5">Zone</th>
                  <th className="px-4 py-3.5">Time</th>
                  <th className="px-4 py-3.5">Severity</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Assigned Officer</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-line/60 transition hover:bg-panelHover/50">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-bold text-ink">{a.id}</span>
                      <p className="mt-0.5 max-w-[260px] truncate text-xs text-muted">{a.title}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone="neutral">{zoneName(a.zoneId)}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-ink">{formatTime(a.timestamp)}</span>
                      <p className="text-[11px] text-faint">{timeAgo(a.timestamp)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <SeverityBadge severity={a.severity} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-muted">{officerName(a.officerId)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end">
                        {a.status === 'active' ? (
                          <button
                            onClick={() => acknowledgeAlert(a.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-bold text-muted transition hover:border-success/40 hover:text-success"
                          >
                            <CheckCheck size={13} /> Acknowledge
                          </button>
                        ) : (
                          <span className="text-[11px] text-faint">{a.status === 'resolved' ? 'Resolved' : 'Acknowledged'}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  )
}