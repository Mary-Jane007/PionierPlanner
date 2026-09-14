import type {
  AvailabilitySlot,
  CalendarEvent,
  Commitment,
  DayPart,
  PlanningStyle,
  SessionPreference,
  SuggestedBlock,
  SuggestedOption,
} from "@/types"
import { DAY_PART_WINDOWS } from "@/lib/constants"
import {
  addHoursToTime,
  combineDateTime,
  isoDate,
  isoWeekday,
  minutesBetween,
  remainingDaysInMonth,
} from "@/lib/dates"
import { detectScheduleConflict } from "@/lib/calculations"
import { hoursFromMinutes } from "@/lib/format"

export interface PlannerInput {
  targetHours: number
  completedHours: number
  events: CalendarEvent[]
  availability: AvailabilitySlot[]
  commitments: Commitment[]
  now: Date
  style: PlanningStyle
  preferences: SessionPreference[]
  preferredSessionHours: number
  maxSessionHours: number
  hoursNeeded?: number
}

interface FreeWindow {
  date: string
  weekday: number
  part: DayPart
  startTime: string
  endTime: string
  hours: number
  score: number
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function overlapMinutes(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): number {
  const start = Math.max(timeToMinutes(aStart), timeToMinutes(bStart))
  const end = Math.min(timeToMinutes(aEnd), timeToMinutes(bEnd))
  return Math.max(0, end - start)
}

function commitmentsForDate(commitments: Commitment[], date: Date): Commitment[] {
  const weekday = isoWeekday(date)
  const dateKey = isoDate(date)
  return commitments.filter(
    (item) => item.weekday === weekday || item.date === dateKey
  )
}

function subtractBusy(
  start: string,
  end: string,
  busy: { startTime: string; endTime: string }[]
): { startTime: string; endTime: string }[] {
  let windows = [{ startTime: start, endTime: end }]
  for (const block of busy) {
    windows = windows.flatMap((window) => {
      const overlap = overlapMinutes(
        window.startTime,
        window.endTime,
        block.startTime,
        block.endTime
      )
      if (overlap === 0) return [window]
      const pieces: { startTime: string; endTime: string }[] = []
      if (timeToMinutes(window.startTime) < timeToMinutes(block.startTime)) {
        pieces.push({
          startTime: window.startTime,
          endTime:
            timeToMinutes(block.startTime) < timeToMinutes(window.endTime)
              ? block.startTime
              : window.endTime,
        })
      }
      if (timeToMinutes(window.endTime) > timeToMinutes(block.endTime)) {
        pieces.push({
          startTime:
            timeToMinutes(block.endTime) > timeToMinutes(window.startTime)
              ? block.endTime
              : window.startTime,
          endTime: window.endTime,
        })
      }
      return pieces.filter(
        (piece) => minutesBetween(piece.startTime, piece.endTime) >= 45
      )
    })
  }
  return windows
}

function preferenceScore(
  weekday: number,
  part: DayPart,
  preferences: SessionPreference[],
  style: PlanningStyle
): number {
  let score = 10
  const isWeekend = weekday >= 6
  if (style === "weekend") score += isWeekend ? 8 : -3
  if (style === "weekdays") score += isWeekend ? -4 : 6
  if (style === "even") score += 2
  if (preferences.includes("weekends") && isWeekend) score += 5
  if (preferences.includes("mornings") && part === "morning") score += 4
  if (preferences.includes("afternoons") && part === "afternoon") score += 4
  if (preferences.includes("evenings") && part === "evening") score += 4
  if (preferences.includes("flexible")) score += 1
  return score
}

export function calculateAvailableWindows(input: PlannerInput): FreeWindow[] {
  const days = remainingDaysInMonth(input.now)
  const windows: FreeWindow[] = []
  for (const day of days) {
    const weekday = isoWeekday(day)
    const slot = input.availability.find((item) => item.weekday === weekday)
    if (!slot || slot.parts.length === 0) continue
    const date = isoDate(day)
    const dayEvents = input.events.filter(
      (event) => event.date === date && event.status !== "cancelled"
    )
    const dayCommitments = commitmentsForDate(input.commitments, day)
    const busy = [
      ...dayEvents.map((event) => ({
        startTime: event.startTime,
        endTime: event.endTime,
      })),
      ...dayCommitments.map((item) => ({
        startTime: item.startTime,
        endTime: item.endTime,
      })),
    ]
    for (const part of slot.parts) {
      const range = DAY_PART_WINDOWS[part]
      const free = subtractBusy(range.start, range.end, busy)
      for (const piece of free) {
        const hours = hoursFromMinutes(
          minutesBetween(piece.startTime, piece.endTime)
        )
        if (hours < 1) continue
        windows.push({
          date,
          weekday,
          part,
          startTime: piece.startTime,
          endTime: piece.endTime,
          hours,
          score: preferenceScore(weekday, part, input.preferences, input.style),
        })
      }
    }
  }
  return windows.sort((a, b) => b.score - a.score || a.date.localeCompare(b.date))
}

export function calculateAvailableHours(input: PlannerInput): number {
  return calculateAvailableWindows(input).reduce((sum, window) => sum + window.hours, 0)
}

function fillWindows(
  windows: FreeWindow[],
  hoursNeeded: number,
  preferredHours: number,
  maxHours: number,
  style: PlanningStyle
): SuggestedBlock[] {
  const remainingWindows = [...windows]
  if (style === "weekend") {
    remainingWindows.sort(
      (a, b) => Number(b.weekday >= 6) - Number(a.weekday >= 6) || b.score - a.score
    )
  } else if (style === "weekdays") {
    remainingWindows.sort(
      (a, b) => Number(a.weekday >= 6) - Number(b.weekday >= 6) || b.score - a.score
    )
  } else if (style === "even") {
    remainingWindows.sort((a, b) => a.date.localeCompare(b.date))
  }

  const usedDates = new Map<string, number>()
  const blocks: SuggestedBlock[] = []
  let remaining = hoursNeeded

  for (const window of remainingWindows) {
    if (remaining <= 0.4) break
    const already = usedDates.get(window.date) ?? 0
    if (already >= maxHours) continue
    const maxForDay = Math.min(window.hours, maxHours - already, remaining)
    if (maxForDay < 1) continue
    const desired = Math.min(preferredHours, maxForDay)
    const hours = Math.round(Math.max(1, desired) * 2) / 2
    const endTime = addHoursToTime(window.startTime, hours)
    if (timeToMinutes(endTime) > timeToMinutes(window.endTime)) continue
    blocks.push({
      date: window.date,
      startTime: window.startTime,
      endTime,
      hours,
      weekday: window.weekday,
    })
    usedDates.set(window.date, already + hours)
    remaining -= hours
  }

  return blocks.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
}

export function generateSuggestedSchedule(input: PlannerInput): SuggestedOption[] {
  const plannedFuture = input.events
    .filter(
      (event) =>
        event.category === "field_service" &&
        event.status === "planned" &&
        combineDateTime(event.date, event.endTime) >= input.now
    )
    .reduce((sum, event) => sum + hoursFromMinutes(event.durationMinutes), 0)
  const hoursNeeded =
    input.hoursNeeded ??
    Math.max(0, input.targetHours - input.completedHours - plannedFuture)
  const windows = calculateAvailableWindows(input)
  const preferred = input.preferences.includes("short")
    ? Math.min(1.5, input.preferredSessionHours)
    : input.preferences.includes("long")
      ? Math.max(3, input.preferredSessionHours)
      : input.preferredSessionHours

  const styles: { id: PlanningStyle; titleKey: string }[] = [
    { id: "even", titleKey: "planner.option.even" },
    { id: "weekend", titleKey: "planner.option.weekend" },
    { id: "flexible", titleKey: "planner.option.flexible" },
  ]

  return styles.map((style) => {
    const blocks = fillWindows(
      windows,
      hoursNeeded,
      style.id === "weekend" ? Math.min(input.maxSessionHours, preferred + 1) : preferred,
      input.maxSessionHours,
      style.id
    )
    const totalHours = Math.round(blocks.reduce((sum, block) => sum + block.hours, 0) * 10) / 10
    return {
      id: style.id,
      style: style.id,
      titleKey: style.titleKey,
      blocks,
      totalHours,
    }
  })
}

export function suggestWeekFill(
  input: PlannerInput,
  hoursNeeded: number
): SuggestedBlock[] {
  return generateSuggestedSchedule({ ...input, hoursNeeded, style: "even" })[0]
    ?.blocks ?? []
}

export function blocksToEvents(
  blocks: SuggestedBlock[],
  existing: CalendarEvent[]
): SuggestedBlock[] {
  return blocks.filter((block) => {
    const conflict = detectScheduleConflict(existing, {
      id: "preview",
      date: block.date,
      startTime: block.startTime,
      endTime: block.endTime,
    })
    return !conflict
  })
}
