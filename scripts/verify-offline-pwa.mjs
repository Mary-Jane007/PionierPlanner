import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { spawn } from "node:child_process"
import { collectPrecacheUrls, urlsForFile } from "./generate-sw.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const outDir = join(root, "out")
const swPath = join(outDir, "sw.js")

const REQUIRED_URLS = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./inloggen/",
  "./vandaag/",
  "./planner/",
  "./kalender/",
  "./activiteiten/",
  "./statistieken/",
  "./ervaringen/",
  "./tips/",
  "./profiel/",
  "./setup/",
  "./download/",
]

function fail(message) {
  console.error(`offline PWA check failed: ${message}`)
  process.exitCode = 1
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function extractArray(source, name) {
  const match = source.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\n\\])`))
  if (!match) return null
  return JSON.parse(match[1])
}

function checkGeneratedWorker() {
  assert(
    urlsForFile("activiteiten/__next.!KGFwcCk.activiteiten.__PAGE__.txt")[0].includes("!"),
    "RSC payload URLs must keep ! so they match browser requests",
  )
  assert(existsSync(outDir), "missing out/. Run npm run build first.")
  if (process.exitCode) return []
  assert(existsSync(swPath), "missing out/sw.js. Did generate-sw.mjs run?")
  if (process.exitCode) return []

  const source = readFileSync(swPath, "utf8")
  assert(source.includes("pioniersplanner-"), "service worker cache name is missing")
  assert(!source.includes("__PRECACHE_URLS__"), "service worker template was not filled in")
  assert(!source.includes(".apk"), "service worker should not precache the APK")

  const urls = extractArray(source, "PRECACHE_URLS") || collectPrecacheUrls(outDir)
  const urlSet = new Set(urls)
  for (const required of REQUIRED_URLS) {
    assert(urlSet.has(required), `missing precache URL ${required}`)
  }
  assert(
    urls.some((url) => url.includes("/_next/static/")),
    "missing hashed Next.js assets in precache",
  )
  assert(
    urls.some((url) => url.includes("__next.") && url.endsWith(".txt")),
    "missing Next.js RSC payloads in precache",
  )
  if (!process.exitCode) console.log(`precache ok: ${urls.length} URLs`)
  return urls
}

async function withPreview(run) {
  const port = 4173
  const child = spawn(process.execPath, [join(root, "scripts/preview.mjs")], {
    cwd: root,
    env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" },
    stdio: ["ignore", "pipe", "pipe"],
  })

  const output = []
  child.stdout.on("data", (chunk) => output.push(String(chunk)))
  child.stderr.on("data", (chunk) => output.push(String(chunk)))

  await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`preview did not start:\n${output.join("")}`)),
      8000,
    )
    const onData = (chunk) => {
      if (String(chunk).includes("offline PWA preview")) {
        clearTimeout(timer)
        resolve(true)
      }
    }
    child.stdout.on("data", onData)
    child.once("exit", (code) => {
      clearTimeout(timer)
      reject(new Error(`preview exited ${code}:\n${output.join("")}`))
    })
  })

  try {
    return await run(`http://127.0.0.1:${port}`)
  } finally {
    child.kill("SIGTERM")
  }
}

async function checkInBrowser(origin) {
  let puppeteer
  try {
    puppeteer = await import("puppeteer-core")
  } catch {
    console.log("puppeteer-core not installed; skipping browser offline check")
    return
  }

  const browser = await puppeteer.default.launch({
    executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--ignore-certificate-errors"],
  })

  try {
    const page = await browser.newPage()
    await page.goto(`${origin}/`, { waitUntil: "networkidle0", timeout: 30000 })
    await page.evaluate(() => navigator.serviceWorker.ready)

    const cacheInfo = await page.evaluate(async () => {
      await navigator.serviceWorker.ready
      const keys = await caches.keys()
      const name = keys.find((key) => key.startsWith("pioniersplanner-"))
      if (!name) return { keys, count: 0 }
      const cache = await caches.open(name)
      const requests = await cache.keys()
      return { keys, name, count: requests.length }
    })
    assert(
      cacheInfo.count > 20,
      `expected a full precache, got ${cacheInfo.count} entries (${cacheInfo.keys})`,
    )

    await page.setOfflineMode(true)
    for (const path of ["/vandaag/", "/planner/", "/kalender/", "/inloggen/"]) {
      const response = await page.goto(`${origin}${path}`, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      })
      assert(response && response.ok(), `offline navigation failed for ${path}: ${response?.status()}`)
      const body = await page.evaluate(() => document.body?.innerText || "")
      assert(body.includes("Pioniersplanner") || body.length > 20, `offline page ${path} rendered empty`)
    }
    if (!process.exitCode) {
      console.log(`browser offline ok: ${cacheInfo.count} cached requests (${cacheInfo.name})`)
    }
  } finally {
    await browser.close()
  }
}

checkGeneratedWorker()
if (process.exitCode) process.exit(process.exitCode)

if (process.argv.includes("--browser") || process.env.PWA_VERIFY_BROWSER === "1") {
  await withPreview((origin) => checkInBrowser(origin))
} else {
  console.log("static checks passed; run with --browser for Chrome offline verification")
}
