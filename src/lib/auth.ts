"use client"

import { ACCOUNTS_KEY } from "@/lib/constants"
import type { UserAccount, UserProfile } from "@/types"

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`pioniersplanner::${password}`)
  const buffer = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
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
    name: name.trim(),
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  }
  writeAccounts([...accounts, account])
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    createdAt: account.createdAt,
  }
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
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    createdAt: account.createdAt,
  }
}

export function deleteStoredAccount(userId: string) {
  writeAccounts(readAccounts().filter((account) => account.id !== userId))
}

export function demoProfile(): UserProfile {
  return {
    id: "demo-user",
    email: "demo@pioniersplanner.app",
    name: "Marisol",
    createdAt: "2026-01-12T09:00:00.000Z",
  }
}
