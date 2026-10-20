/* eslint-disable no-restricted-globals */
const CACHE_NAME = "__CACHE_NAME__"
const PRECACHE_URLS = __PRECACHE_URLS__
const NAV_FALLBACKS = ["./index.html", "./", "./offline.html"]
const PRECACHE_CONCURRENCY = 6

self.addEventListener("install", (event) => {
  // Activate as soon as the pages and scripts are cached. The rest of the
  // export (RSC payloads) fills in afterwards so an update does not block opening.
  // A failed install keeps the previous cache, so a flaky update cannot wipe offline use.
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const shell = []
      const rest = []
      for (const url of PRECACHE_URLS) {
        if (isShellUrl(url)) shell.push(url)
        else rest.push(url)
      }
      const stored = await precacheUrls(cache, shell)
      const minimum = shell.length === 0 ? 0 : Math.max(1, shell.length - 3)
      if (stored < minimum) throw new Error("shell precache incomplete")
      void precacheUrls(cache, rest)
    })(),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
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

async function precacheUrls(cache, urls) {
  const queue = urls.slice()
  let stored = 0
  const workers = Array.from({ length: Math.min(PRECACHE_CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const url = queue.shift()
      try {
        const response = await fetch(url, { credentials: "same-origin" })
        if (response && response.ok) {
          await putCached(cache, url, response)
          stored += 1
        }
      } catch {
        // One missing file must not fail the whole install.
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
  const cache = await caches.open(CACHE_NAME)
  const cached = await matchNavigation(cache, request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response && response.ok) await putCached(cache, request, response)
    return response
  } catch {
    return matchFallbacks(cache)
  }
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
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request, { ignoreSearch: true })
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response && response.ok) await putCached(cache, request, response)
    return response
  } catch {
    return cachedResponseOrOffline(cache, request)
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request, { ignoreSearch: true })
  const network = fetch(request)
    .then(async (response) => {
      if (response && response.ok) await putCached(cache, request, response)
      return response
    })
    .catch(() => cached)
  return cached || network || cachedResponseOrOffline(cache, request)
}

async function matchFallbacks(cache) {
  for (const url of NAV_FALLBACKS) {
    const hit = await cache.match(url, { ignoreSearch: true })
    if (hit) return hit
  }
  return offlineResponse()
}

async function cachedResponseOrOffline(cache, request) {
  const cached = await cache.match(request, { ignoreSearch: true })
  if (cached) return cached
  if (isNavigation(request)) return matchFallbacks(cache)
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
