import { createHash } from "node:crypto"
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const outDir = join(root, "out")
const templatePath = join(root, "scripts/sw-runtime.template.js")

const SKIP_FILES = new Set(["sw.js", ".nojekyll", ".DS_Store"])
const SKIP_EXT = new Set([".apk", ".zip", ".map"])

export function encodeAssetPath(rel) {
  // Keep RFC 3986 path characters such as `!` so cache keys match browser requests.
  return encodeURI(rel.split("\\").join("/"))
}

export function urlsForFile(rel) {
  const urls = []
  if (rel === "index.html") {
    urls.push("./", "./index.html")
    return urls
  }
  if (rel.endsWith("/index.html")) {
    const dir = rel.slice(0, -"index.html".length)
    urls.push(`./${encodeAssetPath(dir)}`, `./${encodeAssetPath(rel)}`)
    return urls
  }
  urls.push(`./${encodeAssetPath(rel)}`)
  return urls
}

function shouldSkip(rel) {
  const name = rel.split("/").at(-1) || rel
  if (SKIP_FILES.has(name)) return true
  if (rel.startsWith("downloads/") && SKIP_EXT.has(extname(name))) return true
  if (SKIP_EXT.has(extname(name))) return true
  return false
}

function extname(name) {
  const index = name.lastIndexOf(".")
  return index === -1 ? "" : name.slice(index).toLowerCase()
}

export function listExportFiles(dir = outDir) {
  const files = []

  function walk(current) {
    for (const name of readdirSync(current)) {
      const full = join(current, name)
      const rel = relative(dir, full).split("\\").join("/")
      const stat = statSync(full)
      if (stat.isDirectory()) {
        if (rel === "downloads") continue
        walk(full)
        continue
      }
      if (shouldSkip(rel)) continue
      files.push({ full, rel, size: stat.size })
    }
  }

  walk(dir)
  return files.sort((a, b) => a.rel.localeCompare(b.rel))
}

export function collectPrecacheUrls(dir = outDir) {
  const urls = new Set()
  for (const file of listExportFiles(dir)) {
    for (const url of urlsForFile(file.rel)) urls.add(url)
  }
  urls.add("./offline.html")
  urls.add("./manifest.webmanifest")
  return [...urls].sort()
}

export function cacheVersionFor(files) {
  const hash = createHash("sha256")
  for (const file of files) {
    hash.update(file.rel)
    hash.update("\0")
    hash.update(String(file.size))
    hash.update("\0")
    hash.update(readFileSync(file.full))
  }
  return hash.digest("hex").slice(0, 12)
}

export function renderServiceWorker({ cacheName, precacheUrls }) {
  const template = readFileSync(templatePath, "utf8")
  return template
    .replace("__CACHE_NAME__", cacheName)
    .replace("__PRECACHE_URLS__", JSON.stringify(precacheUrls, null, 2))
}

function main() {
  if (!existsSync(outDir)) {
    throw new Error("Missing out/. Run `next build` before generating the service worker.")
  }

  const files = listExportFiles(outDir)
  const precacheUrls = collectPrecacheUrls(outDir)
  const version = cacheVersionFor(files)
  const cacheName = `pioniersplanner-${version}`
  const source = renderServiceWorker({ cacheName, precacheUrls })
  const dest = join(outDir, "sw.js")
  writeFileSync(dest, source)
  console.log(
    `Wrote ${dest} (${precacheUrls.length} precache URLs, ${files.length} files, cache ${cacheName})`,
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
