"use client"

import { useEffect } from "react"
import { ThemeProvider, useTheme } from "next-themes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { RegisterSW } from "@/components/pwa/RegisterSW"
import { OfflineBanner } from "@/components/pwa/OfflineBanner"
import { CloudSync } from "@/components/cloud/CloudSync"
import { useAppStore } from "@/lib/store"

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
    const finish = () => {
      if (!cancelled) useAppStore.getState().setHydrated(true)
    }
    const unsub = useAppStore.persist.onFinishHydration(finish)
    void Promise.resolve(useAppStore.persist.rehydrate()).finally(finish)
    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <ThemeSync />
        <RegisterSW />
        <OfflineBanner />
        <CloudSync />
        {children}
        <Toaster position="top-center" />
      </TooltipProvider>
    </ThemeProvider>
  )
}
