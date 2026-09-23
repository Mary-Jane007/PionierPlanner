import {
  addDays,
  addMinutes,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getISODay,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfDay,
} from "date-fns"
import { enUS, es, nl, type Locale } from "date-fns/locale"
import { DEFAULT_TIMEZONE, resolveTimeZone, zonedDateParts } from "@/lib/timezones"
import type { LocaleCode } from "@/types"

export function dateLocale(lang: LocaleCode): Locale {
  if (lang === "en") return enUS
  if (lang === "es") return es
  return nl
}

export function isoDate(date: Date): string {
  if (Number.isNaN(date.getTime())) return format(new Date(), "yyyy-MM-dd")
  return format(date, "yyyy-MM-dd")
}

export function parseDate(value: string): Date {
  return parseISO(value)
}

export function isValidIsoDate(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = parseISO(value)
  return !Number.isNaN(parsed.getTime())
}

export function combineDateTime(date: string, time: string): Date {
  return parseISO(`${date}T${time}:00`)
}

export function minutesBetween(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number)
  const [eh, em] = endTime.split(":").map(Number)
  return eh * 60 + em - (sh * 60 + sm)
}

export function addHoursToTime(time: string, hours: number): string {
  const base = parseISO(`2026-01-01T${time}:00`)
  return format(addMinutes(base, Math.round(hours * 60)), "HH:mm")
}

export function endTimeFromDuration(startTime: string, hours: number): string {
  const [startHour, startMinute] = startTime.split(":").map(Number)
  if (!Number.isFinite(startHour) || !Number.isFinite(startMinute)) return startTime
  const startMinutes = startHour * 60 + startMinute
  const added = Math.max(1, Math.round(hours * 60))
  const endMinutes = Math.min(23 * 60 + 59, startMinutes + added)
  const endHour = Math.floor(endMinutes / 60)
  const endMinute = endMinutes % 60
  return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`
}

export function monthDays(year: number, month: number): Date[] {
  const start = new Date(year, month, 1)
  return eachDayOfInterval({ start, end: endOfMonth(start) })
}

export function calendarGrid(year: number, month: number): Date[] {
  const start = startOfWeek(startOfMonth(new Date(year, month, 1)), {
    weekStartsOn: 1,
  })
  const end = endOfWeek(endOfMonth(new Date(year, month, 1)), {
    weekStartsOn: 1,
  })
  return eachDayOfInterval({ start, end })
}

export function weekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn: 1 })
  return eachDayOfInterval({
    start,
    end: endOfWeek(anchor, { weekStartsOn: 1 }),
  })
}

export function remainingDaysInMonth(from: Date): Date[] {
  const start = startOfDay(from)
  const end = endOfMonth(from)
  if (isBefore(end, start)) return []
  return eachDayOfInterval({ start, end })
}

export function daysLeftCount(from: Date): number {
  return Math.max(0, differenceInCalendarDays(endOfMonth(from), from) + 1)
}

export function isoWeekday(date: Date): number {
  return getISODay(date)
}

export function formatMonthTitle(date: Date, lang: LocaleCode): string {
  return format(date, "LLLL yyyy", { locale: dateLocale(lang) })
}

export function formatWeekdayShort(date: Date, lang: LocaleCode): string {
  return format(date, "EEEEEE", { locale: dateLocale(lang) })
}

export function formatWeekdayLong(date: Date, lang: LocaleCode): string {
  return format(date, "EEEE", { locale: dateLocale(lang) })
}

export function formatDayNumber(date: Date): string {
  return format(date, "d")
}

export function formatHumanDate(date: Date, lang: LocaleCode): string {
  return format(date, "d MMMM yyyy", { locale: dateLocale(lang) })
}

export function formatTimeRange(start: string, end: string): string {
  return `${start}–${end}`
}

export function greetingKey(date = new Date(), timeZone = DEFAULT_TIMEZONE): "morning" | "afternoon" | "evening" {
  const hour = zonedDateParts(date, resolveTimeZone(timeZone)).hour
  if (hour < 12) return "morning"
  if (hour < 18) return "afternoon"
  return "evening"
}

export function isSameMonthDate(a: Date, b: Date): boolean {
  return isSameMonth(a, b)
}

export { isToday, isSameDay, addDays, startOfMonth, endOfMonth, startOfDay }
