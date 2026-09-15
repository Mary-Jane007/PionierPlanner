import { spawn } from "node:child_process"
import { createServer } from "node:http"
import { loadEnvFile } from "./load-env.mjs"
import { handleCloudRequest } from "./cloud-api.mjs"

loadEnvFile()

const appPort = Number(process.env.PORT || 4321)
const apiPort = Number(process.env.CLOUD_API_PORT || 4322)
const host = process.env.HOST || "0.0.0.0"
const apiUrl = process.env.NEXT_PUBLIC_API_URL || `http://127.0.0.1:${apiPort}`

createServer(async (req, res) => {
  if (await handleCloudRequest(req, res)) return
  res.writeHead(404, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ error: "not_found" }))
}).listen(apiPort, host, () => {
  console.log(`Cloud API http://127.0.0.1:${apiPort}/api/cloud/health`)
})

const child = spawn(
  "npx",
  ["next", "dev", "--hostname", "0.0.0.0", "--port", String(appPort)],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_API_URL: apiUrl,
    },
  }
)

child.on("exit", (code) => process.exit(code ?? 0))
