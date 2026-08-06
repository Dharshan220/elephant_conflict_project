import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_LANG, LANGUAGES, type LangCode } from './translations'
import { uiFor, type UIDict, type UIKey } from './ui'

const LANG_KEY = 'tuskerguard-language'

interface LangContextValue {
  lang: LangCode
  setLang: (code: LangCode) => void
  t: (key: UIKey) => string
  ui: UIDict
}

const LangContext = createContext<LangContextValue | null>(null)

function loadLang(): LangCode {
  try {
    const stored = localStorage.getItem(LANG_KEY)
    if (stored && LANGUAGES.some((l) => l.code === stored)) return stored as LangCode
  } catch {
    /* ignore */
  }
  return DEFAULT_LANG
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LangCode>(loadLang)

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute('lang', lang)
  }, [lang])

  const change = useCallback((code: LangCode) => setLang(code), [])

  const ui = useMemo(() => uiFor(lang), [lang])

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang: change,
      t: (key) => ui[key],
      ui,
    }),
    [lang, change, ui],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useTuskerLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useTuskerLang must be used within LanguageProvider')
  return ctx
}

export { uiFor, type UIKey, type UIDict } from './ui'