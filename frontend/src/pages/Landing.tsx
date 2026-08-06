import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BellRing,
  MapPin,
  Camera,
  ShieldCheck,
  LineChart,
  Users,
  ArrowRight,
  LogIn,
  UserPlus,
  PawPrint,
  Radio,
  AlarmClock,
  CloudSun,
  HeartHandshake,
} from 'lucide-react'
import ElephantLogo from '../components/ElephantLogo'
import { useLiveAlerts } from '../context/LiveAlertContext'

const FEATURES = [
  { icon: Radio, title: 'Real-time Detection', text: 'YOLOv8-powered camera network streams elephant detections to your dashboard in under a second.' },
  { icon: BellRing, title: 'Instant Alerts', text: 'WebSocket push, in-browser notifications and FCM mobile pushes keep villages informed immediately.' },
  { icon: MapPin, title: 'Live Village Map', text: 'Leaflet + OpenStreetMap shows cameras, elephant locations, forest boundaries and your position.' },
  { icon: ShieldCheck, title: 'Early Warning', text: 'Confidence-based triage (>80%) triggers sirens, officer dispatch and safety guidance.' },
  { icon: LineChart, title: 'Analytics & History', text: 'Trend charts, filterable alert history and one-click CSV export for forest departments.' },
  { icon: Users, title: 'Community Ready', text: 'Every villager can register their village and coordinates to receive zone-specific alerts.' },
]

const SDGS = [
  { n: '15', title: 'Life on Land', text: 'Protecting elephants and their corridors reduces human–wildlife conflict.' },
  { n: '11', title: 'Sustainable Communities', text: 'Early warnings keep villages safe and crops protected without harming wildlife.' },
  { n: '13', title: 'Climate Action', text: 'Reducing conflict lowers retaliatory land clearing and habitat loss.' },
]

export default function Landing() {
  const { connected } = useLiveAlerts()

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="grad-primary grid h-10 w-10 place-items-center rounded-xl text-white shadow-glow">
              <ElephantLogo className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-base font-bold leading-tight">TuskerGuard</p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-success">Elephant Early Warning System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold sm:flex ${
                connected ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className={`absolute h-full w-full animate-ping rounded-full ${connected ? 'bg-success' : 'bg-warning'}`} />
                <span className={`relative h-2 w-2 rounded-full ${connected ? 'bg-success' : 'bg-warning'}`} />
              </span>
              {connected ? 'Live feed connected' : 'Connecting…'}
            </span>
            <Link to="/login" className="flex items-center gap-1.5 rounded-xl border border-line bg-panel px-3.5 py-2 text-sm font-semibold transition hover:text-ink">
              <LogIn size={15} /> Login
            </Link>
            <Link to="/register" className="grad-primary flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-white transition hover:shadow-glow">
              <UserPlus size={15} /> Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-success/15 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-success">
              <ShieldCheck size={13} /> AI + IoT Powered
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight lg:text-5xl">
              Early Warning for{' '}
              <span className="grad-text">Human–Elephant Conflict</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
              A full-stack AI system that detects elephants at forest edges with YOLOv8 cameras, alerts villages in real
              time over WebSocket + push notifications, and gives forest officers a command dashboard — all in one place.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/app" className="grad-primary flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition hover:shadow-glow">
                <Radio size={16} /> View Live Alerts <ArrowRight size={15} />
              </Link>
              <Link to="/register" className="flex items-center gap-2 rounded-xl border border-line bg-panel px-5 py-3 text-sm font-bold transition hover:border-success/40 hover:text-success">
                <UserPlus size={16} /> Join as Villager
              </Link>
            </div>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
              {[
                { k: '< 1s', v: 'Alert latency' },
                { k: '6+', v: 'Cameras online' },
                { k: '24/7', v: 'Monitoring' },
              ].map((s) => (
                <div key={s.v} className="glass rounded-2xl p-3 text-center">
                  <p className="font-display text-xl font-extrabold text-success">{s.k}</p>
                  <p className="text-[11px] text-faint">{s.v}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Live alert preview card */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.15 }} className="relative">
            <div className="glass rounded-3xl p-5 shadow-card">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-bold">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute h-full w-full animate-ping rounded-full bg-danger opacity-60" />
                    <span className="relative h-2.5 w-2.5 rounded-full bg-danger" />
                  </span>
                  Live Detection Feed
                </p>
                <span className="rounded-md bg-danger/10 px-2 py-0.5 text-[10px] font-bold text-danger">🔴 ELEPHANT DETECTED</span>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { icon: MapPin, k: 'Location', v: 'Karamadai Village, Tamil Nadu' },
                  { icon: Camera, k: 'Camera', v: 'CAM01 · Ridge 12' },
                  { icon: PawPrint, k: 'Confidence', v: '95% · YOLOv8n' },
                  { icon: AlarmClock, k: 'Time', v: 'Just now' },
                ].map((r) => (
                  <div key={r.k} className="flex items-center gap-3 rounded-xl bg-panel px-3.5 py-2.5">
                    <r.icon size={16} className="shrink-0 text-success" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-faint">{r.k}</p>
                      <p className="truncate text-sm font-semibold">{r.v}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-warning/10 px-3.5 py-2.5 text-xs font-semibold text-warning">
                <span>⚠ Avoid the area and stay indoors.</span>
                <span>FCM push sent</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Overview */}
      <section className="border-y border-line bg-surface/40 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-4 text-center lg:grid-cols-3">
            {[
              { icon: Camera, t: 'YOLOv8 Camera Grid', d: 'ESP8266 edge nodes and CCTV feeds run on-device YOLOv8 detection at the forest boundary.' },
              { icon: BellRing, t: 'WebSocket + Push', d: 'Every high-confidence detection is broadcast instantly to dashboards and villagers\' phones.' },
              { icon: LineChart, t: 'Officer Command Center', d: 'Admin dashboards track cameras, resolve alerts and export reports for authorities.' },
            ].map((x) => (
              <div key={x.t} className="glass rounded-3xl p-6">
                <div className="grad-primary mx-auto grid h-12 w-12 place-items-center rounded-2xl text-white">
                  <x.icon size={22} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{x.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-success">Features</p>
        <h2 className="mt-2 text-center font-display text-3xl font-extrabold">Everything a forest village needs</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:shadow-card">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-success/10 text-success">
                <f.icon size={20} />
              </div>
              <h3 className="mt-3.5 font-display text-base font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SDG Goals */}
      <section className="border-t border-line bg-surface/40 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-2 text-center">
            <HeartHandshake size={18} className="text-success" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-success">UN Sustainable Development Goals</p>
          </div>
          <h2 className="mt-2 font-display text-3xl font-extrabold">Aligned with the SDGs</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {SDGS.map((s) => (
              <div key={s.n} className="glass flex gap-4 rounded-3xl p-5">
                <div className="grad-primary grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-display text-lg font-extrabold text-white">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-display text-base font-bold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grad-primary relative overflow-hidden rounded-3xl p-10 text-center text-white">
          <CloudSun className="absolute -right-6 -top-6 h-32 w-32 text-white/10" />
          <h2 className="font-display text-3xl font-extrabold">Be the first to know when elephants approach</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">
            Register your village and coordinates, enable notifications, and get real-time elephant alerts on your
            device.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50">
              Create free account
            </Link>
            <Link to="/login" className="rounded-xl border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
              I have an account
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-faint sm:flex-row">
          <p>TuskerGuard · Elephant Early Warning System — AI + IoT for human–elephant coexistence</p>
          <p>Smart India Hackathon · YOLOv8 + FastAPI + React</p>
        </div>
      </footer>
    </div>
  )
}
