"use client"

const GSI_SRC = "https://accounts.google.com/gsi/client"

export type GoogleIdentity = {
  sub: string
  email: string
  name: string
}

export type GoogleAuthOk = { credential: string } | { accessToken: string }

type TokenResponse = {
  access_token?: string
  error?: string
}

type TokenClient = {
  requestAccessToken: (opts?: { prompt?: string }) => void
}

type PromptMoment = {
  isNotDisplayed: () => boolean
  isSkippedMoment: () => boolean
  isDismissedMoment: () => boolean
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential?: string }) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
            use_fedcm_for_prompt?: boolean
          }) => void
          prompt: (listener?: (notification: PromptMoment) => void) => void
          cancel: () => void
          disableAutoSelect: () => void
        }
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            prompt?: string
            callback: (response: TokenResponse) => void
            error_callback?: (error: { type?: string }) => void
          }) => TokenClient
        }
      }
    }
  }
}

export function googleClientId() {
  return (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim()
}

export function disableGoogleAutoSelect() {
  try {
    window.google?.accounts?.id?.disableAutoSelect()
  } catch {
    // FedCM / older GIS builds may not expose this.
  }
}

function loadGoogleIdentity(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("window"))
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`)
    if (existing) {
      if (window.google?.accounts?.oauth2) {
        resolve()
        return
      }
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", () => reject(new Error("gsi")), { once: true })
      return
    }
    const script = document.createElement("script")
    script.src = GSI_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("gsi"))
    document.head.appendChild(script)
  })
}

function identityFromJwt(credential: string): GoogleIdentity | null {
  try {
    const payload = credential.split(".")[1]
    if (!payload) return null
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    ) as {
      sub?: string
      email?: string
      name?: string
      given_name?: string
      email_verified?: boolean | string
      aud?: string
    }
    if (json.email_verified === false || json.email_verified === "false") return null
    const expectedAud = googleClientId()
    if (expectedAud && json.aud && json.aud !== expectedAud) return null
    const email = String(json.email || "")
      .trim()
      .toLowerCase()
    const sub = String(json.sub || "").trim()
    if (!sub || !email.includes("@")) return null
    return {
      sub,
      email,
      name: String(json.name || json.given_name || "").trim() || email.split("@")[0],
    }
  } catch {
    return null
  }
}

function requestCurrentGoogleSession(clientId: string): Promise<GoogleAuthOk | null> {
  return new Promise((resolve) => {
    const idApi = window.google?.accounts?.id
    if (!idApi) {
      resolve(null)
      return
    }
    let settled = false
    const finish = (value: GoogleAuthOk | null) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      try {
        idApi.cancel()
      } catch {
        // FedCM cancel is best-effort.
      }
      resolve(value)
    }
    const timer = window.setTimeout(() => finish(null), 2000)
    disableGoogleAutoSelect()
    idApi.initialize({
      client_id: clientId,
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: true,
      callback: (response) => {
        if (response.credential) finish({ credential: response.credential })
        else finish(null)
      },
    })
    idApi.prompt((notification) => {
      if (
        notification.isNotDisplayed() ||
        notification.isSkippedMoment() ||
        notification.isDismissedMoment()
      ) {
        finish(null)
      }
    })
  })
}

function requestOAuthToken(clientId: string): Promise<GoogleAuthOk | { error: "cancelled" }> {
  return new Promise((resolve) => {
    const api = window.google?.accounts?.oauth2
    if (!api) {
      resolve({ error: "cancelled" })
      return
    }
    const client = api.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      prompt: "select_account",
      callback: (response) => {
        if (!response.access_token || response.error) {
          resolve({ error: "cancelled" })
          return
        }
        resolve({ accessToken: response.access_token })
      },
      error_callback: () => resolve({ error: "cancelled" }),
    })
    client.requestAccessToken({ prompt: "select_account" })
  })
}

export async function requestGoogleAuth(): Promise<GoogleAuthOk | { error: "cancelled" | "google" }> {
  const clientId = googleClientId()
  if (!clientId) return { error: "google" }
  try {
    await loadGoogleIdentity()
  } catch {
    return { error: "google" }
  }
  if (!window.google?.accounts) return { error: "google" }

  disableGoogleAutoSelect()

  const current = await requestCurrentGoogleSession(clientId)
  if (current) return current

  return requestOAuthToken(clientId)
}

export function identityFromCredential(credential: string): GoogleIdentity | null {
  return identityFromJwt(credential)
}

export async function fetchGoogleIdentity(accessToken: string): Promise<GoogleIdentity | null> {
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    })
    if (!response.ok) return null
    const me = (await response.json()) as {
      sub?: string
      email?: string
      name?: string
      given_name?: string
    }
    const email = String(me.email || "")
      .trim()
      .toLowerCase()
    const sub = String(me.sub || "").trim()
    if (!sub || !email.includes("@")) return null
    return {
      sub,
      email,
      name: String(me.name || me.given_name || "").trim() || email.split("@")[0],
    }
  } catch {
    return null
  }
}
