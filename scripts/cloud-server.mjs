import { createServer } from "node:http"
import { loadEnvFile } from "./load-env.mjs"
import { handleCloudRequest } from "./cloud-api.mjs"

loadEnvFile()

const port = Number(process.env.CLOUD_API_PORT || 4322)
const host = process.env.HOST || "0.0.0.0"

createServer(async (req, res) => {
  if (await handleCloudRequest(req, res)) return
  res.writeHead(404, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ error: "not_found" }))
}).listen(port, host, () => {
  console.log(`Pioniersplanner cloud API on http://127.0.0.1:${port}/api/cloud/health`)
})
