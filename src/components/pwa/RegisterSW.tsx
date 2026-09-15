"use client"

import { useEffect } from "react"

import { withBase } from "@/lib/base-path"
import { isNativeApp } from "@/lib/native"

async function unregisterWorkers() {
  const registrations = await navigator.serviceWorker.getRegistrations()
  for (const registration of registrations) void registration.unregister()
}

export function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    // Capacitor's JS object exists on the web too; only skip the PWA worker in the native shell.
    if (isNativeApp() || process.env.NODE_ENV !== "production") {
      void unregisterWorkers()
      return
    }
    if (!window.isSecureContext) return

    const scriptUrl = withBase("/sw.js")
    const scope = withBase("/")
    let cancelled = false

    async function register() {
      try {
        await navigator.storage?.persist?.()
      } catch {
        // Persistence is best-effort; planner data still lives in localStorage.
      }
      if (cancelled) return
      try {
        const registration = await navigator.serviceWorker.register(scriptUrl, {
          scope,
          updateViaCache: "none",
        })
        void registration.update()
      } catch {
        // Manifest install still works if the worker fails to register.
      }
    }

    void register()
    return () => {
      cancelled = true
    }
  }, [])

  return null
}
