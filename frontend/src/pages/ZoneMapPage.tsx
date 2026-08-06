import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, CircleMarker, Marker, Polygon, Popup, Tooltip } from 'react-leaflet'
import { MapPin, ShieldAlert, Clock, User, PawPrint, Camera, Radio, Home } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { useData } from '../context/DataContext'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useLiveAlerts } from '../context/LiveAlertContext'
import { api } from '../services/api'
import GlassCard from '../components/ui/GlassCard'
import { RiskBadge } from '../components/ui/Badge'
import { CardSkeleton } from '../components/ui/Skeleton'
import { formatTime, timeAgo } from '../utils/format'
import type { Zone, CameraItem } from '../types'
import { OFFICERS } from '../mockData/static'

const RISK_STYLE = {
  high: { color: '#e5484d', fill: '#e5484d', opacity: 0.95 },
  medium: { color: '#f5a623', fill: '#f5a623', opacity: 0.9 },
  low: { color: '#22c55e', fill: '#22c55e', opacity: 0.85 },
}

const LEGEND = [
  { label: 'High risk', cls: 'bg-danger' },
  { label: 'Medium risk', cls: 'bg-warning' },
  { label: 'Low risk', cls: 'bg-success' },
  { label: 'Elephant', cls: 'bg-danger ring-2 ring-danger/40' },
  { label: 'Camera', cls: 'bg-info' },
  { label: 'You', cls: 'bg-accent' },
]

// Sample forest boundary polygon (Mudumalai–BRT belt) for the demo grid.
const FOREST_BOUNDARY: [number, number][] = [
  [11.95, 76.2],
  [12.1, 76.7],
  [11.85, 77.15],
  [11.6, 77.1],
  [11.45, 76.6],
  [11.7, 76.25],
]

function divIcon(html: string, size: [number, number] = [30, 30]) {
  return L.divIcon({
    className: 'bg-transparent',
    html,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
  })
}

