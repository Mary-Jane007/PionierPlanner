"use client"

import { useEffect, useState } from "react"
import { Network } from "@capacitor/network"

import { withBase } from "@/lib/base-path"
import { useT } from "@/lib/i18n"
import { isNativeApp } from "@/lib/native"

export function OfflineBanner() {
  const t = useT()
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function pingWeb() {
      try {
        await fetch(`${withBase("/__online_check")}?t=${Date.now()}`, {
          method: "GET",
          cache: "no-store",
        })
        if (!cancelled) setOffline(false)
      } catch {
        if (!cancelled) setOffline(true)
      }
    }

    async function pingNative() {
      try {
        const status = await Network.getStatus()
        if (!cancelled) setOffline(!status.connected)
      } catch {
        if (!cancelled) setOffline(!navigator.onLine)
      }
    }

    function goOffline() {
      setOffline(true)
    }

    function goOnline() {
      if (isNativeApp()) void pingNative()
      else void pingWeb()
    }

    if (isNativeApp()) {
      void pingNative()
    } else {
      void pingWeb()
    }

    const timer = window.setInterval(() => {
      if (isNativeApp()) void pingNative()
      else void pingWeb()
    }, 4000)
    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)
    const networkListen = isNativeApp()
      ? Network.addListener("networkStatusChange", (status) => {
          if (!cancelled) setOffline(!status.connected)
        })
      : Promise.resolve({ remove: () => undefined })

    return () => {
      cancelled = true
      window.clearInterval(timer)
      window.removeEventListener("online", goOnline)
      window.removeEventListener("offline", goOffline)
      void networkListen.then((handle) => handle.remove())
    }
  }, [])

  if (!offline) return null

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-50 bg-primary px-3 py-2 text-center text-sm text-primary-foreground"
      style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
    >
      {t("pwa.offline")}
    </div>
  )
}
