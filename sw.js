/* eslint-disable no-restricted-globals */
const CACHE_NAME = "pioniersplanner-ebb4410802a0"
const PRECACHE_URLS = [
  "./",
  "./404.html",
  "./404/",
  "./404/index.html",
  "./__next.__PAGE__.txt",
  "./__next._full.txt",
  "./__next._tree.txt",
  "./__online_check/",
  "./__online_check/index.html",
  "./_next/static/chunks/03aj05hbnmcxj.css",
  "./_next/static/chunks/0bzsfs4t4s2ah.js",
  "./_next/static/chunks/0cngl-lvxytmm.js",
  "./_next/static/chunks/0cz1d0mv5g_q7.js",
  "./_next/static/chunks/0j9vxn8qg9vat.js",
  "./_next/static/chunks/0k5yhpdgswv7j.js",
  "./_next/static/chunks/0mpudkpr-hgcf.js",
  "./_next/static/chunks/0sjhjb97ms1ri.js",
  "./_next/static/chunks/0wjtx9mhaxxni.js",
  "./_next/static/chunks/0xd00v7f6bj1g.js",
  "./_next/static/chunks/0y97kgihqjfro.js",
  "./_next/static/chunks/1a2y8_gx2uj93.js",
  "./_next/static/chunks/1enbc2myxc56-.js",
  "./_next/static/chunks/1hmey4frakwj1.js",
  "./_next/static/chunks/1jcs21emrsvj1.js",
  "./_next/static/chunks/1ogw21e9nqfnm.js",
  "./_next/static/chunks/1pkqvmy2sysx-.js",
  "./_next/static/chunks/1ro0ehqkq16w6.js",
  "./_next/static/chunks/1vw9seawp--po.js",
  "./_next/static/chunks/1yphnnmzofsyc.js",
  "./_next/static/chunks/1za08u3mty6r3.js",
  "./_next/static/chunks/21nnnlzsevibx.js",
  "./_next/static/chunks/22wqi7v47s4jn.css",
  "./_next/static/chunks/2b_aqx3wflg5u.js",
  "./_next/static/chunks/2i51e627rllld.js",
  "./_next/static/chunks/2k8z9dl0yc2lt.js",
  "./_next/static/chunks/2lnt9xom4cnmq.js",
  "./_next/static/chunks/2pl2ej8jcy8dy.js",
  "./_next/static/chunks/2s0-1pls3wa4e.js",
  "./_next/static/chunks/2th2y7v6ci4z5.js",
  "./_next/static/chunks/2upf8uel6p8ym.js",
  "./_next/static/chunks/2w8m2gy3txlbu.js",
  "./_next/static/chunks/2wb3a-jtgf5em.js",
  "./_next/static/chunks/2wv57nn9-8b1v.js",
  "./_next/static/chunks/2xxz2vhllj9zc.js",
  "./_next/static/chunks/2z127zp2vxkhh.js",
  "./_next/static/chunks/32vs63h9i3e8s.js",
  "./_next/static/chunks/33p6svfpkso0n.js",
  "./_next/static/chunks/39ukrzj7qnutm.js",
  "./_next/static/chunks/3b4t8bry_7p7b.js",
  "./_next/static/chunks/3fntmmi971322.js",
  "./_next/static/chunks/3mc6dra1m0098.js",
  "./_next/static/chunks/3quudqo879p8t.js",
  "./_next/static/chunks/3rdrotu-j_eut.js",
  "./_next/static/chunks/40i4c4_2t71qy.js",
  "./_next/static/chunks/43g5-9haq8x94.js",
  "./_next/static/chunks/turbopack-34s8rp_rj3zqt.js",
  "./_next/static/dhc0HpDfCLF8pf_id3Zvu/_buildManifest.js",
  "./_next/static/dhc0HpDfCLF8pf_id3Zvu/_clientMiddlewareManifest.js",
  "./_next/static/dhc0HpDfCLF8pf_id3Zvu/_ssgManifest.js",
  "./_next/static/media/01e4147cff8141ee-s.p.3huc2loe0ie8a.woff2",
  "./_next/static/media/1f9e983605289f29-s.p.3aak_kra40y8r.woff2",
  "./_next/static/media/58c4895d0a0ef7cc-s.2vhvl9vrvk-va.woff2",
  "./_next/static/media/6ab0db14f70d8ed6-s.p.13hnt-xgp82zk.woff2",
  "./_next/static/media/9cc5c0547f229dea-s.00y8kskkn0hyx.woff2",
  "./_next/static/media/a342834df7752944-s.3hd2l7bm32o7k.woff2",
  "./_next/static/media/a343f882a40d2cc9-s.p.1sj6eobyi31rd.woff2",
  "./_next/static/media/b0947914c9718a1e-s.1xjn85gt7t6qs.woff2",
  "./_next/static/media/bfc7db5c00d21bc5-s.173xwsdme27n8.woff2",
  "./_next/static/media/d0b60be57f16ee32-s.1xtu7gopqv2u0.woff2",
  "./_next/static/media/d3fe2f289711ac3f-s.1l2zhvq5eocqf.woff2",
  "./_next/static/media/favicon.2vob68tjqpejf.ico",
  "./_next/static/media/icon.0sdms2ct3_qim.svg",
  "./_not-found/",
  "./_not-found/__next._full.txt",
  "./_not-found/__next._not-found.__PAGE__.txt",
  "./_not-found/__next._tree.txt",
  "./_not-found/index.html",
  "./_not-found/index.txt",
  "./activiteiten/",
  "./activiteiten/__next.!KGFwcCk.activiteiten.__PAGE__.txt",
  "./activiteiten/__next._full.txt",
  "./activiteiten/__next._tree.txt",
  "./activiteiten/index.html",
  "./activiteiten/index.txt",
  "./download/",
  "./download/__next._full.txt",
  "./download/__next._tree.txt",
  "./download/__next.download.__PAGE__.txt",
  "./download/index.html",
  "./download/index.txt",
  "./ervaringen/",
  "./ervaringen/__next.!KGFwcCk.ervaringen.__PAGE__.txt",
  "./ervaringen/__next._full.txt",
  "./ervaringen/__next._tree.txt",
  "./ervaringen/index.html",
  "./ervaringen/index.txt",
  "./favicon.ico",
  "./file.svg",
  "./globe.svg",
  "./icon.svg",
  "./icons/apple-touch-icon.png",
  "./icons/icon-1024.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./index.html",
  "./index.txt",
  "./inloggen/",
  "./inloggen/__next._full.txt",
  "./inloggen/__next._tree.txt",
  "./inloggen/__next.inloggen.__PAGE__.txt",
  "./inloggen/index.html",
  "./inloggen/index.txt",
  "./kalender/",
  "./kalender/__next.!KGFwcCk.kalender.__PAGE__.txt",
  "./kalender/__next._full.txt",
  "./kalender/__next._tree.txt",
  "./kalender/index.html",
  "./kalender/index.txt",
  "./manifest.webmanifest",
  "./nabezoeken/",
  "./nabezoeken/__next.!KGFwcCk.nabezoeken.__PAGE__.txt",
  "./nabezoeken/__next._full.txt",
  "./nabezoeken/__next._tree.txt",
  "./nabezoeken/index.html",
  "./nabezoeken/index.txt",
  "./next.svg",
  "./offline.html",
  "./planner/",
  "./planner/__next.!KGFwcCk.planner.__PAGE__.txt",
  "./planner/__next._full.txt",
  "./planner/__next._tree.txt",
  "./planner/index.html",
  "./planner/index.txt",
  "./profiel/",
  "./profiel/__next.!KGFwcCk.profiel.__PAGE__.txt",
  "./profiel/__next._full.txt",
  "./profiel/__next._tree.txt",
  "./profiel/index.html",
  "./profiel/index.txt",
  "./setup/",
  "./setup/__next._full.txt",
  "./setup/__next._tree.txt",
  "./setup/__next.setup.__PAGE__.txt",
  "./setup/index.html",
  "./setup/index.txt",
  "./statistieken/",
  "./statistieken/__next.!KGFwcCk.statistieken.__PAGE__.txt",
  "./statistieken/__next._full.txt",
  "./statistieken/__next._tree.txt",
  "./statistieken/index.html",
  "./statistieken/index.txt",
  "./tips/",
  "./tips/__next.!KGFwcCk.tips.__PAGE__.txt",
  "./tips/__next._full.txt",
  "./tips/__next._tree.txt",
  "./tips/index.html",
  "./tips/index.txt",
  "./vandaag/",
  "./vandaag/__next.!KGFwcCk.vandaag.__PAGE__.txt",
  "./vandaag/__next._full.txt",
  "./vandaag/__next._tree.txt",
  "./vandaag/index.html",
  "./vandaag/index.txt",
  "./vercel.svg",
  "./vorderingen/",
  "./vorderingen/__next.!KGFwcCk.vorderingen.__PAGE__.txt",
  "./vorderingen/__next._full.txt",
  "./vorderingen/__next._tree.txt",
  "./vorderingen/index.html",
  "./vorderingen/index.txt",
  "./window.svg"
]
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
    `<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><body style="font-family:system-ui;background:#EDE7DB;color:#4D342D;padding:2rem"><h1>Pioniersplanner</h1><p>Je bent offline. Open de app opnieuw zodra je verbinding hebt, of installeer hem op je startscherm.</p></body></html>`,
    {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  )
}
