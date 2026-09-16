"use client"

import { Preferences } from "@capacitor/preferences"
import { Capacitor } from "@capacitor/core"
import {
  ACCOUNTS_KEY,
  CLOUD_TOKEN_KEY,
  LAST_EMAIL_KEY,
  STORAGE_KEY,
} from "@/lib/constants"

export const DURABLE_KEYS = [
  STORAGE_KEY,
  ACCOUNTS_KEY,
  LAST_EMAIL_KEY,
  CLOUD_TOKEN_KEY,
] as const

function native() {
  return typeof window !== "undefined" && Capacitor.isNativePlatform()
}

export function getDurable(key: string): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function setDurable(key: string, value: string) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, value)
  } catch {
    // Quota or private mode.
  }
  if (native()) {
    void Preferences.set({ key, value })
  }
}

export function removeDurable(key: string) {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore.
  }
  if (native()) {
    void Preferences.remove({ key })
  }
}

export async function restoreDurableStorage() {
  if (typeof window === "undefined" || !native()) return
  await Promise.all(
    DURABLE_KEYS.map(async (key) => {
      try {
        const { value } = await Preferences.get({ key })
        const existing = localStorage.getItem(key)
        if (value != null && value !== "") {
          localStorage.setItem(key, value)
        } else if (existing != null && existing !== "") {
          await Preferences.set({ key, value: existing })
        }
      } catch {
        // Preferences may be unavailable in some webviews.
      }
    })
  )
}

export async function flushDurableStorage() {
  if (typeof window === "undefined" || !native()) return
  await Promise.all(
    DURABLE_KEYS.map(async (key) => {
      try {
        const value = localStorage.getItem(key)
        if (value == null || value === "") {
          await Preferences.remove({ key })
        } else {
          await Preferences.set({ key, value })
        }
      } catch {
        // Ignore.
      }
    })
  )
}

export const zustandDurableStorage = {
  getItem: (name: string) => getDurable(name),
  setItem: (name: string, value: string) => {
    setDurable(name, value)
  },
  removeItem: (name: string) => {
    removeDurable(name)
  },
}
