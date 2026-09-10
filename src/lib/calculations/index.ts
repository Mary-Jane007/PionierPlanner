import type {
  ActivityCategory,
  CalendarEvent,
  HistoricalMonth,
  PioneerTypeId,
} from "@/types"
import { hoursFromMinutes } from "@/lib/format"
import {
  combineDateTime,
  daysLeftCount,
  isoDate,
  isoWeekday,
  monthDays,
  remainingDaysInMonth,
  weekDays,
} from "@/lib/dates"
import { DEFAULT_AUXILIARY_HOURS, DEFAULT_REGULAR_HOURS } from "@/lib/constants"

export function resolveTargetHours(
  pioneerType: PioneerTypeId,
  customHours: number,
  monthlyGoalHours?: number
): number {
  if (monthlyGoalHours && monthlyGoalHours > 0) return monthlyGoalHours
  if (pioneerType === "regular") return DEFAULT_REGULAR_HOURS
  if (pioneerType === "auxiliary") return DEFAULT_AUXILIARY_HOURS
  return customHours
}

export function isFieldService(event: CalendarEvent): boolean {
  return event.category === "field_service"
}

export function eventsInMonth(
  events: CalendarEvent[],
  year: number,
  month: number
): CalendarEvent[] {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`
  return events.filter((event) => event.date.startsWith(prefix))
}

export function calculateCompletedHours(
  events: CalendarEvent[],
  year: number,
  month: number
): number {
  return eventsInMonth(events, year, month)
    .filter((event) => isFieldService(event) && event.status === "completed")
    .reduce((sum, event) => sum + hoursFromMinutes(event.durationMinutes), 0)
}

export function calculatePlannedHours(
  events: CalendarEvent[],
  year: number,
  month: number
): number {
  return eventsInMonth(events, year, month)
    .filter((event) => isFieldService(event) && event.status === "planned")
    .reduce((sum, event) => sum + hoursFromMinutes(event.durationMinutes), 0)
}

export function calculateCancelledHours(
  events: CalendarEvent[],
  year: number,
  month: number
): number {
  return eventsInMonth(events, year, month)
    .filter((event) => isFieldService(event) && event.status === "cancelled")
    .reduce((sum, event) => sum + hoursFromMinutes(event.durationMinutes), 0)
}

export function calculateRemainingHours(
  target: number,
  completed: number
): number {
  return Math.max(0, Math.round((target - completed) * 100) / 100)
}

export function calculateProgressPercentage(
  completed: number,
  target: number
): number {
  if (target <= 0) return 0
  return Math.min(100, Math.round((completed / target) * 1000) / 10)
}

export function calculateWeeklyAverage(
  events: CalendarEvent[],
  year: number,
  month: number,
  now: Date
): number {
  const completed = calculateCompletedHours(events, year, month)
  const day = now.getFullYear() === year && now.getMonth() === month ? now.getDate() : 28
  const weeks = Math.max(1, day / 7)
  return Math.round((completed / weeks) * 10) / 10
}

export function calculateRequiredWeeklyAverage(
  remainingHours: number,
  daysRemaining: number
): number {
  if (daysRemaining <= 0) return remainingHours
  const weeks = Math.max(1, daysRemaining / 7)
  return Math.round((remainingHours / weeks) * 10) / 10
}

export function calculateRequiredDailyAverage(
  remainingHours: number,
  daysRemaining: number
): number {
  if (daysRemaining <= 0) return remainingHours
  return Math.round((remainingHours / daysRemaining) * 10) / 10
}

export function calculateProjectedTotal(
  completed: number,
  planned: number
): number {
  return Math.round((completed + planned) * 10) / 10
}

export function calculateAverageSession(
  events: CalendarEvent[],
  year: number,
  month: number
): number {
  const sessions = eventsInMonth(events, year, month).filter(
    (event) => isFieldService(event) && event.status === "completed"
  )
  if (sessions.length === 0) return 0
  const total = sessions.reduce(
    (sum, event) => sum + hoursFromMinutes(event.durationMinutes),
    0
  )
  return Math.round((total / sessions.length) * 100) / 100
}

export function calculateHoursForDay(
  events: CalendarEvent[],
  date: string,
  statuses: CalendarEvent["status"][] = ["planned", "completed"]
): number {
  return events
    .filter(
      (event) =>
        event.date === date &&
        isFieldService(event) &&
        statuses.includes(event.status)
    )
    .reduce((sum, event) => sum + hoursFromMinutes(event.durationMinutes), 0)
}

export function calculateWeekHours(
  events: CalendarEvent[],
  anchor: Date,
  statuses: CalendarEvent["status"][] = ["planned", "completed"]
): number {
  return weekDays(anchor).reduce(
    (sum, day) => sum + calculateHoursForDay(events, isoDate(day), statuses),
    0
  )
}

export function nextActivity(
  events: CalendarEvent[],
  from: Date
): CalendarEvent | undefined {
  const now = from.getTime()
  return events
    .filter((event) => event.status === "planned")
    .map((event) => ({
      event,
      time: combineDateTime(event.date, event.startTime).getTime(),
    }))
    .filter((item) => item.time >= now - 30 * 60 * 1000)
    .sort((a, b) => a.time - b.time)[0]?.event
}

export function detectScheduleConflict(
  events: CalendarEvent[],
  candidate: Pick<CalendarEvent, "date" | "startTime" | "endTime" | "id">
): CalendarEvent | undefined {
  const start = combineDateTime(candidate.date, candidate.startTime).getTime()
  const end = combineDateTime(candidate.date, candidate.endTime).getTime()
  return events.find((event) => {
    if (event.id === candidate.id) return false
    if (event.date !== candidate.date) return false
    if (event.status === "cancelled") return false
    const existingStart = combineDateTime(event.date, event.startTime).getTime()
    const existingEnd = combineDateTime(event.date, event.endTime).getTime()
    return start < existingEnd && end > existingStart
  })
}

export type PlanningHealth = "balanced" | "full" | "space" | "adjust"

export function calculatePlanningHealth(input: {
  target: number
  completed: number
  planned: number
  remainingDays: number
}): PlanningHealth {
  const projected = input.completed + input.planned
  const remaining = Math.max(0, input.target - input.completed)
  if (projected + 0.5 < input.target && input.remainingDays <= 10) return "adjust"
  if (projected + 1 < input.target) return "space"
  if (input.planned > remaining * 0.9 && remaining > 8) return "full"
  return "balanced"
}

export interface MonthSnapshot {
  year: number
  month: number
  target: number
  completed: number
  planned: number
  cancelled: number
  remaining: number
  stillToPlan: number
  percent: number
  projected: number
  daysRemaining: number
  weeklyAverage: number
  requiredWeekly: number
  requiredDaily: number
  todayHours: number
  weekHours: number
  weekCompleted: number
  averageSession: number
  sessionsCompleted: number
  health: PlanningHealth
  next?: CalendarEvent
}

export function calculateMonthSnapshot(input: {
  events: CalendarEvent[]
  year: number
  month: number
  target: number
  now: Date
}): MonthSnapshot {
  const { events, year, month, target, now } = input
  const completed = calculateCompletedHours(events, year, month)
  const planned = calculatePlannedHours(events, year, month)
  const cancelled = calculateCancelledHours(events, year, month)
  const remaining = calculateRemainingHours(target, completed)
  const daysRemaining = daysLeftCount(now)
  const today = isoDate(now)
  const monthEvents = eventsInMonth(events, year, month).filter(
    (event) => isFieldService(event) && event.status === "completed"
  )

  return {
    year,
    month,
    target,
    completed,
    planned,
    cancelled,
    remaining,
    stillToPlan: Math.max(0, Math.round((remaining - planned) * 10) / 10),
    percent: calculateProgressPercentage(completed, target),
    projected: calculateProjectedTotal(completed, planned),
    daysRemaining,
    weeklyAverage: calculateWeeklyAverage(events, year, month, now),
    requiredWeekly: calculateRequiredWeeklyAverage(remaining, daysRemaining),
    requiredDaily: calculateRequiredDailyAverage(
      Math.max(0, remaining - planned),
      remainingDaysInMonth(now).length
    ),
    todayHours: calculateHoursForDay(events, today),
    weekHours: calculateWeekHours(events, now),
    weekCompleted: calculateWeekHours(events, now, ["completed"]),
    averageSession: calculateAverageSession(events, year, month),
    sessionsCompleted: monthEvents.length,
    health: calculatePlanningHealth({
      target,
      completed,
      planned,
      remainingDays: daysRemaining,
    }),
    next: nextActivity(events, now),
  }
}

export function hoursByWeek(
  events: CalendarEvent[],
  year: number,
  month: number
): { label: string; planned: number; completed: number }[] {
  const days = monthDays(year, month)
  const buckets = new Map<
    number,
    { planned: number; completed: number; start: Date }
  >()
  for (const day of days) {
    const week = Math.ceil(day.getDate() / 7)
    const current = buckets.get(week) ?? {
      planned: 0,
      completed: 0,
      start: day,
    }
    const date = isoDate(day)
    current.planned += calculateHoursForDay(events, date, ["planned"])
    current.completed += calculateHoursForDay(events, date, ["completed"])
    buckets.set(week, current)
  }
  return [...buckets.entries()].map(([week, value]) => ({
    label: `W${week}`,
    planned: Math.round(value.planned * 10) / 10,
    completed: Math.round(value.completed * 10) / 10,
  }))
}

export function hoursByCategory(
  events: CalendarEvent[],
  year: number,
  month: number
): { category: ActivityCategory; hours: number }[] {
  const map = new Map<ActivityCategory, number>()
  for (const event of eventsInMonth(events, year, month)) {
    if (event.status === "cancelled") continue
    map.set(
      event.category,
      (map.get(event.category) ?? 0) + hoursFromMinutes(event.durationMinutes)
    )
  }
  return [...map.entries()].map(([category, hours]) => ({
    category,
    hours: Math.round(hours * 10) / 10,
  }))
}

export function yearOverview(
  events: CalendarEvent[],
  history: HistoricalMonth[],
  year: number,
  currentMonth: number,
  currentCompleted: number
): { month: number; hours: number }[] {
  return Array.from({ length: 12 }, (_, month) => {
    if (month === currentMonth) {
      return { month, hours: Math.round(currentCompleted * 10) / 10 }
    }
    const historical = history.find(
      (item) => item.year === year && item.month === month
    )
    if (historical) return { month, hours: historical.completedHours }
    if (month > currentMonth) return { month, hours: 0 }
    const fromEvents = calculateCompletedHours(events, year, month)
    return { month, hours: fromEvents }
  })
}

export function personalInsights(
  events: CalendarEvent[],
  history: HistoricalMonth[],
  now: Date
): {
  longestSessionMinutes: number
  busiestMonth: number | null
  busiestWeekday: number | null
  averageSessionMinutes: number
} {
  const service = events.filter(
    (event) => isFieldService(event) && event.status === "completed"
  )
  const longestEvent = service.reduce(
    (max, event) => Math.max(max, event.durationMinutes),
    0
  )
  const longestHistory = history.reduce(
    (max, item) => Math.max(max, item.longestSessionMinutes),
    0
  )
  const weekdayHours = new Array(8).fill(0)
  for (const event of service) {
    weekdayHours[isoWeekday(new Date(`${event.date}T12:00:00`))] +=
      event.durationMinutes
  }
  const busiestWeekday =
    weekdayHours.indexOf(Math.max(...weekdayHours.slice(1))) || null
  const busiestHistorical = [...history].sort(
    (a, b) => b.completedHours - a.completedHours
  )[0]
  const currentMonthHours = calculateCompletedHours(
    events,
    now.getFullYear(),
    now.getMonth()
  )
  const busiestMonth =
    busiestHistorical && busiestHistorical.completedHours > currentMonthHours
      ? busiestHistorical.month
      : now.getMonth()
  const totalMinutes = service.reduce(
    (sum, event) => sum + event.durationMinutes,
    0
  )
  return {
    longestSessionMinutes: Math.max(longestEvent, longestHistory),
    busiestMonth: service.length || history.length ? busiestMonth : null,
    busiestWeekday: service.length ? busiestWeekday : null,
    averageSessionMinutes: service.length
      ? Math.round(totalMinutes / service.length)
      : 0,
  }
}
