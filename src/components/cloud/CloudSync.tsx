"use client"

import { useEffect, useRef } from "react"
import { Network } from "@capacitor/network"
import { cloudPush, cloudToken } from "@/lib/cloud"
import { isNativeApp } from "@/lib/native"
import { isSkippingCloudPush, syncPlannerFromCloud } from "@/lib/planner-sync"
import { useAppStore } from "@/lib/store"

export function CloudSync() {
  const hydrated = useAppStore((state) => state.hydrated)
  const userId = useAppStore((state) => state.user?.id)
  const timer = useRef<number>(0)

  useEffect(() => {
    if (!hydrated || !userId || userId === "demo-user" || !cloudToken()) return

    let cancelled = false

    function pushLocal() {
      if (cancelled || isSkippingCloudPush() || !cloudToken()) return
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        void cloudPush(useAppStore.getState().exportSnapshot())
      }, 900)
    }

    void syncPlannerFromCloud()

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
