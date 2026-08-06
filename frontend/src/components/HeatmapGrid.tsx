import type { HeatCell, Zone } from '../types'
import { classNames } from '../utils/helpers'
import { useApp } from '../context/AppContext'

interface HeatmapGridProps {
  cells: HeatCell[]
  zones: Zone[]
}

const LEVELS = {
  0: 'bg-emerald-500/15 text-emerald-400',
  1: 'bg-lime-500/15 text-lime-400',
  2: 'bg-amber-500/20 text-amber-400',
  3: 'bg-red-500/25 text-red-400',
}

export default function HeatmapGrid({ cells, zones }: HeatmapGridProps) {
  const { zoneName } = useApp()
  const slots = [...new Set(cells.map((c) => c.slot))]

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-1.5">
          <thead>
            <tr>
              <th className="pb-1 text-left text-[11px] font-bold uppercase tracking-wide text-faint">Zone</th>
              {slots.map((s) => (
                <th key={s} className="pb-1 text-center text-[11px] font-bold uppercase tracking-wide text-faint">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.id}>
                <td className="pr-2 text-xs font-semibold text-muted">
                  <span className="block max-w-[170px] truncate" title={zoneName(z.id)}>
                    {zoneName(z.id)}
                  </span>
                </td>
                {slots.map((s) => {
                  const cell = cells.find((c) => c.zoneId === z.id && c.slot === s)
                  const level = cell?.level ?? 0
                  return (
                    <td key={s} className={classNames('h-9 rounded-lg text-center text-[11px] font-bold', LEVELS[level])}>
                      {level === 0 ? '·' : ['L', 'M', 'H', 'VH'][level]}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-medium text-muted">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-500/15" />Low</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-lime-500/15" />Med</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-500/20" />High</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-500/25" />Very high</span>
      </div>
    </div>
  )
}