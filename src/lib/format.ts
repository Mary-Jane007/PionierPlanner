import type { LocaleCode } from "@/types"

export function hoursFromMinutes(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100
}

export function formatHoursField(hours: number, lang: LocaleCode = "nl"): string {
  const rounded = Math.round(hours * 100) / 100
  if (!Number.isFinite(rounded) || rounded <= 0) return ""
  const text = Number.isInteger(rounded) ? String(rounded) : String(rounded)
  return lang === "en" ? text : text.replace(".", ",")
}

export function parseHoursInput(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed || /[.,]$/.test(trimmed)) return null
  const clock = trimmed.match(/^(\d{1,2}):(\d{1,2})$/)
  if (clock) {
    const hours = Number(clock[1])
    const minutes = Number(clock[2])
    if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes >= 60) return null
    const total = hours + minutes / 60
    if (total <= 0 || total > 16) return null
    return total
  }
  const numeric = Number(trimmed.replace(",", ".").replace(/[^\d.-]/g, ""))
  if (!Number.isFinite(numeric) || numeric <= 0 || numeric > 16) return null
  return numeric
}

export function formatHoursShort(hours: number, lang: LocaleCode = "nl"): string {
  const rounded = Math.round(hours * 100) / 100
  if (Number.isInteger(rounded)) return `${rounded}u`
  const whole = Math.floor(rounded)
  const minutes = Math.round((rounded - whole) * 60)
  if (whole === 0) return `${minutes}m`
  if (lang === "en") return `${whole}h ${minutes}m`
  return `${whole}u ${minutes}`
}

export function formatHoursLong(hours: number, lang: LocaleCode = "nl"): string {
  const rounded = Math.round(hours * 100) / 100
  const whole = Math.floor(rounded)
  const minutes = Math.round((rounded - whole) * 60)
  if (lang === "en") {
    if (minutes === 0) return whole === 1 ? "1 hour" : `${whole} hours`
    if (whole === 0) return `${minutes} min`
    return `${whole} hr ${minutes} min`
  }
  if (minutes === 0) return whole === 1 ? "1 uur" : `${whole} uur`
  if (whole === 0) return `${minutes} min`
  return `${whole} uur ${minutes} min`
}

export function formatDecimal(value: number, lang: LocaleCode = "nl"): string {
  const rounded = Math.round(value * 10) / 10
  const str = rounded.toFixed(rounded % 1 === 0 ? 0 : 1)
  if (lang === "en") return str
  return str.replace(".", ",")
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
