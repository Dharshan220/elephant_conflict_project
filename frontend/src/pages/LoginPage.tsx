import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock, ArrowLeft, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ElephantLogo from '../components/ElephantLogo'
import { useLiveAlerts } from '../context/LiveAlertContext'

export default function LoginPage() {
  const { login } = useAuth()
  const { askNotificationPermission } = useLiveAlerts()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    const ok = await login(email.trim(), password)
    setBusy(false)
    if (ok) {
      askNotificationPermission()
      const from = (location.state as { from?: string } | null)?.from
      navigate(from && from.startsWith('/app') ? from : '/app', { replace: true })
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg px-4 py-10 text-ink">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-success/15 blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-ink">
          <ArrowLeft size={15} /> Back to home
        </Link>
        <div className="glass rounded-3xl p-7 shadow-card">
          <div className="grad-primary grid h-12 w-12 place-items-center rounded-2xl text-white">
            <ElephantLogo className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">Sign in to your Elephant Early Warning dashboard</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-faint">
                <Mail size={12} /> Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-line bg-panel px-3.5 py-2.5 text-sm outline-none transition placeholder:text-faint focus:border-success/50"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-faint">
                <Lock size={12} /> Password
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-line bg-panel px-3.5 py-2.5 text-sm outline-none transition placeholder:text-faint focus:border-success/50"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="grad-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition hover:shadow-glow disabled:opacity-60"
            >
              <LogIn size={16} /> {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-5 rounded-2xl bg-panel p-3.5 text-xs text-muted">
            <p className="flex items-center gap-1.5 font-bold text-ink">
              <ShieldCheck size={13} className="text-success" /> Demo accounts
            </p>
            <p className="mt-1.5">Admin: <span className="font-mono font-semibold text-success">admin@tusker.gov.in</span> / <span className="font-mono">admin123</span></p>
            <p className="mt-0.5">Villager: <span className="font-mono font-semibold text-success">farmer@tusker.gov.in</span> / <span className="font-mono">farmer123</span></p>
          </div>

          <p className="mt-5 text-center text-sm text-muted">
            New here?{' '}
            <Link to="/register" className="font-bold text-success hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
