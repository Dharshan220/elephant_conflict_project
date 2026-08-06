export type RiskLevel = 'low' | 'medium' | 'high'
export type Severity = 'critical' | 'warning' | 'info'
export type AlertStatus = 'active' | 'acknowledged' | 'resolved'
export type DeviceStatus = 'online' | 'offline' | 'warning'

export interface Zone {
  id: string
  name: string
  district: string
  risk: RiskLevel
  riskScore: number
  lat: number
  lng: number
  radius: number
  officerIds: string[]
  elephantCount: number
  lastDetection: string | null
  description: string
}

export interface Officer {
  id: string
  name: string
  role: string
  zoneId: string
  phone: string
  status: 'available' | 'on-patrol' | 'off-duty'
}

export interface Device {
  id: string
  name: string
  zoneId: string
  ip: string
  wifiRssi: number
  battery: number
  sensorOk: boolean
  status: DeviceStatus
  lastComm: string
  firmware: string
  temperature: number
  buzzerActive: boolean
}

export interface Detection {
  id: string
  deviceId: string
  zoneId: string
  animalClass: string
  confidence: number
  count: number
  adults: number
  calves: number
  behavior: string
  direction: string
  timestamp: string
  imageUrl: string | null
  markedSafe: boolean
}

export interface AlertItem {
  id: string
  zoneId: string
  severity: Severity
  status: AlertStatus
  title: string
  message: string
  timestamp: string
  officerId: string | null
  deviceId: string
}

export type ActivityType =
  | 'motion'
  | 'detection'
  | 'alert'
  | 'ack'
  | 'device'
  | 'patrol'
  | 'buzzer'
  | 'safe'

export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: string
}

export interface Weather {
  temp: number
  humidity: number
  windSpeed: number
  condition: string
  rainfall: string
  updatedAt: string
}

export interface Stats {
  systemStatus: string
  uptime: string
  todayDetections: number
  activeAlerts: number
  onlineDevices: number
  totalDevices: number
  highRiskZone: string
  modelStatus: string
}

export interface DashboardResponse {
  stats: Stats
  weather: Weather
  activity: ActivityItem[]
  recentAlerts: AlertItem[]
  latestDetection: Detection | null
}

export interface ZonePrediction {
  zoneId: string
  zoneName: string
  riskScore: number
  risk: RiskLevel
  elephantProbability: number
  trend: number
}

export interface HourlyPrediction {
  hour: number
  today: number
  tomorrow: number
}

export interface HeatCell {
  zoneId: string
  slot: string
  level: 0 | 1 | 2 | 3
}

export interface ModelMeta {
  model: string
  accuracy: number
  mae: number
  datasetSize: number
  lastTrained: string
  inferenceMs: number
}

export interface PredictionsResponse {
  zones: ZonePrediction[]
  hourly: HourlyPrediction[]
  heatmap: HeatCell[]
  model: ModelMeta
}

export interface AnalyticsResponse {
  daily: number[]
  weekly: number[]
  monthly: number[]
  zoneComparison: { zone: string; count: number }[]
  behavior: { label: string; value: number }[]
  severity: { label: string; value: number }[]
  hourly: number[]
  confidenceAvg: number
  total30d: number
  alertsResolvedPct: number
  activeOfficers: number
}

export interface ReportData {
  summary: string
  recommendations: string[]
  stats: {
    detections: number
    topZone: string
    alertsRaised: number
    acknowledged: number
    activeOfficers: number
  }
  generatedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  text: string
  time: string
}

export interface AppSettings {
  alertSound: boolean
  darkMode: boolean
  smsEnabled: boolean
  emailEnabled: boolean
  zoneNames: Record<string, string>
  scanInterval: number
  buzzerDuration: number
  sensitivity: number
}

export interface SimulateResponse {
  accepted: boolean
  eventId: string
  message: string
  detection?: Detection
  alert?: AlertItem
}

// ================================================================
// Elephant Early Warning System (module 2-10 types)
// ================================================================

export interface UserInfo {
  id: number
  name: string
  email: string
  phone: string
  village: string
  latitude: number
  longitude: number
  isAdmin: boolean
}

export interface AuthResponse {
  token: string
  user: UserInfo
}

export interface CameraItem {
  id: number
  name: string
  latitude: number
  longitude: number
  village: string
  status: string
  created_at: string
}

export interface AlertRecord {
  id: number
  alert_id: string
  animal: string
  confidence: number
  camera: string
  village: string
  latitude: number
  longitude: number
  time: string
  status: 'active' | 'resolved'
  created_at: string
}

export interface EmergencyContact {
  label: string
  phone: string
  type: string
}

export interface AdminStats {
  totalDetections: number
  activeAlerts: number
  totalUsers: number
  totalCameras: number
  latestAlert: AlertRecord | null
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone: string
  village: string
  latitude: number
  longitude: number
}
