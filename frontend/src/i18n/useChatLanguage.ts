import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_LANG, LANGUAGES, getDict, type LangCode, type TuskerDict } from './translations'

export const CHAT_LANG_KEY = 'tuskerguard-chat-language'

function loadLang(): LangCode {
  try {
    const stored = localStorage.getItem(CHAT_LANG_KEY)
    if (stored && LANGUAGES.some((l) => l.code === stored)) return stored as LangCode
  } catch {
    /* ignore */
  }
  return DEFAULT_LANG
}

export function useChatLanguage() {
  const [lang, setLang] = useState<LangCode>(loadLang)

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_LANG_KEY, lang)
    } catch {
      /* ignore */
    }
  }, [lang])

  const change = useCallback((code: LangCode) => setLang(code), [])
  const dict: TuskerDict = getDict(lang)

  return { lang, setLang: change, dict }
}