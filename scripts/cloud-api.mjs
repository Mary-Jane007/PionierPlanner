import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"
import pg from "pg"

const scrypt = promisify(scryptCb)
const { Pool } = pg

const TOKEN_DAYS = 180
const MAX_BODY = 1_500_000

let pool
let ready = false

function authSecret() {
  if (!process.env.AUTH_SECRET) {
    process.env.AUTH_SECRET = randomBytes(32).toString("hex")
    console.warn("AUTH_SECRET missing; generated an ephemeral secret (sessions reset on restart).")
  }
  return process.env.AUTH_SECRET
}

function databaseUrl() {
  const raw = process.env.DATABASE_URL || ""
  return raw.replace(/&channel_binding=require/g, "")
}

export function cloudConfigured() {
  return Boolean(process.env.DATABASE_URL)
}

function getPool() {
  if (!pool) {
    const connectionString = databaseUrl()
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set")
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: true },
      max: 5,
    })
  }
  return pool
}

export async function ensureSchema() {
  if (ready) return
  const db = getPool()
  await db.query(`
    CREATE TABLE IF NOT EXISTS pp_accounts (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS pp_planner_state (
      user_id UUID PRIMARY KEY REFERENCES pp_accounts(id) ON DELETE CASCADE,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `)
  await db.query(`ALTER TABLE pp_accounts ADD COLUMN IF NOT EXISTS google_sub TEXT`)
  await db.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS pp_accounts_google_sub_idx ON pp_accounts (google_sub) WHERE google_sub IS NOT NULL`
  )
  ready = true
}

async function hashPassword(password) {
  const salt = randomBytes(16)
  const hash = await scrypt(password, salt, 32)
  return `scrypt:${salt.toString("hex")}:${Buffer.from(hash).toString("hex")}`
}

async function verifyPassword(password, stored) {
  const [scheme, saltHex, hashHex] = String(stored).split(":")
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), 32)
  const expected = Buffer.from(hashHex, "hex")
  if (expected.length !== actual.length) return false
  return timingSafeEqual(expected, actual)
}

function signToken(userId) {
  const exp = Date.now() + TOKEN_DAYS * 24 * 60 * 60 * 1000
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp })).toString("base64url")
  const sig = createHmac("sha256", authSecret()).update(payload).digest("base64url")
  return `${payload}.${sig}`
}

function readToken(header) {
  const raw = String(header || "")
  const token = raw.startsWith("Bearer ") ? raw.slice(7).trim() : ""
  if (!token || !token.includes(".")) return null
  const [payload, sig] = token.split(".")
  const expected = createHmac("sha256", authSecret()).update(payload).digest("base64url")
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
    if (!data?.sub || typeof data.exp !== "number" || data.exp < Date.now()) return null
    return data.sub
  } catch {
    return null
  }
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
}

function send(res, status, body) {
  cors(res)
  const json = JSON.stringify(body)
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  })
  res.end(json)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on("data", (chunk) => {
      size += chunk.length
      if (size > MAX_BODY) {
        reject(Object.assign(new Error("too_large"), { code: "too_large" }))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on("end", () => {
      if (!chunks.length) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"))
      } catch {
        reject(Object.assign(new Error("invalid_json"), { code: "invalid_json" }))
      }
    })
    req.on("error", reject)
  })
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase()
}

function validEmail(email) {
  return email.includes("@") && email.includes(".") && email.length <= 254
}

async function googleFromCredential(credential) {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  )
  if (!response.ok) return null
  let me
  try {
    me = await response.json()
  } catch {
    return null
  }
  const expectedAud = String(process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim()
  if (expectedAud && String(me.aud || "") !== expectedAud) return null
  const iss = String(me.iss || "")
  if (iss !== "https://accounts.google.com" && iss !== "accounts.google.com") return null
  if (me.email_verified === false || me.email_verified === "false") return null
  return me
}

async function googleUserinfo(accessToken) {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) return null
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function snapshotFor(userId) {
  const snapshot = await getPool().query(
    "SELECT payload, updated_at FROM pp_planner_state WHERE user_id = $1",
    [userId]
  )
  return snapshot.rowCount ? snapshot.rows[0].payload : null
}

function profileRow(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  }
}

async function requireUser(req, res) {
  const userId = readToken(req.headers.authorization)
  if (!userId) {
    send(res, 401, { error: "unauthorized" })
    return null
  }
  const found = await getPool().query("SELECT id, email, name, created_at FROM pp_accounts WHERE id = $1", [userId])
  if (!found.rowCount) {
    send(res, 401, { error: "unauthorized" })
    return null
  }
  return found.rows[0]
}

export async function handleCloudRequest(req, res) {
  const host = req.headers.host || "127.0.0.1"
  const url = new URL(req.url || "/", `http://${host}`)
  if (!url.pathname.startsWith("/api/cloud")) return false

  if (req.method === "OPTIONS") {
    cors(res)
    res.writeHead(204)
    res.end()
    return true
  }

  const route = url.pathname.replace(/\/+$/, "") || "/"

  try {
    if (route === "/api/cloud/health" && req.method === "GET") {
      if (!cloudConfigured()) {
        send(res, 503, { ok: false, error: "not_configured" })
        return true
      }
      await ensureSchema()
      await getPool().query("SELECT 1")
      send(res, 200, { ok: true })
      return true
    }

    if (!cloudConfigured()) {
      send(res, 503, { error: "not_configured" })
      return true
    }
    await ensureSchema()

    if (route === "/api/cloud/register" && req.method === "POST") {
      const body = await readBody(req)
      const email = normalizeEmail(body.email)
      const password = String(body.password || "")
      const name = String(body.name || "")
        .trim()
        .slice(0, 80)
      if (!validEmail(email)) {
        send(res, 400, { error: "invalid" })
        return true
      }
      if (password.length < 6) {
        send(res, 400, { error: "weak" })
        return true
      }
      const exists = await getPool().query("SELECT id FROM pp_accounts WHERE email = $1", [email])
      if (exists.rowCount) {
        send(res, 409, { error: "exists" })
        return true
      }
      const id = crypto.randomUUID()
      const created = await getPool().query(
        `INSERT INTO pp_accounts (id, email, name, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, created_at`,
        [id, email, name || email.split("@")[0], await hashPassword(password)]
      )
      const profile = profileRow(created.rows[0])
      send(res, 201, { profile, token: signToken(profile.id) })
      return true
    }

    if (route === "/api/cloud/login" && req.method === "POST") {
      const body = await readBody(req)
      const email = normalizeEmail(body.email)
      const password = String(body.password || "")
      const found = await getPool().query(
        "SELECT id, email, name, password_hash, created_at FROM pp_accounts WHERE email = $1",
        [email]
      )
      if (!found.rowCount) {
        send(res, 401, { error: "missing" })
        return true
      }
      const row = found.rows[0]
      if (!(await verifyPassword(password, row.password_hash))) {
        send(res, 401, { error: "invalid" })
        return true
      }
      const snapshot = await getPool().query(
        "SELECT payload, updated_at FROM pp_planner_state WHERE user_id = $1",
        [row.id]
      )
      send(res, 200, {
        profile: profileRow(row),
        token: signToken(row.id),
        snapshot: snapshot.rowCount ? snapshot.rows[0].payload : null,
      })
      return true
    }

    if (route === "/api/cloud/google" && req.method === "POST") {
      const body = await readBody(req)
      const accessToken = String(body.accessToken || body.access_token || "").trim()
      const credential = String(body.credential || body.id_token || "").trim()
      const me = credential
        ? await googleFromCredential(credential)
        : accessToken
          ? await googleUserinfo(accessToken)
          : null
      const email = normalizeEmail(me?.email)
      const googleSub = String(me?.sub || "").trim()
      const name = String(me?.name || me?.given_name || "")
        .trim()
        .slice(0, 80)
      if (!googleSub || !validEmail(email) || email === "demo@pioniersplanner.app") {
        send(res, 401, { error: "invalid" })
        return true
      }

      let found = await getPool().query(
        "SELECT id, email, name, password_hash, created_at, google_sub FROM pp_accounts WHERE google_sub = $1",
        [googleSub]
      )
      let created = false
      if (!found.rowCount) {
        found = await getPool().query(
          "SELECT id, email, name, password_hash, created_at, google_sub FROM pp_accounts WHERE email = $1",
          [email]
        )
      }
      let row = found.rows[0]
      if (row?.google_sub && row.google_sub !== googleSub) {
        send(res, 401, { error: "invalid" })
        return true
      }
      if (!row) {
        const id = crypto.randomUUID()
        const inserted = await getPool().query(
          `INSERT INTO pp_accounts (id, email, name, password_hash, google_sub)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, email, name, created_at, google_sub`,
          [id, email, name || email.split("@")[0], `google:${googleSub}`, googleSub]
        )
        row = inserted.rows[0]
        created = true
      } else if (!row.google_sub || (name && row.name !== name)) {
        const updated = await getPool().query(
          `UPDATE pp_accounts
           SET google_sub = $1, name = COALESCE(NULLIF($2, ''), name)
           WHERE id = $3
           RETURNING id, email, name, created_at, google_sub`,
          [googleSub, name, row.id]
        )
        row = updated.rows[0]
      }

      send(res, 200, {
        profile: profileRow(row),
        token: signToken(row.id),
        snapshot: await snapshotFor(row.id),
        created,
        googleSub,
      })
      return true
    }

    if (route === "/api/cloud/me" && req.method === "GET") {
      const row = await requireUser(req, res)
      if (!row) return true
      send(res, 200, { profile: profileRow(row) })
      return true
    }

    if (route === "/api/cloud/data" && req.method === "GET") {
      const row = await requireUser(req, res)
      if (!row) return true
      const snapshot = await getPool().query(
        "SELECT payload, updated_at FROM pp_planner_state WHERE user_id = $1",
        [row.id]
      )
      send(res, 200, { snapshot: snapshot.rowCount ? snapshot.rows[0].payload : null })
      return true
    }

    if (route === "/api/cloud/data" && req.method === "PUT") {
      const row = await requireUser(req, res)
      if (!row) return true
      const body = await readBody(req)
      const payload = body?.snapshot
      if (!payload || typeof payload !== "object") {
        send(res, 400, { error: "invalid" })
        return true
      }
      await getPool().query(
        `INSERT INTO pp_planner_state (user_id, payload, updated_at)
         VALUES ($1, $2::jsonb, now())
         ON CONFLICT (user_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = now()`,
        [row.id, JSON.stringify(payload)]
      )
      send(res, 200, { ok: true })
      return true
    }

    if (route === "/api/cloud/email" && req.method === "POST") {
      const row = await requireUser(req, res)
      if (!row) return true
      const body = await readBody(req)
      const email = normalizeEmail(body.email)
      if (!validEmail(email)) {
        send(res, 400, { error: "invalid" })
        return true
      }
      const taken = await getPool().query("SELECT id FROM pp_accounts WHERE email = $1 AND id <> $2", [email, row.id])
      if (taken.rowCount) {
        send(res, 409, { error: "exists" })
        return true
      }
      const updated = await getPool().query(
        "UPDATE pp_accounts SET email = $1 WHERE id = $2 RETURNING id, email, name, created_at",
        [email, row.id]
      )
      send(res, 200, { profile: profileRow(updated.rows[0]) })
      return true
    }

    if (route === "/api/cloud/password" && req.method === "POST") {
      const row = await requireUser(req, res)
      if (!row) return true
      const body = await readBody(req)
      const currentPassword = String(body.currentPassword || "")
      const newPassword = String(body.newPassword || "")
      if (newPassword.length < 6) {
        send(res, 400, { error: "weak" })
        return true
      }
      const full = await getPool().query("SELECT password_hash FROM pp_accounts WHERE id = $1", [row.id])
      if (!(await verifyPassword(currentPassword, full.rows[0].password_hash))) {
        send(res, 401, { error: "invalid" })
        return true
      }
      await getPool().query("UPDATE pp_accounts SET password_hash = $1 WHERE id = $2", [
        await hashPassword(newPassword),
        row.id,
      ])
      send(res, 200, { ok: true })
      return true
    }

    if (route === "/api/cloud/account" && req.method === "DELETE") {
      const row = await requireUser(req, res)
      if (!row) return true
      await getPool().query("DELETE FROM pp_accounts WHERE id = $1", [row.id])
      send(res, 200, { ok: true })
      return true
    }

    send(res, 404, { error: "not_found" })
  } catch (error) {
    if (error?.code === "too_large") {
      send(res, 413, { error: "too_large" })
      return true
    }
    if (error?.code === "invalid_json") {
      send(res, 400, { error: "invalid" })
      return true
    }
    console.error("cloud api error", error)
    send(res, 500, { error: "server" })
  }
  return true
}
