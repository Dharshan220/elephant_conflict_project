import { DICTS, getDict, interpolate, type IntentKey, type LangCode, type TuskerDict } from './translations'
import type { AlertItem, Detection, Officer, ZonePrediction } from '../types'
import { formatTime } from '../utils/format'

export interface ChatContext {
  latestDetection: Detection | null
  zones: ZonePrediction[]
  recentAlerts: AlertItem[]
  officers: Officer[]
  onlineDevices: number
  totalDevices: number
  zoneName: (id: string) => string
}

export interface ChatAnswer {
  text: string
  intent: IntentKey
}

const ORDER: IntentKey[] = [
  'latestDetection',
  'highRiskZone',
  'currentAlerts',
  'todaySummary',
  'contactOfficer',
  'safetyTips',
  'safeRoute',
]

export function matchIntent(raw: string, dict: TuskerDict): IntentKey {
  const q = raw.toLowerCase()
  for (const key of ORDER) {
    const terms = [...dict.intents[key], ...DICTS.en.intents[key]]
    if (terms.some((t) => q.includes(t))) return key
  }
  return 'todaySummary'
}

export function buildAnswer(raw: string, lang: LangCode, ctx: ChatContext, forced?: IntentKey): ChatAnswer {
  const dict = getDict(lang)
  const intent = forced ?? matchIntent(raw, dict)
  const { latestDetection: latest, zones, recentAlerts, officers, onlineDevices, totalDevices, zoneName } = ctx
  const active = recentAlerts.filter((a) => a.status === 'active').length
  const top = [...zones].sort((a, b) => b.riskScore - a.riskScore)[0]

  switch (intent) {
    case 'latestDetection':
      return {
        intent,
        text: latest
          ? interpolate(dict.answers.lastDetection, {
              zone: zoneName(latest.zoneId),
              time: formatTime(latest.timestamp),
            })
          : dict.answers.detection,
      }

    case 'highRiskZone':
      return {
        intent,
        text: top
          ? interpolate(dict.answers.highRiskZone, {
              zone: top.zoneName,
              score: top.riskScore,
              prob: top.elephantProbability,
            })
          : interpolate(dict.answers.highRiskZone, { zone: 'Zone 3', score: 87, prob: 92 }),
      }

    case 'currentAlerts':
      return {
        intent,
        text: interpolate(dict.answers.activeAlerts, { n: Math.max(active, 1) }),
      }

    case 'todaySummary':
      return { intent, text: dict.answers.todayReport }

    case 'contactOfficer': {
      const officer = officers[0]
      return {
        intent,
        text: interpolate(dict.answers.contactOfficer, {
          name: officer?.name ?? 'Forest Officer',
          phone: officer?.phone ?? 'Control Room',
        }),
      }
    }

    case 'safetyTips':
      return { intent, text: dict.answers.safety }

    case 'safeRoute':
      return { intent, text: dict.answers.safety }

    default:
      return {
        intent: 'todaySummary',
        text: interpolate(dict.answers.todayStats, { n: 3, a: active }),
      }
  }
}