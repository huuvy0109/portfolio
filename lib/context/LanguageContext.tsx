'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Lang = 'en' | 'vi'

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue>({ lang: 'en', setLang: () => {} })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem('pf-lang') as Lang | null
    if (stored === 'en' || stored === 'vi') setLangState(stored)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('pf-lang', l)
  }

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
}

export function useLang() {
  return useContext(LanguageContext)
}
