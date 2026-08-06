import { useState } from 'react'
import { Volume2, Moon, MessageSquare, Mail, MapPin, Cpu, Save } from 'lucide-react'
import { useApp } from '../context/AppContext'
import GlassCard from '../components/ui/GlassCard'
import SectionHeader from '../components/ui/SectionHeader'
import Toggle from '../components/ui/Toggle'
import { Input, Select, FieldShell } from '../components/ui/Form'
import { Button } from '../components/ui/Button'
import { useToast } from '../context/ToastContext'
import type { AppSettings } from '../types'

export default function SettingsPage() {
  const { settings, update } = useApp()
  const { push } = useToast()
  const [draft, setDraft] = useState<AppSettings>(settings)
  const [saved, setSaved] = useState(true)

  const patch = (p: Partial<AppSettings>) => {
    setDraft((d) => ({ ...d, ...p }))
    setSaved(false)
  }

  const patchZone = (id: string, value: string) => {
    setDraft((d) => ({ ...d, zoneNames: { ...d.zoneNames, [id]: value } }))
    setSaved(false)
  }

  const save = () => {
    update(draft)
    setSaved(true)
    push('success', 'Settings saved', 'Applied across the command console.')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <GlassCard className="p-6">
        <SectionHeader title="Notifications" subtitle="How the grid reaches out to officers" icon={<Volume2 size={16} />} />
        <div className="mt-5 space-y-5">
          <Toggle
            checked={draft.alertSound}
            onChange={(v) => patch({ alertSound: v })}
            label="Alert sound"
            description="Play an audible chime when a system alert lands in the console."
          />
          <Toggle
            checked={draft.smsEnabled}
            onChange={(v) => patch({ smsEnabled: v })}
            label="SMS alerts"
            description="Forward critical alerts to on-duty forest officers via SMS gateway."
          />
          <Toggle
            checked={draft.emailEnabled}
            onChange={(v) => patch({ emailEnabled: v })}
            label="Email digests"
            description="Receive the daily AI incident summary at 06:00 IST."
          />
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <SectionHeader title="Appearance" subtitle="Theme preference syncs across the console" icon={<Moon size={16} />} />
        <div className="mt-5">
          <Toggle
            checked={draft.darkMode}
            onChange={(v) => patch({ darkMode: v })}
            label="Dark mode"
            description="Forest-night theme reduces eye strain during night shifts."
          />
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <SectionHeader title="Zone Names" subtitle="Reference labels used across dashboard and assistant" icon={<MapPin size={16} />} />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {Object.entries(draft.zoneNames).map(([id, name]) => (
            <Input key={id} label={id.toUpperCase()} value={name} onChange={(e) => patchZone(id, e.target.value)} />
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <SectionHeader title="Device & Sensor" subtitle="Edge node field configuration" icon={<Cpu size={16} />} />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Select label="Sensor scan interval" value={draft.scanInterval} onChange={(e) => patch({ scanInterval: Number(e.target.value) })}>
            <option value={1}>1 second</option>
            <option value={2}>2 seconds</option>
            <option value={5}>5 seconds</option>
            <option value={10}>10 seconds</option>
          </Select>
          <Select label="Buzzer duration" value={draft.buzzerDuration} onChange={(e) => patch({ buzzerDuration: Number(e.target.value) })}>
            <option value={15}>15 s</option>
            <option value={30}>30 s</option>
            <option value={60}>60 s</option>
            <option value={120}>120 s</option>
          </Select>
          <FieldShell label={`PIR sensitivity · ${draft.sensitivity}%`}>
            <input
              type="range"
              min={20}
              max={100}
              value={draft.sensitivity}
              onChange={(e) => patch({ sensitivity: Number(e.target.value) })}
              className="w-full accent-emerald-500"
            />
          </FieldShell>
          <div className="flex items-end">
            <Button icon={<Save size={15} />} onClick={save} disabled={saved} className="w-full">
              {saved ? 'All changes saved' : 'Save changes'}
            </Button>
          </div>
        </div>
        <p className="mt-4 text-[11px] text-faint">
          Device settings (scan interval, buzzer duration, sensitivity) are pushed to ESP8266 nodes via the FastAPI configuration API on next heartbeat.
        </p>
      </GlassCard>
    </div>
  )
}