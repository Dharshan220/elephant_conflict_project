import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, LogOut } from 'lucide-react'
import { NAV_ITEMS } from '../config/nav'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useTuskerLang } from '../i18n/LanguageContext'
import type { UIKey } from '../i18n/ui'
import ElephantLogo from './ElephantLogo'
import { classNames } from '../utils/helpers'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { alerts, devices, dashboard } = useData()
  const { user, isAdmin, logout } = useAuth()
  const { t } = useTuskerLang()
  const activeAlerts = alerts.filter((a) => a.status === 'active').length
  const online = devices.filter((d) => d.status === 'online').length

  const visibleItems = NAV_ITEMS.filter((i) => !i.adminOnly || isAdmin)
  const sections = [...new Set(visibleItems.map((i) => i.section))]

  const sectionKey = (section?: string): UIKey | null => {
    if (section === 'Monitoring') return 'navMon'
    if (section === 'Intelligence') return 'navIntel'
    if (section === 'System') return 'navSys'
    return null
  }

  const badgeClass = (label: string) => {
    if (label === 'Alerts' && activeAlerts > 0) return 'bg-danger text-white'
    if (label === 'Devices') return 'bg-surface text-muted'
    return 'bg-surface text-muted'
  }

  const badgeValue = (label: string) => {
    if (label === 'Alerts') return activeAlerts || null
    if (label === 'Devices') return `${online}/${devices.length}` || null
    return null
  }

  return (
    <>
      <div
        className={classNames(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-50 flex w-[268px] flex-col border-r border-line bg-surface/90 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-5" style={{ backgroundColor: 'var(--c-surface)' }}>
          <div className="grad-primary grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-glow">
            <ElephantLogo className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold leading-tight text-ink">TuskerGuard</p>
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-faint">Wildlife Conflict Sentinel</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-panelHover hover:text-ink lg:hidden">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section ?? 'main'} className="mb-5">
              {section && (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-faint">
                  {t(sectionKey(section) ?? 'navSys')}
                </p>
              )}
              <nav className="space-y-1">
                {visibleItems.filter((i) => i.section === section).map((item) => {
                  const Icon = item.icon
                  const badge = badgeValue(item.label)
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        classNames(
                          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-accentSoft text-accent'
                            : 'text-muted hover:bg-panel hover:text-ink',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.span
                              layoutId="nav-active"
                              className="absolute inset-0 rounded-xl ring-1 ring-accent/30"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                          <Icon
                            size={18}
                            className={classNames(
                              'relative z-10 shrink-0 transition-colors',
                              isActive ? 'text-accent' : 'text-faint group-hover:text-muted',
                            )}
                          />
                          <span className="relative z-10 flex-1 truncate">{t(item.labelKey)}</span>
                          {badge && (
                            <span
                              className={classNames(
                                'relative z-10 rounded-full px-2 py-0.5 text-[10px] font-bold',
                                badgeClass(item.label),
                              )}
                            >
                              {badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="border-t border-line p-4">
          <div className="glass rounded-2xl p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                </span>
                <p className="text-xs font-semibold text-ink">{t('gateway')}</p>
              </div>
              <span className="rounded-md bg-success/10 px-1.5 py-0.5 text-[10px] font-bold text-success">{t('live')}</span>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg bg-panel px-2 py-1.5">
                <p className="text-faint">{t('activeAlerts')}</p>
                <p className="mt-0.5 font-bold text-danger">{activeAlerts}</p>
              </div>
              <div className="rounded-lg bg-panel px-2 py-1.5">
                <p className="text-faint">{t('uptime')}</p>
                <p className="mt-0.5 font-bold text-ink">{dashboard?.stats.uptime ?? '14d 6h'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 border-t border-line px-4 py-3.5">
          <div className="grad-primary grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold text-white">
            {user?.name?.charAt(0) ?? 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-ink">{user?.name ?? 'User'}</p>
            <p className="truncate text-[10px] text-faint">
              {user?.village || '—'} {isAdmin ? '· Admin' : ''}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg p-2 text-muted transition hover:bg-panelHover hover:text-danger"
            title="Log out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>
    </>
  )
}