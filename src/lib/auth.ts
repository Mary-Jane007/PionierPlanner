"use client"

import { ACCOUNTS_KEY, LAST_EMAIL_KEY } from "@/lib/constants"
import {
  cloudAvailable,
  cloudDeleteAccount,
  cloudGoogleLogin,
  cloudLogin,
  cloudRegister,
  cloudToken,
  cloudUpdateEmail,
  cloudUpdatePassword,
  clearCloudSession,
  type PlannerSnapshot,
} from "@/lib/cloud"
import { fetchGoogleIdentity, requestGoogleAccessToken, type GoogleIdentity } from "@/lib/google-auth"
import { getDurable, removeDurable, setDurable } from "@/lib/durable-storage"
import type { UserAccount, UserProfile } from "@/types"

export type AuthSuccess = {
  profile: UserProfile
  snapshot?: PlannerSnapshot | null
}

export type AuthFailure = {
  error: "invalid" | "missing" | "exists" | "weak" | "offline" | "cloud" | "server" | "cancelled" | "google"
}

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
    return JSON.parse(getDurable(ACCOUNTS_KEY) ?? "[]") as UserAccount[]
  } catch {
    return []
  }
}

function writeAccounts(accounts: UserAccount[]) {
  setDurable(ACCOUNTS_KEY, JSON.stringify(accounts))
}

function toProfile(account: UserAccount): UserProfile {
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    createdAt: account.createdAt,
  }
}

async function cacheLocalAccount(profile: UserProfile, password: string) {
  const hashed = await hashPassword(password)
  const current = readAccounts()
  const stored: UserAccount = {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    passwordHash: hashed,
    createdAt: profile.createdAt,
  }
  const at = current.findIndex(
    (account) => account.id === profile.id || account.email === profile.email
  )
  if (at === -1) writeAccounts([...current, stored])
  else {
    const copy = [...current]
    copy[at] = stored
    writeAccounts(copy)
  }
}

export async function registerAccount(
  name: string,
  email: string,
  password: string
): Promise<AuthSuccess | { error: "exists" | "offline" | "invalid" | "weak" | "server" }> {
  const normalized = email.trim().toLowerCase()
  if (!normalized.includes("@") || !normalized.includes(".")) return { error: "invalid" }
  if (password.trim().length < 6) return { error: "weak" }

  const online = await cloudAvailable()
  if (online) {
    const created = await cloudRegister({ name, email: normalized, password })
    if ("error" in created) {
      if (created.error === "exists") return { error: "exists" }
      if (created.error === "offline") return { error: "offline" }
      if (created.error === "weak") return { error: "weak" }
      if (created.error === "invalid") return { error: "invalid" }
      return { error: "server" }
    }
    await cacheLocalAccount(created.profile, password)
    rememberEmail(created.profile.email)
    return { profile: created.profile, snapshot: null }
  }

  const accounts = readAccounts()
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
  return { profile: toProfile(account), snapshot: null }
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
      googleSub: account.googleSub,
      createdAt: account.createdAt || new Date().toISOString(),
    })
  }
  const merged = [...byId.values()]
  const byEmail = new Map<string, UserAccount>()
  for (const account of merged) byEmail.set(account.email, account)
  writeAccounts([...byEmail.values()])
}

function cacheGoogleLocal(profile: UserProfile, googleSub: string) {
  const current = readAccounts()
  const at = current.findIndex(
    (account) =>
      account.id === profile.id ||
      account.email === profile.email ||
      account.googleSub === googleSub
  )
  const previous = at === -1 ? null : current[at]
  const stored: UserAccount = {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    passwordHash:
      previous && !previous.passwordHash.startsWith("google:")
        ? previous.passwordHash
        : `google:${googleSub}`,
    googleSub,
    createdAt: profile.createdAt,
  }
  if (at === -1) writeAccounts([...current, stored])
  else {
    const copy = [...current]
    copy[at] = stored
    writeAccounts(copy)
  }
}

export function upsertLocalGoogleAccount(identity: GoogleIdentity): {
  profile: UserProfile
  created: boolean
} {
  const email = identity.email.trim().toLowerCase()
  const accounts = readAccounts()
  const existing =
    accounts.find((account) => account.googleSub === identity.sub) ||
    accounts.find((account) => account.email === email)
  if (existing) {
    const updated: UserAccount = {
      ...existing,
      email,
      name: identity.name.trim() || existing.name,
      googleSub: identity.sub,
    }
    writeAccounts(accounts.map((account) => (account.id === existing.id ? updated : account)))
    return { profile: toProfile(updated), created: false }
  }
  const account: UserAccount = {
    id: crypto.randomUUID(),
    email,
    name: identity.name.trim() || email.split("@")[0],
    passwordHash: `google:${identity.sub}`,
    googleSub: identity.sub,
    createdAt: new Date().toISOString(),
  }
  writeAccounts([...accounts, account])
  return { profile: toProfile(account), created: true }
}

export async function signInWithGoogle(): Promise<
  (AuthSuccess & { created: boolean }) | AuthFailure
> {
  const token = await requestGoogleAccessToken()
  if ("error" in token) return token

  const online = await cloudAvailable()
  if (online) {
    const result = await cloudGoogleLogin(token.accessToken)
    if (!("error" in result)) {
      cacheGoogleLocal(result.profile, result.googleSub)
      rememberEmail(result.profile.email)
      return {
        profile: result.profile,
        snapshot: result.snapshot,
        created: result.created,
      }
    }
    if (result.error !== "offline") {
      return { error: result.error === "invalid" ? "invalid" : "server" }
    }
  }

  const identity = await fetchGoogleIdentity(token.accessToken)
  if (!identity) return { error: "invalid" }
  const local = upsertLocalGoogleAccount(identity)
  rememberEmail(local.profile.email)
  return { profile: local.profile, snapshot: null, created: local.created }
}

