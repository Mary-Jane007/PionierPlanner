"use client"

import { useEffect, useRef } from "react"
import { Network } from "@capacitor/network"
import { cloudPush, cloudPull, cloudToken } from "@/lib/cloud"
import { isNativeApp } from "@/lib/native"
import { hasSavedPlanner, useAppStore } from "@/lib/store"

export function CloudSync() {
  const hydrated = useAppStore((state) => state.hydrated)
  const userId = useAppStore((state) => state.user?.id)
  const skipPush = useRef(false)
  const timer = useRef<number>(0)

  useEffect(() => {
    if (!hydrated || !userId || userId === "demo-user" || !cloudToken()) return

    let cancelled = false

    async function hydrateFromCloud() {
      const before = useAppStore.getState()
      const pulled = await cloudPull()
      if (cancelled || "error" in pulled) return
      const local = useAppStore.getState()
      const editedDuringPull = local.settings !== before.settings || local.events !== before.events
      if (editedDuringPull) {
        await cloudPush(local.exportSnapshot())
        return
      }
      if (hasSavedPlanner(local) && (!pulled.snapshot || !hasSavedPlanner(pulled.snapshot))) {
        await cloudPush(local.exportSnapshot())
        return
      }
      if (pulled.snapshot && local.user) {
        skipPush.current = true
        useAppStore.getState().applyPlannerSnapshot(pulled.snapshot, local.user)
        skipPush.current = false
        if (hasSavedPlanner(local)) {
          await cloudPush(useAppStore.getState().exportSnapshot())
        }
        return
      }
      await cloudPush(useAppStore.getState().exportSnapshot())
    }

    function pushLocal() {
      if (cancelled || skipPush.current || !cloudToken()) return
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        void cloudPush(useAppStore.getState().exportSnapshot())
      }, 900)
    }

    void hydrateFromCloud()

    const unsub = useAppStore.subscribe(pushLocal)

    function flushAfterReconnect() {
      if (cancelled || !cloudToken()) return
      void cloudPush(useAppStore.getState().exportSnapshot())
    }

    window.addEventListener("online", flushAfterReconnect)
    const networkListen = isNativeApp()
      ? Network.addListener("networkStatusChange", (status) => {
          if (status.connected) flushAfterReconnect()
        })
      : Promise.resolve({ remove: () => undefined })

    return () => {
      cancelled = true
      unsub()
      window.clearTimeout(timer.current)
      window.removeEventListener("online", flushAfterReconnect)
      void networkListen.then((handle) => handle.remove())
    }
  }, [hydrated, userId])

  return null
}
