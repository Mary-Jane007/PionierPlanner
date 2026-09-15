import { readFileSync } from "node:fs"
import { resolve } from "node:path"

/** Load .env without treating `&` in values as shell operators. */
export function loadEnvFile(file = resolve(process.cwd(), ".env")) {
  let text = ""
  try {
    text = readFileSync(file, "utf8")
  } catch {
    return
  }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith("#")) continue
    const index = line.indexOf("=")
    if (index <= 0) continue
    const key = line.slice(0, index).trim()
    let value = line.slice(index + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}
