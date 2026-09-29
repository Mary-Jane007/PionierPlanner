"use client"

import { toast } from "sonner"
import { cloudPull, cloudPush, cloudToken } from "@/lib/cloud"
import { flushDurableStorage } from "@/lib/durable-storage"
import { translate } from "@/lib/i18n/messages"
import { hasSavedPlanner, useAppStore } from "@/lib/store"

export type RefreshResult = "ok" | "offline" | "local"

let skipPush = false
let inflight: Promise<RefreshResult> | null = null
const busyListeners = new Set<(busy: boolean) => void>()

export function isSkippingCloudPush() {
  return skipPush
}

export function isPlannerRefreshing() {
  return inflight !== null
}

export function subscribeRefreshBusy(listener: (busy: boolean) => void) {
  busyListeners.add(listener)
  listener(inflight !== null)
  return () => {
    busyListeners.delete(listener)
  }
}

function setBusy(busy: boolean) {
  for (const listener of busyListeners) listener(busy)
}

export async function syncPlannerFromCloud(): Promise<RefreshResult> {
  const state = useAppStore.getState()
  const userId = state.user?.id
  if (!userId || userId === "demo-user" || !cloudToken()) return "local"

  const pulled = await cloudPull()
  if ("error" in pulled) return "offline"

  const local = useAppStore.getState()
  if (hasSavedPlanner(local) && (!pulled.snapshot || !hasSavedPlanner(pulled.snapshot))) {
    await cloudPush(local.exportSnapshot())
    return "ok"
  }
  if (pulled.snapshot && local.user) {
    skipPush = true
    try {
      useAppStore.getState().applyPlannerSnapshot(pulled.snapshot, local.user)
    } finally {
      skipPush = false
    }
    if (hasSavedPlanner(local)) {
      await cloudPush(useAppStore.getState().exportSnapshot())
    }
    return "ok"
  }
  await cloudPush(useAppStore.getState().exportSnapshot())
  return "ok"
}

export async function refreshPlanner(): Promise<RefreshResult> {
  if (inflight) return inflight

  const started = Date.now()
  setBusy(true)
  inflight = (async () => {
    try {
      const result = await syncPlannerFromCloud()
      if (result !== "ok") {
        await useAppStore.persist.rehydrate()
      }
      try {
        const registrations = await navigator.serviceWorker?.getRegistrations()
        for (const registration of registrations ?? []) void registration.update()
      } catch {
        // Updating the service worker is best-effort.
      }
      await flushDurableStorage()
      return result
    } finally {
      const wait = 500 - (Date.now() - started)
      if (wait > 0) await new Promise((resolve) => window.setTimeout(resolve, wait))
    }
  })()

  try {
    const result = await inflight
    const lang = useAppStore.getState().settings.language
    if (result === "offline") toast.message(translate(lang, "refresh.offline"))
    else toast.success(translate(lang, "refresh.ok"))
    return result
  } finally {
    inflight = null
    setBusy(false)
  }
}
