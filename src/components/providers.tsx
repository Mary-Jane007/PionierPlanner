"use client"

import { useEffect } from "react"
import { ThemeProvider, useTheme } from "next-themes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { RegisterSW } from "@/components/pwa/RegisterSW"
import { OfflineBanner } from "@/components/pwa/OfflineBanner"
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
    const unsub = useAppStore.persist.onFinishHydration(() => {
      useAppStore.getState().setHydrated(true)
    })
    void useAppStore.persist.rehydrate()
    const timeout = window.setTimeout(() => {
      useAppStore.getState().setHydrated(true)
    }, 400)
    return () => {
      unsub()
      window.clearTimeout(timeout)
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <ThemeSync />
        <RegisterSW />
        <OfflineBanner />
        {children}
        <Toaster position="top-center" />
      </TooltipProvider>
    </ThemeProvider>
  )
}
