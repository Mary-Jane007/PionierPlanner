/* eslint-disable no-restricted-globals */
const CACHE_NAME = "__CACHE_NAME__"
const PRECACHE_URLS = __PRECACHE_URLS__
const NAV_FALLBACKS = ["./index.html", "./", "./offline.html"]

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()))
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

function shouldBypass(url) {
  if (url.pathname.includes("/downloads/") && /\.(apk|zip)$/i.test(url.pathname)) return true
  if (url.pathname.includes("webpack-hmr")) return true
  if (url.pathname.includes("/_next/webpack")) return true
  return false
}

function isNavigation(request) {
  return request.mode === "navigate" || request.destination === "document"
}

function isImmutableAsset(url) {
  return url.pathname.includes("/_next/static/")
}

async function precache() {
  const cache = await caches.open(CACHE_NAME)
  await Promise.all(
    PRECACHE_URLS.map(async (url) => {
      try {
        const response = await fetch(url, { cache: "reload", credentials: "same-origin" })
        if (response.ok) await cache.put(url, response)
      } catch {
        // One missing file must not fail the whole install.
      }
    }),
  )
}

async function handleRequest(request, url) {
  if (isNavigation(request)) return networkFirst(request)
  if (isImmutableAsset(url)) return cacheFirst(request)
  return staleWhileRevalidate(request)
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  try {
    const response = await fetch(request)
    if (response && response.ok) await cache.put(request, response.clone())
    return response
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true })
    if (cached) return cached
    return matchFallbacks(cache)
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request, { ignoreSearch: true })
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response && response.ok) await cache.put(request, response.clone())
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
      if (response && response.ok) await cache.put(request, response.clone())
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
    `<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><body style="font-family:system-ui;background:#F7F5EF;color:#29483F;padding:2rem"><h1>Pioniersplanner</h1><p>Je bent offline. Open de app opnieuw zodra je verbinding hebt, of installeer hem op je startscherm.</p></body></html>`,
    {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  )
}
