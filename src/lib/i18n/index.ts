"use client"

import { useCallback } from "react"
import { translate } from "@/lib/i18n/messages"
import { useAppStore } from "@/lib/store"

export function useT() {
  const language = useAppStore((state) => state.settings.language)
  return useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(language, key, vars),
    [language]
  )
}

export function useLang() {
  return useAppStore((state) => state.settings.language)
}
