"use client"

import { useEffect } from "react"
import { ThemeProvider, useTheme } from "next-themes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { RegisterSW } from "@/components/pwa/RegisterSW"
import { OfflineBanner } from "@/components/pwa/OfflineBanner"
import { CloudSync } from "@/components/cloud/CloudSync"
import { NativeShell } from "@/components/native/NativeShell"
import { useAppStore } from "@/lib/store"
import { DEFAULT_TIMEZONE } from "@/lib/timezones"

function TimezoneSync() {
  const hydrated = useAppStore((state) => state.hydrated)
  const language = useAppStore((state) => state.settings.language)
  const timezone = useAppStore((state) => state.settings.timezone)
  const setSettings = useAppStore((state) => state.setSettings)

  useEffect(() => {
    if (!hydrated || language !== "pap") return
    const keep =
      timezone === "America/Curacao" ||
      timezone === "America/Aruba" ||
      timezone === "America/Kralendijk" ||
      timezone === "America/Lower_Princes" ||
      timezone === "America/Paramaribo"
    if (keep) return
    if (
      timezone === DEFAULT_TIMEZONE ||
      timezone === "America/Panama" ||
      timezone === "America/Bogota" ||
      timezone === "America/Lima" ||
      timezone === "America/Jamaica"
    ) {
      setSettings({ timezone: "America/Curacao" })
    }
  }, [hydrated, language, timezone, setSettings])

  return null
}

function ThemeSync() {
  const { setTheme } = useTheme()
  const theme = useAppStore((state) => state.settings.theme)
  const highContrast = useAppStore((state) => state.settings.highContrast)

  useEffect(() => {
    setTheme(theme)
  }, [theme, setTheme])

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast)
  }, [highContrast])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let cancelled = false
    async function hydrate() {
      const { restoreDurableStorage } = await import("@/lib/durable-storage")
      await restoreDurableStorage()
      await useAppStore.persist.rehydrate()
      if (!cancelled) useAppStore.getState().setHydrated(true)
    }
    void hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <ThemeSync />
        <TimezoneSync />
        <RegisterSW />
        <NativeShell />
        <OfflineBanner />
        <CloudSync />
        {children}
        <Toaster position="top-center" />
      </TooltipProvider>
    </ThemeProvider>
  )
}
