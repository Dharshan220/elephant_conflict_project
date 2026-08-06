import type { DashboardResponse, Detection, Zone } from '../types'
import { ZONES, WEATHER, MODEL } from './static'
import { genActivity, genAlerts } from './alerts'
import { genHistory } from './history'
import { minutesAgo } from '../utils/format'

export function genDashboard(): DashboardResponse {
  const detections = genHistory()
  const latest: Detection | null = detections[0] ?? null
  const todayCount = detections.filter((d) => new Date(d.timestamp).getDate() === new Date().getDate()).length

  const stats: DashboardResponse['stats'] = {
    systemStatus: 'Operational',
    uptime: '14d 6h',
    todayDetections: Math.max(6, todayCount),
    activeAlerts: 2,
    onlineDevices: 8,
    totalDevices: 10,
    highRiskZone: ZONES.find((z) => z.risk === 'high')?.name ?? 'Muthanga Fringe',
    modelStatus: `${MODEL.model} · ${MODEL.inferenceMs} ms`,
  }

  return {
    stats,
    weather: { ...WEATHER, updatedAt: minutesAgo(0) },
    activity: genActivity(),
    recentAlerts: genAlerts().slice(0, 5),
    latestDetection: latest,
  }
}

export function latestDetectionFor(zones: Zone[]): Detection | null {
  const det = genHistory()[0]
  if (det) {
    return { ...det, timestamp: minutesAgo(0) }
  }
  return null
}