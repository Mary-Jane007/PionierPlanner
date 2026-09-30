"use client"

import { useMemo } from "react"
import { calculateMonthSnapshot } from "@/lib/calculations"
import { useAppStore, useCurrentTarget } from "@/lib/store"

export function useNow() {
  return useMemo(() => new Date(), [])
}

export function useMonthSnapshot(anchor?: Date) {
  const events = useAppStore((state) => state.events)
  const target = useCurrentTarget()
  const now = useNow()
  const year = (anchor ?? now).getFullYear()
  const month = (anchor ?? now).getMonth()
  const weekAnchor = anchor ?? now
  return useMemo(
    () =>
      calculateMonthSnapshot({
        events,
        year,
        month,
        target,
        now,
        weekAnchor,
      }),
    [events, target, now, year, month, weekAnchor]
  )
}
