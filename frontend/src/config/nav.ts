import {
  LayoutDashboard,
  ScanEye,
  Map,
  BellRing,
  History,
  BarChart3,
  Cpu,
  BrainCircuit,
  Bot,
  Settings,
  Home,
  Radio,
  Radar,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { UIKey } from '../i18n/ui'

export interface NavItem {
  path: string
  label: string
  labelKey: UIKey
  icon: LucideIcon
  section?: string
  adminOnly?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/app', label: 'My Dashboard', labelKey: 'navDashboard', icon: Home, section: 'Monitoring' },
  { path: '/app/live', label: 'Live Alerts', labelKey: 'navLive', icon: Radio, section: 'Monitoring' },
  { path: '/app/zones', label: 'Zone Map', labelKey: 'navZones', icon: Map, section: 'Monitoring' },
  { path: '/app/alerts', label: 'Alerts', labelKey: 'navAlerts', icon: BellRing, section: 'Monitoring' },
  { path: '/app/history', label: 'History', labelKey: 'navHistory', icon: History, section: 'Monitoring' },
  { path: '/app/analytics', label: 'Analytics', labelKey: 'navAnalytics', icon: BarChart3, section: 'Intelligence' },
  { path: '/app/feeds', label: 'Camera Feeds', labelKey: 'navLive', icon: ScanEye, section: 'Intelligence' },
  { path: '/app/devices', label: 'Devices', labelKey: 'navDevices', icon: Cpu, section: 'Intelligence' },
  { path: '/app/predict', label: 'AI Prediction', labelKey: 'navPredict', icon: BrainCircuit, section: 'Intelligence' },
  { path: '/app/assistant', label: 'AI Assistant', labelKey: 'navAssistant', icon: Bot, section: 'Intelligence' },
  { path: '/app/admin', label: 'Admin Center', labelKey: 'navSys', icon: Radar, section: 'System', adminOnly: true },
  { path: '/app/settings', label: 'Settings', labelKey: 'navSettings', icon: Settings, section: 'System' },
]
