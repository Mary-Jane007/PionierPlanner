"use client"

import { useEffect, useMemo, useState } from "react"
import { calculateMonthSnapshot } from "@/lib/calculations"
import { useAppStore, useCurrentTarget } from "@/lib/store"
import { isoDateInZone, resolveTimeZone, zonedDateParts } from "@/lib/timezones"

export function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const timer = window.setInterval(tick, 1000)
    const onVisible = () => {
      if (document.visibilityState === "visible") tick()
    }
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", tick)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", tick)
    }
  }, [])
  return now
}

export function useMonthSnapshot() {
  const events = useAppStore((state) => state.events)
  const target = useCurrentTarget()
  const timezone = useAppStore((state) => resolveTimeZone(state.settings.timezone))
  const now = useNow()
  return useMemo(() => {
    const parts = zonedDateParts(now, timezone)
    return calculateMonthSnapshot({
      events,
      year: parts.year,
      month: parts.month - 1,
      target,
      now,
      today: isoDateInZone(now, timezone),
    })
  }, [events, target, now, timezone])
}
