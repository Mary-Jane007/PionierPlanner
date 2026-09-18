import { createReadStream, existsSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { extname, join, normalize, relative, resolve, sep } from "node:path"
import { loadEnvFile } from "./load-env.mjs"
import { handleCloudRequest } from "./cloud-api.mjs"

loadEnvFile()

const root = resolve(process.cwd(), "out")
const port = Number(process.env.PORT || 4321)
const host = process.env.HOST || "0.0.0.0"

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".apk": "application/vnd.android.package-archive",
  ".zip": "application/zip",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
}

function safeFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0] || "/")
  let relativePath = decoded.replace(/^\/+/, "")
  if (relativePath.endsWith("/")) relativePath += "index.html"
  if (!relativePath) relativePath = "index.html"

  const full = resolve(root, relativePath)
  const rel = relative(root, full)
  if (rel.startsWith("..") || rel.includes(`..${sep}`) || normalize(rel).startsWith("..")) {
    return null
  }
  return full
}

function send(res, status, headers, body) {
  res.writeHead(status, headers)
  res.end(body)
}

if (!existsSync(root)) {
  console.error("Missing out/. Run `npm run build` first.")
  process.exit(1)
}

createServer(async (req, res) => {
  if (await handleCloudRequest(req, res)) return

  const urlPath = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`).pathname
  let file = safeFile(urlPath)

  if (file && !existsSync(file) && !extname(file)) {
    const asDir = safeFile(`${urlPath.replace(/\/?$/, "/")}`)
    if (asDir && existsSync(asDir)) file = asDir
  }

  if (!file || !existsSync(file) || statSync(file).isDirectory()) {
    const notFound = join(root, "404.html")
    if (existsSync(notFound)) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" })
      createReadStream(notFound).pipe(res)
      return
    }
    send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not found")
    return
  }

  const type = MIME[extname(file).toLowerCase()] || "application/octet-stream"
  const headers = { "Content-Type": type }
  const base = file.split(sep).at(-1)
  if (base === "sw.js" || base === "manifest.webmanifest") {
    headers["Cache-Control"] = "no-cache"
  }
  if (extname(file).toLowerCase() === ".apk") {
    headers["Content-Type"] = "application/vnd.android.package-archive"
    headers["Content-Disposition"] = 'attachment; filename="pioniersplanner.apk"'
    headers["Content-Length"] = String(statSync(file).size)
  }
  if (extname(file).toLowerCase() === ".zip") {
    headers["Content-Disposition"] = 'attachment; filename="pioniersplanner-android.zip"'
  }

  res.writeHead(200, headers)
  createReadStream(file).pipe(res)
}).listen(port, host, () => {
  console.log(`Pioniersplanner on http://127.0.0.1:${port}/`)
})