export async function signInAccount(
  email: string,
  password: string
): Promise<AuthSuccess | AuthFailure> {
  const online = await cloudAvailable()
  if (online) {
    const result = await cloudLogin({ email, password })
    if (!("error" in result)) {
      await cacheLocalAccount(result.profile, password)
      rememberEmail(result.profile.email)
      return { profile: result.profile, snapshot: result.snapshot }
    }
    if (result.error === "missing" || result.error === "invalid") return { error: result.error }
    if (result.error !== "offline") return { error: "server" }
  }

  const account = findStoredAccount(email)
  if (!account) return { error: online ? "missing" : "offline" }
  if (!(await passwordMatches(password, account.passwordHash))) return { error: "invalid" }
  return { profile: toProfile(account) }
}

export async function signInOrRegister(
  email: string,
  password: string,
  name?: string
): Promise<AuthSuccess | AuthFailure> {
  const accounts = readAccounts()
  const normalized = email.trim().toLowerCase()
  const existing = accounts.find((item) => item.email === normalized)
  if (!existing) {
    const created = await registerAccount(name || normalized.split("@")[0], email, password)
    if ("error" in created) return created
    return created
  }
  return signInAccount(email, password)
}

export function hasStoredAccount(userId: string): boolean {
  if (cloudToken()) return true
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
): Promise<AuthSuccess | { error: "exists" | "missing" | "invalid" | "offline" | "server" }> {
  const normalized = email.trim().toLowerCase()
  if (!normalized.includes("@") || !normalized.includes(".")) return { error: "invalid" }
  if (cloudToken()) {
    const result = await cloudUpdateEmail(normalized)
    if ("error" in result) {
      if (result.error === "exists") return { error: "exists" }
      if (result.error === "invalid") return { error: "invalid" }
      if (result.error === "offline") return { error: "offline" }
      return { error: "server" }
    }
    const accounts = readAccounts()
    const index = accounts.findIndex((account) => account.id === userId)
    if (index !== -1) {
      const next = [...accounts]
      next[index] = { ...next[index], email: result.profile.email }
      writeAccounts(next)
    }
    rememberEmail(result.profile.email)
    return { profile: result.profile }
  }
  const accounts = readAccounts()
  const index = accounts.findIndex((account) => account.id === userId)
  if (index === -1) return { error: "missing" }
  if (emailTaken(accounts, normalized, userId)) return { error: "exists" }
  const next = [...accounts]
  next[index] = { ...next[index], email: normalized }
  writeAccounts(next)
  rememberEmail(normalized)
  return { profile: toProfile(next[index]) }
}

export async function changeAccountPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ ok: true } | { error: "invalid" | "missing" | "weak" | "offline" | "server" }> {
  if (newPassword.trim().length < 6) return { error: "weak" }
  if (cloudToken()) {
    const result = await cloudUpdatePassword(currentPassword, newPassword)
    if ("error" in result) {
      if (result.error === "invalid" || result.error === "weak" || result.error === "offline") {
        return { error: result.error }
      }
      return { error: "server" }
    }
  }
  const accounts = readAccounts()
  const index = accounts.findIndex((account) => account.id === userId)
  if (index === -1) {
    if (cloudToken()) return { ok: true }
    return { error: "missing" }
  }
  if (!(await passwordMatches(currentPassword, accounts[index].passwordHash))) {
    if (cloudToken()) {
      const next = [...accounts]
      next[index] = { ...next[index], passwordHash: await hashPassword(newPassword) }
      writeAccounts(next)
      return { ok: true }
    }
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
): Promise<{ ok: true } | { error: "missing" | "weak" | "cloud" }> {
  if (newPassword.trim().length < 6) return { error: "weak" }
  if (await cloudAvailable()) return { error: "cloud" }
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
): Promise<AuthSuccess | { error: "exists" | "invalid" | "weak" | "offline" | "server" }> {
  const normalized = email.trim().toLowerCase()
  if (!normalized.includes("@") || !normalized.includes(".")) return { error: "invalid" }
  if (password.trim().length < 6) return { error: "weak" }
  if (await cloudAvailable()) {
    const created = await cloudRegister({
      name: profile.name,
      email: normalized,
      password,
    })
    if ("error" in created) {
      if (created.error === "exists") return { error: "exists" }
      if (created.error === "offline") return { error: "offline" }
      if (created.error === "weak") return { error: "weak" }
      if (created.error === "invalid") return { error: "invalid" }
      return { error: "server" }
    }
    await cacheLocalAccount(created.profile, password)
    rememberEmail(created.profile.email)
    return { profile: created.profile, snapshot: null }
  }
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
    return { profile: toProfile(account) }
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
  return { profile: toProfile(next[index]) }
}

export function rememberEmail(email: string) {
  const normalized = email.trim().toLowerCase()
  if (normalized) setDurable(LAST_EMAIL_KEY, normalized)
}

export function rememberedEmail(): string {
  return getDurable(LAST_EMAIL_KEY) ?? ""
}

export function forgetRememberedEmail() {
  removeDurable(LAST_EMAIL_KEY)
}

export async function deleteStoredAccount(userId: string) {
  if (cloudToken()) {
    await cloudDeleteAccount()
  }
  const remaining = readAccounts().filter((account) => account.id !== userId)
  writeAccounts(remaining)
  clearCloudSession()
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
