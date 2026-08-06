import type { PredictionsResponse, HourlyPrediction, HeatCell } from '../types'
import { ZONES, MODEL } from './static'

export function genPredictions(): PredictionsResponse {
  const hourly: HourlyPrediction[] = [
    { hour: 0, today: 62, tomorrow: 58 },
    { hour: 2, today: 71, tomorrow: 66 },
    { hour: 4, today: 44, tomorrow: 48 },
    { hour: 6, today: 22, tomorrow: 26 },
    { hour: 8, today: 18, tomorrow: 21 },
    { hour: 10, today: 24, tomorrow: 22 },
    { hour: 12, today: 21, tomorrow: 25 },
    { hour: 14, today: 30, tomorrow: 28 },
    { hour: 16, today: 46, tomorrow: 43 },
    { hour: 18, today: 78, tomorrow: 81 },
    { hour: 20, today: 89, tomorrow: 92 },
    { hour: 22, today: 83, tomorrow: 79 },
  ]

  const slots = ['00–04', '04–08', '08–12', '12–16', '16–20', '20–24']
  const heatmap: HeatCell[] = [
    { zoneId: 'z1', slot: '00–04', level: 1 },
    { zoneId: 'z1', slot: '04–08', level: 0 },
    { zoneId: 'z1', slot: '08–12', level: 0 },
    { zoneId: 'z1', slot: '12–16', level: 0 },
    { zoneId: 'z1', slot: '16–20', level: 1 },
    { zoneId: 'z1', slot: '20–24', level: 2 },
    { zoneId: 'z2', slot: '00–04', level: 3 },
    { zoneId: 'z2', slot: '04–08', level: 1 },
    { zoneId: 'z2', slot: '08–12', level: 0 },
    { zoneId: 'z2', slot: '12–16', level: 1 },
    { zoneId: 'z2', slot: '16–20', level: 2 },
    { zoneId: 'z2', slot: '20–24', level: 3 },
    { zoneId: 'z3', slot: '00–04', level: 2 },
    { zoneId: 'z3', slot: '04–08', level: 1 },
    { zoneId: 'z3', slot: '08–12', level: 0 },
    { zoneId: 'z3', slot: '12–16', level: 0 },
    { zoneId: 'z3', slot: '16–20', level: 2 },
    { zoneId: 'z3', slot: '20–24', level: 2 },
    { zoneId: 'z4', slot: '00–04', level: 1 },
    { zoneId: 'z4', slot: '04–08', level: 0 },
    { zoneId: 'z4', slot: '08–12', level: 0 },
    { zoneId: 'z4', slot: '12–16', level: 0 },
    { zoneId: 'z4', slot: '16–20', level: 1 },
    { zoneId: 'z4', slot: '20–24', level: 1 },
    { zoneId: 'z5', slot: '00–04', level: 3 },
    { zoneId: 'z5', slot: '04–08', level: 1 },
    { zoneId: 'z5', slot: '08–12', level: 0 },
    { zoneId: 'z5', slot: '12–16', level: 1 },
    { zoneId: 'z5', slot: '16–20', level: 2 },
    { zoneId: 'z5', slot: '20–24', level: 3 },
  ]

  return {
    zones: ZONES.map((z) => ({
      zoneId: z.id,
      zoneName: z.name,
      riskScore: z.riskScore,
      risk: z.risk,
      elephantProbability: Math.min(97, z.riskScore + 8),
      trend: z.id === 'z2' ? 12 : z.id === 'z5' ? 6 : z.id === 'z3' ? -4 : -2,
    })),
    hourly,
    heatmap,
    model: MODEL,
  }
}