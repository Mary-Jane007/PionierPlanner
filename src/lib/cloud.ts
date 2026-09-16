"use client"

import { CLOUD_TOKEN_KEY, LAST_EMAIL_KEY } from "@/lib/constants"
import { getDurable, removeDurable, setDurable } from "@/lib/durable-storage"
import type {
  ActivityCategory,
  AvailabilitySlot,
  CalendarEvent,
  Commitment,
  Experience,
  HistoricalMonth,
  MonthlyGoal,
  PioneerTypeId,
  UserProfile,
  UserSettings,
} from "@/types"
import type { PioneerTip } from "@/lib/tips"

export { CLOUD_TOKEN_KEY } from "@/lib/constants"

export type PlannerSnapshot = {
  version: 1
  updatedAt: string
  user: UserProfile | null
  onboarded: boolean
  pioneerType: PioneerTypeId | string
  customMonthlyHours: number
  monthlyGoals: MonthlyGoal[]
  events: CalendarEvent[]
  availability: AvailabilitySlot[]
  commitments: Commitment[]
  experiences: Experience[]
  history: HistoricalMonth[]
  settings: UserSettings | unknown
  hiddenCategories: ActivityCategory[]
  customTips: PioneerTip[]
}

export type CloudError = "invalid" | "missing" | "exists" | "weak" | "offline" | "unauthorized" | "server"

type CloudOk<T> = T & { token?: string }
type CloudFail = { error: CloudError }

function apiBase() {
  const explicit = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")
  if (explicit) return `${explicit}/api/cloud`
  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location
    if (port === "4321") return `${protocol}//${hostname}:4322/api/cloud`
  }
  return "/api/cloud"
}

export function cloudToken(): string {
  return getDurable(CLOUD_TOKEN_KEY) ?? ""
}

export function setCloudToken(token: string) {
  if (token) setDurable(CLOUD_TOKEN_KEY, token)
  else removeDurable(CLOUD_TOKEN_KEY)
}

export function clearCloudSession() {
  setCloudToken("")
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  token = cloudToken()
): Promise<CloudOk<T> | CloudFail> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  if (token) headers.set("Authorization", `Bearer ${token}`)
  try {
    const response = await fetch(`${apiBase()}${path}`, { ...init, headers, cache: "no-store" })
    let data: Record<string, unknown> = {}
    try {
      data = (await response.json()) as Record<string, unknown>
    } catch {
      data = {}
    }
    if (!response.ok) {
      const error = (data.error as CloudError) || (response.status === 401 ? "unauthorized" : "server")
      return { error }
    }
    return data as CloudOk<T>
  } catch {
    return { error: "offline" }
  }
}

let healthPromise: Promise<boolean> | null = null

export async function cloudAvailable(): Promise<boolean> {
  if (healthPromise) return healthPromise
  healthPromise = (async () => {
    const result = await request<{ ok?: boolean }>("/health", { method: "GET" }, "")
    if ("error" in result) {
      healthPromise = null
      return false
    }
    return result.ok === true
  })()
  return healthPromise
}

export async function cloudRegister(input: {
  name: string
  email: string
  password: string
}): Promise<{ profile: UserProfile; token: string } | CloudFail> {
  const result = await request<{ profile: UserProfile; token: string }>("/register", {
    method: "POST",
    body: JSON.stringify(input),
  }, "")
  if ("error" in result) return result
  if (!result.profile || !result.token) return { error: "server" }
  setCloudToken(result.token)
  if (result.profile.email) setDurable(LAST_EMAIL_KEY, result.profile.email)
  return result
}

export async function cloudLogin(input: {
  email: string
  password: string
}): Promise<{ profile: UserProfile; token: string; snapshot: PlannerSnapshot | null } | CloudFail> {
  const result = await request<{
    profile: UserProfile
    token: string
    snapshot: PlannerSnapshot | null
  }>("/login", {
    method: "POST",
    body: JSON.stringify(input),
  }, "")
  if ("error" in result) return result
  if (!result.profile || !result.token) return { error: "server" }
  setCloudToken(result.token)
  if (result.profile.email) setDurable(LAST_EMAIL_KEY, result.profile.email)
  return result
}

export async function cloudPull(): Promise<{ snapshot: PlannerSnapshot | null } | CloudFail> {
  return request<{ snapshot: PlannerSnapshot | null }>("/data", { method: "GET" })
}

export async function cloudPush(snapshot: PlannerSnapshot): Promise<{ ok: true } | CloudFail> {
  return request<{ ok: true }>("/data", {
    method: "PUT",
    body: JSON.stringify({ snapshot }),
  })
}

export async function cloudUpdateEmail(email: string): Promise<{ profile: UserProfile } | CloudFail> {
  return request<{ profile: UserProfile }>("/email", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

export async function cloudUpdatePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ ok: true } | CloudFail> {
  return request<{ ok: true }>("/password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export async function cloudDeleteAccount(): Promise<{ ok: true } | CloudFail> {
  const result = await request<{ ok: true }>("/account", { method: "DELETE" })
  if (!("error" in result)) clearCloudSession()
  return result
}
