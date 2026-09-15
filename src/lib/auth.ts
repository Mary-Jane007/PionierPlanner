"use client"

import { ACCOUNTS_KEY, LAST_EMAIL_KEY } from "@/lib/constants"
import type { UserAccount, UserProfile } from "@/types"

async function sha256Hash(password: string): Promise<string | null> {
  const payload = `pioniersplanner::${password}`
  try {
    if (!globalThis.crypto?.subtle) return null
    const data = new TextEncoder().encode(payload)
    const buffer = await crypto.subtle.digest("SHA-256", data)
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
  } catch {
    return null
  }
}

function fallbackHash(password: string): string {
  const payload = `pioniersplanner::${password}`
  let hash = 0
  for (let index = 0; index < payload.length; index += 1) {
    hash = (Math.imul(31, hash) + payload.charCodeAt(index)) | 0
  }
  return `fallback:${hash.toString(16)}:${payload.length}`
}

async function hashPassword(password: string): Promise<string> {
  return (await sha256Hash(password)) ?? fallbackHash(password)
}

async function passwordMatches(password: string, storedHash: string): Promise<boolean> {
  const candidates = new Set<string>([fallbackHash(password)])
  const sha = await sha256Hash(password)
  if (sha) candidates.add(sha)
  return candidates.has(storedHash)
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

export function readStoredAccounts(): UserAccount[] {
  return readAccounts()
}

export function writeStoredAccounts(accounts: UserAccount[]) {
  writeAccounts(accounts)
}

export function storedAccountCount(): number {
  return readAccounts().length
}

export function findStoredAccount(email: string): UserAccount | undefined {
  const normalized = email.trim().toLowerCase()
  return readAccounts().find((account) => account.email === normalized)
}

export function mergeStoredAccounts(incoming: UserAccount[]) {
  const current = readAccounts()
  const byId = new Map(current.map((account) => [account.id, account]))
  for (const account of incoming) {
    if (!account?.id || !account.email || !account.passwordHash) continue
    byId.set(account.id, {
      id: account.id,
      email: account.email.trim().toLowerCase(),
      name: account.name || account.email,
      passwordHash: account.passwordHash,
      createdAt: account.createdAt || new Date().toISOString(),
    })
  }
  const merged = [...byId.values()]
  const byEmail = new Map<string, UserAccount>()
  for (const account of merged) byEmail.set(account.email, account)
  writeAccounts([...byEmail.values()])
}

export async function signInAccount(
  email: string,
  password: string
): Promise<UserProfile | { error: "invalid" | "missing" }> {
  const account = findStoredAccount(email)
  if (!account) return { error: "missing" }
  if (!(await passwordMatches(password, account.passwordHash))) return { error: "invalid" }
  return toProfile(account)
}

export async function signInOrRegister(
  email: string,
  password: string,
  name?: string
): Promise<UserProfile | { error: "invalid" | "missing" }> {
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

export function hasStoredAccount(userId: string): boolean {
  return readAccounts().some((account) => account.id === userId)
}

export function updateStoredAccountName(userId: string, name: string) {
  const accounts = readAccounts()
  const index = accounts.findIndex((account) => account.id === userId)
  if (index === -1) return
  const nextName = name.trim()
  if (!nextName) return
  const next = [...accounts]
  next[index] = { ...next[index], name: nextName }
  writeAccounts(next)
}

function emailTaken(accounts: UserAccount[], email: string, exceptId?: string): boolean {
  return accounts.some((account) => account.email === email && account.id !== exceptId)
}

export async function updateAccountEmail(
  userId: string,
  email: string
): Promise<UserProfile | { error: "exists" | "missing" | "invalid" }> {
  const normalized = email.trim().toLowerCase()
  if (!normalized.includes("@") || !normalized.includes(".")) return { error: "invalid" }
  const accounts = readAccounts()
  const index = accounts.findIndex((account) => account.id === userId)
  if (index === -1) return { error: "missing" }
  if (emailTaken(accounts, normalized, userId)) return { error: "exists" }
  const next = [...accounts]
  next[index] = { ...next[index], email: normalized }
  writeAccounts(next)
  rememberEmail(normalized)
  return toProfile(next[index])
}

export async function changeAccountPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ ok: true } | { error: "invalid" | "missing" | "weak" }> {
  if (newPassword.trim().length < 6) return { error: "weak" }
  const accounts = readAccounts()
  const index = accounts.findIndex((account) => account.id === userId)
  if (index === -1) return { error: "missing" }
  if (!(await passwordMatches(currentPassword, accounts[index].passwordHash))) {
    return { error: "invalid" }
  }
  const next = [...accounts]
  next[index] = { ...next[index], passwordHash: await hashPassword(newPassword) }
  writeAccounts(next)
  return { ok: true }
}

export async function resetAccountPassword(
  email: string,
  newPassword: string
): Promise<{ ok: true } | { error: "missing" | "weak" }> {
  if (newPassword.trim().length < 6) return { error: "weak" }
  const normalized = email.trim().toLowerCase()
  const accounts = readAccounts()
  const index = accounts.findIndex((account) => account.email === normalized)
  if (index === -1) return { error: "missing" }
  const next = [...accounts]
  next[index] = { ...next[index], passwordHash: await hashPassword(newPassword) }
  writeAccounts(next)
  rememberEmail(normalized)
  return { ok: true }
}

export async function saveAccountCredentials(
  profile: UserProfile,
  email: string,
  password: string
): Promise<UserProfile | { error: "exists" | "invalid" | "weak" }> {
  const normalized = email.trim().toLowerCase()
  if (!normalized.includes("@") || !normalized.includes(".")) return { error: "invalid" }
  if (password.trim().length < 6) return { error: "weak" }
  const accounts = readAccounts()
  if (emailTaken(accounts, normalized, profile.id)) return { error: "exists" }
  const passwordHash = await hashPassword(password)
  const index = accounts.findIndex((account) => account.id === profile.id)
  if (index === -1) {
    const account: UserAccount = {
      id: profile.id,
      email: normalized,
      name: profile.name.trim() || normalized.split("@")[0],
      passwordHash,
      createdAt: profile.createdAt,
    }
    writeAccounts([...accounts, account])
    rememberEmail(normalized)
    return toProfile(account)
  }
  const next = [...accounts]
  next[index] = {
    ...next[index],
    email: normalized,
    name: profile.name.trim() || next[index].name,
    passwordHash,
  }
  writeAccounts(next)
  rememberEmail(normalized)
  return toProfile(next[index])
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
