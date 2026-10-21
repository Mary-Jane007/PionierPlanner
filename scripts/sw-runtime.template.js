/* eslint-disable no-restricted-globals */
const CACHE_NAME = "__CACHE_NAME__"
const PRECACHE_URLS = __PRECACHE_URLS__
const NAV_FALLBACKS = ["./index.html", "./", "./offline.html"]
const PRECACHE_CONCURRENCY = 6
const NETWORK_WAIT_MS = 8000

self.addEventListener("install", (event) => {
  // Copy the previous app first so an update never blanks the installed copy.
  // Then refresh the shell (pages + scripts). RSC payloads finish on activate.
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await copyFromOldCaches(cache)
      const shell = PRECACHE_URLS.filter(isShellUrl)
      await precacheUrls(cache, shell)
    })(),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim()
      const cache = await caches.open(CACHE_NAME)
      const rest = PRECACHE_URLS.filter((url) => !isShellUrl(url))
      await precacheUrls(cache, rest)
      const stored = await cache.keys()
      if (stored.length < 20) return
      const names = await caches.keys()
      await Promise.all(names.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    })(),
  )
})

self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") self.skipWaiting()
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (shouldBypass(url)) return

  event.respondWith(handleRequest(request, url))
})

function isShellUrl(url) {
  return !url.includes("__next.") && !url.endsWith(".txt")
}

function shouldBypass(url) {
  if (url.pathname.includes("/api/cloud")) return true
  if (url.pathname.includes("/downloads/") && /\.(apk|zip)$/i.test(url.pathname)) return true
  if (url.pathname.includes("webpack-hmr")) return true
  if (url.pathname.includes("/_next/webpack")) return true
  if (url.pathname.includes("__online_check")) return true
  if (url.searchParams.has("__online_check")) return true
  return false
}

function isNavigation(request) {
  return request.mode === "navigate" || request.destination === "document"
}

function isImmutableAsset(url) {
  return url.pathname.includes("/_next/static/")
}

async function copyFromOldCaches(target) {
  const names = (await caches.keys()).filter((key) => key !== CACHE_NAME && key.startsWith("pioniersplanner"))
  for (const name of names) {
    const source = await caches.open(name)
    const requests = await source.keys()
    await Promise.all(
      requests.map(async (request) => {
        const already = await target.match(request)
        if (already) return
        const response = await source.match(request)
        if (response) await target.put(request, response)
      }),
    )
  }
}

async function precacheUrls(cache, urls) {
  const queue = urls.slice()
  let stored = 0
  const workers = Array.from({ length: Math.min(PRECACHE_CONCURRENCY, queue.length || 1) }, async () => {
    while (queue.length) {
      const url = queue.shift()
      const existing = await cache.match(url, { ignoreSearch: true })
      try {
        const response = await fetch(url, { credentials: "same-origin", cache: "reload" })
        if (response && response.ok) {
          await putCached(cache, url, response)
          stored += 1
        } else if (existing) {
          stored += 1
        }
      } catch {
        if (existing) stored += 1
      }
    }
  })
  await Promise.all(workers)
  return stored
}

async function putCached(cache, key, response) {
  const body = await response.clone().blob()
  await cache.put(
    key,
    new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    }),
  )
}

async function handleRequest(request, url) {
  if (isNavigation(request)) return openFromCache(request)
  if (isImmutableAsset(url)) return cacheFirst(request)
  return staleWhileRevalidate(request)
}

async function openFromCache(request) {
  const cached = await matchAnyCache(request, true)
  if (cached) {
    void refreshInBackground(request)
    return cached
  }
  try {
    const response = await fetchWithTimeout(request, NETWORK_WAIT_MS)
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME)
      await putCached(cache, request, response)
    }
    return response
  } catch {
    return matchFallbacks()
  }
}

function fetchWithTimeout(request, ms) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(request, { signal: controller.signal, credentials: "same-origin" }).finally(() =>
    clearTimeout(timer),
  )
}

function refreshInBackground(request) {
  return fetch(request, { credentials: "same-origin", cache: "reload" })
    .then(async (response) => {
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME)
        await putCached(cache, request, response)
      }
    })
    .catch(() => undefined)
}

async function cacheNames() {
  const names = await caches.keys()
  return names
    .filter((key) => key.startsWith("pioniersplanner"))
    .sort((a, b) => (a === CACHE_NAME ? -1 : b === CACHE_NAME ? 1 : 0))
}

async function matchAnyCache(request, navigation) {
  for (const name of await cacheNames()) {
    const cache = await caches.open(name)
    const hit = navigation
      ? await matchNavigation(cache, request)
      : await cache.match(request, { ignoreSearch: true })
    if (hit) return hit
  }
  return null
}

async function matchNavigation(cache, request) {
  const direct = await cache.match(request, { ignoreSearch: true })
  if (direct) return direct

  const url = new URL(request.url)
  const path = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`
  const candidates = [`${url.origin}${path}`, `${url.origin}${path}index.html`]
  for (const candidate of candidates) {
    const hit = await cache.match(candidate, { ignoreSearch: true })
    if (hit) return hit
  }
  return null
}

async function cacheFirst(request) {
  const cached = await matchAnyCache(request, false)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME)
      await putCached(cache, request, response)
    }
    return response
  } catch {
    return cachedResponseOrOffline(request)
  }
}

async function staleWhileRevalidate(request) {
  const cached = await matchAnyCache(request, false)
  const network = fetch(request)
    .then(async (response) => {
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME)
        await putCached(cache, request, response)
      }
      return response
    })
    .catch(() => cached)
  return cached || network || cachedResponseOrOffline(request)
}

async function matchFallbacks() {
  for (const name of await cacheNames()) {
    const cache = await caches.open(name)
    for (const url of NAV_FALLBACKS) {
      const hit = await cache.match(url, { ignoreSearch: true })
      if (hit) return hit
    }
  }
  return offlineResponse()
}

async function cachedResponseOrOffline(request) {
  const cached = await matchAnyCache(request, isNavigation(request))
  if (cached) return cached
  if (isNavigation(request)) return matchFallbacks()
  return new Response("", { status: 503, statusText: "Offline" })
}

function offlineResponse() {
  return new Response(
    `<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><body style="font-family:system-ui;background:#EDE7DB;color:#4D342D;padding:2rem"><h1>Pioniersplanner</h1><p>Je bent offline. Open de app opnieuw zodra je verbinding hebt, of installeer hem op je startscherm.</p></body></html>`,
    {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  )
}
