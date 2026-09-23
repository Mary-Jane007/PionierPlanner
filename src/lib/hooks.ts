"use client"

import { useMemo } from "react"
import { calculateMonthSnapshot } from "@/lib/calculations"
import { useAppStore, useCurrentTarget } from "@/lib/store"
import { isoDateInZone, resolveTimeZone, zonedDateParts } from "@/lib/timezones"

export function useNow() {
  return useMemo(() => new Date(), [])
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
