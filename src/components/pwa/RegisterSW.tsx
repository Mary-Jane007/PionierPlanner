"use client"

import { useEffect } from "react"

import { withBase } from "@/lib/base-path"

export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    if (!window.isSecureContext) return
    if ("Capacitor" in window) return

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
