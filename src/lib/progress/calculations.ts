import {
  calculateCompletedHours,
  calculatePlannedHours,
  calculateProgressPercentage,
  countCompletedSessions,
  resolveTargetHours,
} from "@/lib/calculations"
import { hoursFromMinutes } from "@/lib/format"
import { daysInMonth, inServiceYear, monthKey, serviceYearFor, serviceYearMonths } from "@/lib/progress/year"
import { goalProgress } from "@/lib/progress/state"
import type { CalendarEvent, MonthlyGoal, PioneerTypeId } from "@/types"
import type { GrowthState } from "@/types/growth"

export function monthTarget(
  year: number,
  month: number,
  pioneerType: PioneerTypeId,
  customHours: number,
  monthlyGoals: MonthlyGoal[]
) {
  const goal = monthlyGoals.find((item) => item.year === year && item.month === month)
  return resolveTargetHours(pioneerType, customHours, goal?.targetHours)
}

export function calculateServiceYearProgress(input: {
  events: CalendarEvent[]
  pioneerType: PioneerTypeId
  customHours: number
  monthlyGoals: MonthlyGoal[]
  now?: Date
}) {
  const now = input.now ?? new Date()
  const year = serviceYearFor(now)
  const months = serviceYearMonths(year.startYear).map(({ year: y, month }) => {
    const target = monthTarget(y, month, input.pioneerType, input.customHours, input.monthlyGoals)
    const completed = calculateCompletedHours(input.events, y, month)
    const planned = calculatePlannedHours(input.events, y, month)
    return {
      year: y,
      month,
      key: monthKey(y, month),
      target,
      completed,
      planned,
      remaining: Math.max(0, Math.round((target - completed) * 10) / 10),
      percent: calculateProgressPercentage(completed, target),
    }
  })
  const target = months.reduce((sum, item) => sum + item.target, 0)
  const completed = months.reduce((sum, item) => sum + item.completed, 0)
  const planned = months.reduce((sum, item) => sum + item.planned, 0)
  const sessions = input.events.filter(
    (event) =>
      event.category === "field_service" &&
      event.status === "completed" &&
      inServiceYear(event.date, year)
  )
  const sessionMinutes = sessions.reduce((sum, event) => sum + event.durationMinutes, 0)
  return {
    year,
    months,
    target,
    completed: Math.round(completed * 10) / 10,
    planned: Math.round(planned * 10) / 10,
    remaining: Math.max(0, Math.round((target - completed) * 10) / 10),
    percent: calculateProgressPercentage(completed, target),
    sessions: sessions.length,
    averageSessionHours: sessions.length ? hoursFromMinutes(Math.round(sessionMinutes / sessions.length)) : 0,
  }
}

export function calculateBibleReadingProgress(growth: GrowthState, now = new Date()) {
  const year = now.getFullYear()
  const month = now.getMonth()
  const prefix = monthKey(year, month)
  const monthEntries = growth.bibleEntries.filter((entry) => entry.date.startsWith(prefix) && entry.completed)
  const yearEntries = growth.bibleEntries.filter((entry) => entry.date.startsWith(`${year}-`) && entry.completed)
  const days = daysInMonth(year, month)
  const uniqueMonthDays = new Set(monthEntries.map((entry) => entry.date))
  const uniqueYearDays = new Set(yearEntries.map((entry) => entry.date))
  const latest = [...growth.bibleEntries].sort((a, b) => b.date.localeCompare(a.date))[0]
  return {
    monthDays: uniqueMonthDays.size,
    monthTarget: days,
    yearDays: uniqueYearDays.size,
    latest,
    current: latest ? `${latest.book} ${latest.chapterStart}${latest.chapterEnd && latest.chapterEnd !== latest.chapterStart ? `–${latest.chapterEnd}` : ""}`.trim() : "",
  }
}

export function calculateStudyFrequency(growth: GrowthState, now = new Date()) {
  const prefix = monthKey(now.getFullYear(), now.getMonth())
  const monthSessions = growth.studySessions.filter((session) => session.date.startsWith(prefix))
  const eveningCount = monthSessions.filter((session) => {
    const hour = session.createdAt ? new Date(session.createdAt).getHours() : 19
    return hour >= 18
  }).length
  return {
    monthSessions: monthSessions.length,
    yearSessions: growth.studySessions.length,
    projects: growth.studyProjects.length,
    mostlyEvening: monthSessions.length > 0 && eveningCount >= monthSessions.length / 2,
  }
}

export function calculateGoalTotals(growth: GrowthState) {
  const active = growth.goals.filter((goal) => goal.status === "active")
  const completed = growth.goals.filter((goal) => goal.status === "completed")
  const steps = active.flatMap((goal) => goal.steps)
  const done = steps.filter((step) => step.completed).length
  return {
    active: active.length,
    completed: completed.length,
    started: growth.goals.length,
    stepDone: done,
    stepTotal: steps.length,
    progress: steps.length ? Math.round((done / steps.length) * 100) : 0,
    details: active.map((goal) => ({ goal, ...goalProgress(goal) })),
  }
}

export function calculateServiceYearSummary(input: {
  events: CalendarEvent[]
  growth: GrowthState
  experiences: { date: string }[]
  pioneerType: PioneerTypeId
  customHours: number
  monthlyGoals: MonthlyGoal[]
  now?: Date
}) {
  const now = input.now ?? new Date()
  const year = calculateServiceYearProgress({
    events: input.events,
    pioneerType: input.pioneerType,
    customHours: input.customHours,
    monthlyGoals: input.monthlyGoals,
    now,
  })
  return {
    ...year,
    bible: calculateBibleReadingProgress(input.growth, now),
    study: calculateStudyFrequency(input.growth),
    goals: calculateGoalTotals(input.growth),
    experiences: input.experiences.filter((item) => inServiceYear(item.date, year.year)).length,
  }
}

export function calculateMonthlySummary(input: {
  events: CalendarEvent[]
  growth: GrowthState
  experiences: { date: string }[]
  pioneerType: PioneerTypeId
  customHours: number
  monthlyGoals: MonthlyGoal[]
  year: number
  month: number
}) {
  const target = monthTarget(input.year, input.month, input.pioneerType, input.customHours, input.monthlyGoals)
  const completed = calculateCompletedHours(input.events, input.year, input.month)
  const prefix = monthKey(input.year, input.month)
  const bibleDays = new Set(
    input.growth.bibleEntries.filter((entry) => entry.date.startsWith(prefix) && entry.completed).map((entry) => entry.date)
  ).size
  const studySessions = input.growth.studySessions.filter((session) => session.date.startsWith(prefix)).length
  const experiences = input.experiences.filter((item) => item.date.startsWith(prefix)).length
  const reflection = input.growth.monthlyReflections.find(
    (item) => item.year === input.year && item.month === input.month
  )
  return {
    target,
    completed,
    planned: calculatePlannedHours(input.events, input.year, input.month),
    percent: calculateProgressPercentage(completed, target),
    bibleDays,
    studySessions,
    experiences,
    activeGoals: input.growth.goals.filter((goal) => goal.status === "active").length,
    completedGoals: input.growth.goals.filter(
      (goal) => goal.status === "completed" && goal.updatedAt.slice(0, 7) === prefix
    ).length,
    reflection,
    sessions: countCompletedSessions(
      input.events.filter((event) => event.date.startsWith(prefix)),
    ),
  }
}
