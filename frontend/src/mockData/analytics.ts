import type { AnalyticsResponse } from '../types'

export function genAnalytics(): AnalyticsResponse {
  return {
    daily: [12, 18, 9, 21, 15, 27, 19],
    weekly: [84, 96, 61, 118, 132, 74, 105, 128],
    monthly: [302, 341, 288, 367, 421, 389],
    zoneComparison: [
      { zone: 'BRT Corridor', count: 48 },
      { zone: 'Muthanga', count: 142 },
      { zone: 'Hassan', count: 89 },
      { zone: 'Valparai', count: 34 },
      { zone: 'Mudumalai', count: 117 },
    ],
    behavior: [
      { label: 'Moving', value: 46 },
      { label: 'Standing', value: 22 },
      { label: 'Grazing', value: 18 },
      { label: 'Running', value: 6 },
      { label: 'Returning to Forest', value: 8 },
    ],
    severity: [
      { label: 'Critical', value: 14 },
      { label: 'Warning', value: 43 },
      { label: 'Info', value: 39 },
    ],
    hourly: [8, 5, 3, 2, 1, 2, 3, 5, 9, 12, 11, 14, 16, 12, 15, 18, 21, 26, 31, 28, 24, 18, 12, 9],
    confidenceAvg: 88.7,
    total30d: 430,
    alertsResolvedPct: 78,
    activeOfficers: 4,
  }
}