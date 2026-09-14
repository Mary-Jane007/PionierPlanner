"use client"

import { useEffect } from "react"

import { withBase } from "@/lib/base-path"

export function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    if (!window.isSecureContext) return
    if ("Capacitor" in window) return

    navigator.serviceWorker.register(withBase("/sw.js")).catch(() => {
      // Manifest install still works if the worker fails to register.
    })
  }, [])

  return null
}
