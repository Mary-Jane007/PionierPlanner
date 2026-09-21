"use client"

const GSI_SRC = "https://accounts.google.com/gsi/client"

export type GoogleIdentity = {
  sub: string
  email: string
  name: string
}

type TokenResponse = {
  access_token?: string
  error?: string
}

type TokenClient = {
  requestAccessToken: (opts?: { prompt?: string }) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: TokenResponse) => void
          }) => TokenClient
        }
      }
    }
  }
}

export function googleClientId() {
  return (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim()
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

export async function requestGoogleAccessToken(): Promise<
  { accessToken: string } | { error: "cancelled" | "google" }
> {
  const clientId = googleClientId()
  if (!clientId) return { error: "google" }
  try {
    await loadGoogleIdentity()
  } catch {
    return { error: "google" }
  }
  const api = window.google?.accounts?.oauth2
  if (!api) return { error: "google" }

  return new Promise((resolve) => {
    const client = api.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (response) => {
        if (!response.access_token || response.error) {
          resolve({ error: "cancelled" })
          return
        }
        resolve({ accessToken: response.access_token })
      },
    })
    client.requestAccessToken({ prompt: "select_account" })
  })
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
