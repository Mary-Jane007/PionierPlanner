"use client"

import { useEffect, useState } from "react"

import { withBase } from "@/lib/base-path"
import { useT } from "@/lib/i18n"

export function OfflineBanner() {
  const t = useT()
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function ping() {
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

    function goOffline() {
      setOffline(true)
    }

    void ping()
    const timer = window.setInterval(ping, 4000)
    window.addEventListener("online", ping)
    window.addEventListener("offline", goOffline)
    return () => {
      cancelled = true
      window.clearInterval(timer)
      window.removeEventListener("online", ping)
      window.removeEventListener("offline", goOffline)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      role="status"
      className="bg-primary px-3 py-2 text-center text-sm text-primary-foreground"
    >
      {t("pwa.offline")}
    </div>
  )
}
