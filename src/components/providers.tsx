"use client"

import { useEffect } from "react"
import { ThemeProvider, useTheme } from "next-themes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { RegisterSW } from "@/components/pwa/RegisterSW"
import { OfflineBanner } from "@/components/pwa/OfflineBanner"
import { CloudSync } from "@/components/cloud/CloudSync"
import { NativeShell } from "@/components/native/NativeShell"
import { COLOR_THEME_META } from "@/lib/constants"
import { isNativeApp } from "@/lib/native"
import { bootPersistedStore, useAppStore } from "@/lib/store"

let storeBoot: Promise<void> | null = null

if (typeof window !== "undefined" && !isNativeApp()) {
  bootPersistedStore()
}

function bootStore() {
  if (storeBoot) return storeBoot
  storeBoot = (async () => {
    if (typeof window === "undefined") return
    if (isNativeApp()) {
      const { restoreDurableStorage } = await import("@/lib/durable-storage")
      await restoreDurableStorage()
    } else {
      bootPersistedStore()
    }
    if (!useAppStore.persist.hasHydrated()) {
      await useAppStore.persist.rehydrate()
    }
    useAppStore.getState().setHydrated(true)
  })()
  return storeBoot
}

function ThemeSync() {
  const { setTheme } = useTheme()
  const theme = useAppStore((state) => state.settings.theme)
  const colorTheme = useAppStore((state) => state.settings.colorTheme ?? "forest")
  const highContrast = useAppStore((state) => state.settings.highContrast)

  useEffect(() => {
    setTheme(theme)
  }, [theme, setTheme])

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast)
  }, [highContrast])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("palette-forest", colorTheme === "forest")
    root.classList.toggle("palette-blush", colorTheme === "blush")
    root.classList.toggle("palette-violet", colorTheme === "violet")
    const color = COLOR_THEME_META[colorTheme]
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.setAttribute("content", color)
    })
  }, [colorTheme])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let cancelled = false
    void bootStore().then(() => {
      if (!cancelled) useAppStore.getState().setHydrated(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <ThemeSync />
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
