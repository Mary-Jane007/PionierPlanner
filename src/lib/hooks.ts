"use client"

import { useMemo } from "react"
import { calculateMonthSnapshot } from "@/lib/calculations"
import { useAppStore, useCurrentTarget } from "@/lib/store"

export function useNow() {
  return useMemo(() => new Date(), [])
}

export function useMonthSnapshot() {
  const events = useAppStore((state) => state.events)
  const target = useCurrentTarget()
  const now = useNow()
  return useMemo(
    () =>
      calculateMonthSnapshot({
        events,
        year: now.getFullYear(),
        month: now.getMonth(),
        target,
        now,
      }),
    [events, target, now]
  )
}