export default function ZoneMapPage() {
  const { zones, dashboard, loading } = useData()
  const { zoneName } = useApp()
  const { user } = useAuth()
  const { latestAlert } = useLiveAlerts()
  const [selected, setSelected] = useState<Zone | null>(null)
  const [cameras, setCameras] = useState<CameraItem[]>([])
  const zoneList = zones.length ? zones : fallbackZones

  useEffect(() => {
    api.fetchCameras().then(setCameras).catch(() => undefined)
  }, [])

  const elephantMarker = useMemo(
    () =>
      latestAlert && latestAlert.status === 'active'
        ? {
            lat: latestAlert.latitude,
            lng: latestAlert.longitude,
            label: `${latestAlert.village} · ${Math.round(latestAlert.confidence * 100)}%`,
          }
        : null,
    [latestAlert],
  )

  if (loading && !dashboard) {
    return <CardSkeleton rows={6} />
  }

  const officerFor = (zone: Zone) => {
    const first = zone.officerIds[0]
    return OFFICERS.find((o) => o.id === first)?.name ?? 'Unassigned'
  }

  return (
    <div className="space-y-4">
      <GlassCard className="overflow-hidden p-0">
        <div className="relative" style={{ height: 'min(620px, calc(100vh - 240px))' }}>
          <MapContainer
            center={[11.7, 76.6]}
            zoom={8}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Forest boundary (sample polygon) */}
            <Polygon
              positions={FOREST_BOUNDARY}
              pathOptions={{ color: '#22c55e', weight: 2, fillColor: '#22c55e', fillOpacity: 0.06 }}
            >
              <Tooltip direction="top" opacity={1}>
                <span className="text-xs font-bold">Forest boundary (sample)</span>
              </Tooltip>
            </Polygon>

            {/* Risk zones */}
            {zoneList.map((zone) => {
              const style = RISK_STYLE[zone.risk]
              return (
                <CircleMarker
                  key={zone.id}
                  center={[zone.lat, zone.lng]}
                  radius={zone.risk === 'high' ? 26 : zone.risk === 'medium' ? 20 : 15}
                  pathOptions={{
                    color: style.color,
                    fillColor: style.fill,
                    fillOpacity: 0.28,
                    weight: 2,
                    opacity: style.opacity,
                  }}
                  eventHandlers={{ click: () => setSelected(zone) }}
                >
                  <Tooltip direction="top" offset={[0, -12]} opacity={1}>
                    <span className="text-xs font-bold">{zoneName(zone.id)}</span>
                  </Tooltip>
                  <Popup>
                    <div className="min-w-[210px]">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold">{zoneName(zone.id)}</p>
                        <RiskBadge risk={zone.risk} />
                      </div>
                      <p className="mt-1 text-[11px] text-muted">{zone.district}</p>
                      <div className="mt-3 space-y-1.5 text-xs">
                        <p className="flex items-center gap-2"><ShieldAlert size={13} /> Risk score: {zone.riskScore}%</p>
                        <p className="flex items-center gap-2"><Clock size={13} /> Last detection: {zone.lastDetection ? timeAgo(zone.lastDetection) : 'none'}</p>
                        <p className="flex items-center gap-2"><User size={13} /> Officer: {officerFor(zone)}</p>
                        <p className="flex items-center gap-2"><PawPrint size={13} /> Elephants: {zone.elephantCount} tracked</p>
                      </div>
                      <p className="mt-3 rounded-lg bg-panel p-2 text-[11px] leading-relaxed text-muted">{zone.description}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}

            {/* Camera locations */}
            {cameras.map((cam) => (
              <Marker
                key={cam.id}
                position={[cam.latitude, cam.longitude]}
                icon={divIcon(
                  `<div class="grid place-items-center rounded-lg border border-info/40 bg-panel p-1.5 shadow-card"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3ea8ff" stroke-width="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg></div>`,
                )}
              >
                <Tooltip direction="top" opacity={1}>
                  <span className="text-xs font-bold">{cam.name} · {cam.village}</span>
                </Tooltip>
              </Marker>
            ))}

            {/* User location */}
            {user && user.latitude !== 0 && (
              <Marker
                position={[user.latitude, user.longitude]}
                icon={divIcon(
                  `<div class="grid place-items-center rounded-full bg-accent text-white shadow-glow" style="width:28px;height:28px"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg></div>`,
                  [28, 28],
                )}
              >
                <Tooltip direction="top" opacity={1}>
                  <span className="text-xs font-bold">You · {user.village || 'home'}</span>
                </Tooltip>
              </Marker>
            )}

            {/* Live elephant location */}
            {elephantMarker && (
              <Marker
                position={[elephantMarker.lat, elephantMarker.lng]}
                icon={divIcon(
                  `<div class="relative grid place-items-center"><span class="absolute h-10 w-10 animate-ping rounded-full bg-danger opacity-30"></span><span class="relative grid h-8 w-8 place-items-center rounded-full bg-danger text-white shadow-glow text-base">🐘</span></div>`,
                )}
              >
                <Tooltip direction="top" offset={[0, -18]} opacity={1}>
                  <span className="text-xs font-bold text-danger">Elephant · {elephantMarker.label}</span>
                </Tooltip>
                <Popup>
                  <div className="min-w-[200px]">
                    <p className="flex items-center gap-2 text-sm font-bold text-danger">
                      <Radio size={14} /> 🔴 Elephant Detected
                    </p>
                    <div className="mt-2 space-y-1.5 text-xs text-muted">
                      <p className="flex items-center gap-2"><MapPin size={12} /> {latestAlert?.village} Village</p>
                      <p className="flex items-center gap-2"><Camera size={12} /> {latestAlert?.camera}</p>
                      <p className="flex items-center gap-2"><ShieldAlert size={12} /> {Math.round((latestAlert?.confidence ?? 0) * 100)}% confidence</p>
                      <p className="flex items-center gap-2"><Clock size={12} /> {latestAlert ? new Date(latestAlert.time).toLocaleTimeString() : ''}</p>
                    </div>
                    <p className="mt-2 rounded-lg bg-warning/10 p-2 text-[11px] font-semibold text-warning">Avoid the area and stay indoors.</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          <div className="absolute left-3 top-3 z-[500] rounded-xl border border-line bg-glass px-3 py-2.5 backdrop-blur-xl">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink">
              <MapPin size={13} className="text-accent" /> Live Zone Grid
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {LEGEND.map((l) => (
                <span key={l.label} className="flex items-center gap-2 text-[11px] font-medium text-muted">
                  <span className={`h-2.5 w-2.5 rounded-full ${l.cls}`} /> {l.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {zoneList.map((zone) => {
          const active = selected?.id === zone.id
          const riskOrder = zone.risk === 'high' ? 0 : zone.risk === 'medium' ? 1 : 2
          return (
            <button
              key={zone.id}
              onClick={() => setSelected(zone)}
              className={`glass rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card ${active ? 'ring-2 ring-accent/50' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${LEGEND[riskOrder].cls}`} />
                <RiskBadge risk={zone.risk} />
              </div>
              <p className="mt-2.5 truncate text-sm font-bold text-ink" title={zoneName(zone.id)}>{zoneName(zone.id)}</p>
              <p className="mt-0.5 text-[11px] text-faint">{zone.district}</p>
              <div className="mt-3 space-y-1 text-[11px] text-muted">
                <p className="flex justify-between"><span className="text-faint">Risk</span><span className="font-bold">{zone.riskScore}%</span></p>
                <p className="flex justify-between"><span className="text-faint">Last</span><span>{zone.lastDetection ? timeAgo(zone.lastDetection) : '—'}</span></p>
                <p className="flex justify-between"><span className="text-faint">Elephants</span><span className="font-bold">{zone.elephantCount}</span></p>
                <p className="flex justify-between"><span className="text-faint">Officer</span><span className="max-w-[110px] truncate">{officerFor(zone)}</span></p>
              </div>
              {selected?.id === zone.id && (
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-accent">Selected · {formatTime(new Date().toISOString())}</p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const fallbackZones: Zone[] = [
  { id: 'z1', name: 'BRT Tiger Reserve Corridor', district: 'Chamrajnagar, Karnataka', risk: 'low', riskScore: 22, lat: 11.9, lng: 77.1, radius: 0.14, officerIds: ['o1'], elephantCount: 4, lastDetection: null, description: 'Forest corridor near BJ College road.' },
  { id: 'z2', name: 'Muthanga–Wayanad Fringe', district: 'Wayanad, Kerala', risk: 'high', riskScore: 86, lat: 11.66, lng: 76.22, radius: 0.12, officerIds: ['o2'], elephantCount: 9, lastDetection: null, description: 'Dense settlement interface; frequent raiding corridor.' },
  { id: 'z3', name: 'Hassan–Sakleshpur Corridor', district: 'Hassan, Karnataka', risk: 'medium', riskScore: 58, lat: 12.9, lng: 75.79, radius: 0.13, officerIds: ['o3'], elephantCount: 6, lastDetection: null, description: 'Coffee-estate border section with railway line.' },
  { id: 'z4', name: 'Valparai–Anamalai Belt', district: 'Coimbatore, Tamil Nadu', risk: 'low', riskScore: 31, lat: 10.38, lng: 76.95, radius: 0.14, officerIds: ['o6'], elephantCount: 3, lastDetection: null, description: 'Tea plantation belt with shola patches.' },
  { id: 'z5', name: 'Mudumalai Fringe Villages', district: 'Nilgiris, Tamil Nadu', risk: 'high', riskScore: 74, lat: 11.58, lng: 76.56, radius: 0.13, officerIds: ['o5'], elephantCount: 7, lastDetection: null, description: 'Village boundary abutting Mudumalai TR.' },
]