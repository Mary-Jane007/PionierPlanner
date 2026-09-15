"use client"

import { ACCOUNTS_KEY, LAST_EMAIL_KEY } from "@/lib/constants"
import type { UserAccount, UserProfile } from "@/types"

async function hashPassword(password: string): Promise<string> {
  const payload = `pioniersplanner::${password}`
  try {
    if (globalThis.crypto?.subtle) {
      const data = new TextEncoder().encode(payload)
      const buffer = await crypto.subtle.digest("SHA-256", data)
      return Array.from(new Uint8Array(buffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("")
    }
  } catch {
    // Preview or non-secure contexts can lack SubtleCrypto.
  }
  let hash = 0
  for (let index = 0; index < payload.length; index += 1) {
    hash = (Math.imul(31, hash) + payload.charCodeAt(index)) | 0
  }
  return `fallback:${hash.toString(16)}:${payload.length}`
}

function readAccounts(): UserAccount[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "[]") as UserAccount[]
  } catch {
    return []
  }
}

function writeAccounts(accounts: UserAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

function toProfile(account: UserAccount): UserProfile {
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    createdAt: account.createdAt,
  }
}

export async function registerAccount(
  name: string,
  email: string,
  password: string
): Promise<UserProfile | { error: "exists" }> {
  const accounts = readAccounts()
  const normalized = email.trim().toLowerCase()
  if (accounts.some((account) => account.email === normalized)) {
    return { error: "exists" }
  }
  const account: UserAccount = {
    id: crypto.randomUUID(),
    email: normalized,
    name: name.trim() || normalized.split("@")[0],
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  }
  writeAccounts([...accounts, account])
  return toProfile(account)
}

export async function signInAccount(
  email: string,
  password: string
): Promise<UserProfile | { error: "invalid" }> {
  const accounts = readAccounts()
  const normalized = email.trim().toLowerCase()
  const hash = await hashPassword(password)
  const account = accounts.find(
    (item) => item.email === normalized && item.passwordHash === hash
  )
  if (!account) return { error: "invalid" }
  return toProfile(account)
}

export async function signInOrRegister(
  email: string,
  password: string,
  name?: string
): Promise<UserProfile | { error: "invalid" }> {
  const accounts = readAccounts()
  const normalized = email.trim().toLowerCase()
  const existing = accounts.find((item) => item.email === normalized)
  if (!existing) {
    const created = await registerAccount(name || normalized.split("@")[0], email, password)
    if ("error" in created) return { error: "invalid" }
    return created
  }
  return signInAccount(email, password)
}

export function rememberEmail(email: string) {
  if (typeof window === "undefined") return
  const normalized = email.trim().toLowerCase()
  if (normalized) localStorage.setItem(LAST_EMAIL_KEY, normalized)
}

export function rememberedEmail(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(LAST_EMAIL_KEY) ?? ""
}

export function forgetRememberedEmail() {
  if (typeof window === "undefined") return
  localStorage.removeItem(LAST_EMAIL_KEY)
}

export function deleteStoredAccount(userId: string) {
  const remaining = readAccounts().filter((account) => account.id !== userId)
  writeAccounts(remaining)
  const last = rememberedEmail()
  if (last && !remaining.some((account) => account.email === last)) {
    forgetRememberedEmail()
  }
}

export function demoProfile(): UserProfile {
  return {
    id: "demo-user",
    email: "demo@pioniersplanner.app",
    name: "Marisol",
    createdAt: "2026-01-12T09:00:00.000Z",
  }
}

export function isAppOwner(user: UserProfile | null): boolean {
  if (!user) return false
  const accounts = readAccounts()
  if (accounts.length === 0) return true
  const oldest = accounts.reduce((first, account) =>
    account.createdAt < first.createdAt ? account : first
  )
  return oldest.id === user.id
}
