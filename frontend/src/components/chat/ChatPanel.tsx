import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, ChevronDown, Globe, RotateCcw, Send, Sparkles, X } from 'lucide-react'
import type { ChatMessage } from '../../types'
import { useData } from '../../context/DataContext'
import { useApp } from '../../context/AppContext'
import { useChatLanguage } from '../../i18n/useChatLanguage'
import { useTuskerLang } from '../../i18n/LanguageContext'
import { buildAnswer, type ChatContext } from '../../i18n/chatEngine'
import { LANGUAGES, type IntentKey, type LangCode } from '../../i18n/translations'
import { classNames, uid } from '../../utils/helpers'
import { formatTime } from '../../utils/format'
import ElephantLogo from '../ElephantLogo'

const ACTION_ORDER: IntentKey[] = [
  'currentAlerts',
  'safeRoute',
  'highRiskZone',
  'latestDetection',
  'contactOfficer',
  'safetyTips',
  'todaySummary',
]

interface ChatPanelProps {
  onClose?: () => void
  onOpenReport?: () => void
}

export default function ChatPanel({ onClose, onOpenReport }: ChatPanelProps) {
  const { dashboard, predictions, devices, officers } = useData()
  const { zoneName } = useApp()
    const { lang, setLang, dict } = useChatLanguage()
  const { setLang: setSiteLang } = useTuskerLang()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentWelcome = useRef(false)
  const welcomeId = useRef<string | null>(null)

  useEffect(() => {
    if (sentWelcome.current) return
    sentWelcome.current = true
    const id = uid('m')
    welcomeId.current = id
    setMessages((m) => [...m, { id, role: 'ai', text: dict.chatbot.welcome, time: new Date().toISOString() }])
  }, [])

  useEffect(() => {
    if (!welcomeId.current) return
    setMessages((m) => m.map((msg) => (msg.id === welcomeId.current ? { ...msg, text: dict.chatbot.welcome } : msg)))
  }, [lang])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999, behavior: 'smooth' })
  }, [messages, typing])

  function pushMessage(role: 'user' | 'ai', text: string, timeoutMs: number) {
    if (timeoutMs === 0) {
      setMessages((m) => [...m, { id: uid('m'), role, text, time: new Date().toISOString() }])
      return
    }
    setTimeout(() => {
      setMessages((m) => [...m, { id: uid('m'), role, text, time: new Date().toISOString() }])
    }, timeoutMs)
  }

  function ctx(): ChatContext {
    return {
      latestDetection: dashboard?.latestDetection ?? null,
      zones: predictions?.zones ?? [],
      recentAlerts: dashboard?.recentAlerts ?? [],
      officers,
      onlineDevices: devices.filter((d) => d.status === 'online').length,
      totalDevices: devices.length,
      zoneName,
    }
  }

  function respond(raw: string, intent?: IntentKey) {
    setTyping(true)
    const delay = 700 + Math.random() * 800
    setTimeout(() => {
      const answer = buildAnswer(raw, lang, ctx(), intent)
      if (answer.intent === 'todaySummary' && onOpenReport) onOpenReport()
      pushMessage('ai', answer.text, 0)
      setTyping(false)
    }, delay)
  }

  function send(question?: string) {
    const final = (question ?? input).trim()
    if (!final || typing) return
    pushMessage('user', final, 0)
    setInput('')
    respond(final)
  }

  function quickAction(key: IntentKey) {
    const label = dict.actions[key]
    if (!label || typing) return
    pushMessage('user', label, 0)
    respond(label, key)
  }

  const selected = LANGUAGES.find((l) => l.code === lang)

  return (
    <div className="glass flex h-full flex-col overflow-hidden rounded-3xl shadow-card">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <div className="grad-primary relative grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-glow">
          <ElephantLogo className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-surface" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
            {dict.chatbot.title}
            <Sparkles size={13} className="text-accent" />
          </p>
          <p className="truncate text-[11px] text-success">{dict.chatbot.status}</p>
        </div>

        <label className="flex items-center gap-1 rounded-lg border border-line bg-panel px-2 py-1.5 text-xs text-muted">
          <Globe size={13} className="text-accent" />
          <select
            value={lang}
            onChange={(e) => {
              const code = e.target.value as LangCode
              setLang(code)
              setSiteLang(code)
            }}
            title={dict.chatbot.language}
            className="max-w-[110px] cursor-pointer bg-transparent text-xs font-semibold text-ink outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-surface text-ink">
                {l.native}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="text-faint" />
        </label>

        <button
          onClick={() => {
            setMessages([])
            sentWelcome.current = false
            welcomeId.current = null
          }}
          title={dict.chatbot.clear}
          className="rounded-lg p-2 text-muted transition hover:bg-panelHover hover:text-ink"
        >
          <RotateCcw size={15} />
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition hover:bg-panelHover hover:text-ink"
            title="Close"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={classNames('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={classNames(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'grad-primary rounded-br-sm text-white'
                    : 'rounded-bl-sm border border-line bg-panel text-ink',
                )}
              >
                {m.role === 'ai' && (
                  <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-accent">
                    <Bot size={11} /> {dict.chatbot.title}
                  </p>
                )}
                <p className="whitespace-pre-wrap">{m.text}</p>
                <p className={classNames('mt-1 text-right text-[10px]', m.role === 'user' ? 'text-white/70' : 'text-faint')}>
                  {formatTime(m.time)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {typing && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-line bg-panel px-4 py-3">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="ml-1 text-[10px] text-faint">{dict.chatbot.typing}</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-line px-4 py-3">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {ACTION_ORDER.map((key) => (
            <button
              key={key}
              onClick={() => quickAction(key)}
              className="rounded-full border border-line bg-panel px-3 py-1.5 text-[11px] font-semibold text-muted transition hover:border-accent/40 hover:text-accent"
            >
              {dict.actions[key]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={dict.chatbot.placeholder}
            className="flex-1 rounded-xl border border-line bg-panel px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-faint focus:border-accent/50"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || typing}
            className="grad-primary grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="mt-2 flex items-center justify-between text-[10px] text-faint">
          <span>{selected?.native} · {selected?.name}</span>
          <span>Tusker AI · mock responses</span>
        </p>
      </div>
    </div>
  )
}