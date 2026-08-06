import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, LocateFixed, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ElephantLogo from '../components/ElephantLogo'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    village: '',
    latitude: '',
    longitude: '',
  })

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  function locate() {
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        })),
      () => undefined,
      { timeout: 8000 },
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    const ok = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim(),
      village: form.village.trim(),
      latitude: parseFloat(form.latitude) || 0,
      longitude: parseFloat(form.longitude) || 0,
    })
    setBusy(false)
    if (ok) navigate('/app', { replace: true })
  }

  const inputCls =
    'w-full rounded-xl border border-line bg-panel px-3.5 py-2.5 text-sm outline-none transition placeholder:text-faint focus:border-success/50'

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg px-4 py-10 text-ink">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-success/15 blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-ink">
          <ArrowLeft size={15} /> Back to home
        </Link>
        <div className="glass rounded-3xl p-7 shadow-card">
          <div className="grad-primary grid h-12 w-12 place-items-center rounded-2xl text-white">
            <ElephantLogo className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold">Join the early warning network</h1>
          <p className="mt-1 text-sm text-muted">Register your village and get instant elephant alerts near you.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-faint">Full name</span>
                <input required value={form.name} onChange={set('name')} placeholder="Ravi Kumar" className={inputCls} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-faint">Email</span>
                <input type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" className={inputCls} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-faint">Password</span>
                <input type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="min 6 characters" className={inputCls} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-faint">Phone number</span>
                <input required value={form.phone} onChange={set('phone')} placeholder="+91 90000 00000" className={inputCls} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-faint">Village</span>
                <input required value={form.village} onChange={set('village')} placeholder="Karamadai" className={inputCls} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-faint">Latitude</span>
                <input value={form.latitude} onChange={set('latitude')} placeholder="11.23" className={inputCls} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-faint">Longitude</span>
                <input value={form.longitude} onChange={set('longitude')} placeholder="76.95" className={inputCls} />
              </label>
            </div>
            <button
              type="button"
              onClick={locate}
              className="flex items-center gap-1.5 rounded-xl border border-success/30 bg-success/10 px-3.5 py-2 text-xs font-bold text-success transition hover:bg-success/20"
            >
              <LocateFixed size={14} /> Use my current location
            </button>
            <button
              type="submit"
              disabled={busy}
              className="grad-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition hover:shadow-glow disabled:opacity-60"
            >
              <UserPlus size={16} /> {busy ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-success hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
