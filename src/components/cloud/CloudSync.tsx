"use client"

import { useEffect, useRef } from "react"
import { cloudPush, cloudPull, cloudToken } from "@/lib/cloud"
import { useAppStore } from "@/lib/store"

export function CloudSync() {
  const hydrated = useAppStore((state) => state.hydrated)
  const userId = useAppStore((state) => state.user?.id)
  const skipPush = useRef(false)
  const timer = useRef<number>(0)

  useEffect(() => {
    if (!hydrated || !userId || userId === "demo-user" || !cloudToken()) return

    let cancelled = false

    async function hydrateFromCloud() {
      const pulled = await cloudPull()
      if (cancelled || "error" in pulled) return
      if (pulled.snapshot) {
        skipPush.current = true
        useAppStore.getState().applyPlannerSnapshot(pulled.snapshot)
        skipPush.current = false
        return
      }
      await cloudPush(useAppStore.getState().exportSnapshot())
    }

    void hydrateFromCloud()

    const unsub = useAppStore.subscribe(() => {
      if (cancelled || skipPush.current || !cloudToken()) return
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        void cloudPush(useAppStore.getState().exportSnapshot())
      }, 900)
    })

    return () => {
      cancelled = true
      unsub()
      window.clearTimeout(timer.current)
    }
  }, [hydrated, userId])

  return null
}
