import { formatHoursLong } from "@/lib/format"
import { calculateAverageSession } from "@/lib/calculations"
import { calculateBibleReadingProgress, calculateServiceYearProgress, calculateStudyFrequency } from "@/lib/progress/calculations"
import type { CalendarEvent, LocaleCode, MonthlyGoal, PioneerTypeId } from "@/types"
import type { Experience } from "@/types"
import type { GrowthState } from "@/types/growth"

export function generatePersonalInsights(input: {
  events: CalendarEvent[]
  growth: GrowthState
  experiences: Experience[]
  pioneerType: PioneerTypeId
  customHours: number
  monthlyGoals: MonthlyGoal[]
  lang: LocaleCode
  now?: Date
}): { key: string; vars?: Record<string, string | number> }[] {
  const now = input.now ?? new Date()
  const year = calculateServiceYearProgress({
    events: input.events,
    pioneerType: input.pioneerType,
    customHours: input.customHours,
    monthlyGoals: input.monthlyGoals,
    now,
  })
  const bible = calculateBibleReadingProgress(input.growth, now)
  const study = calculateStudyFrequency(input.growth, now)
  const monthExperiences = input.experiences.filter(
    (item) => item.date.startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`)
  ).length
  const avg = calculateAverageSession(input.events, now.getFullYear(), now.getMonth())
  const insights: { key: string; vars?: Record<string, string | number> }[] = []
  if (year.completed > 0) {
    insights.push({ key: "progress.insight.yearHours", vars: { n: year.completed } })
  }
  if (avg > 0) {
    insights.push({ key: "progress.insight.avgSession", vars: { n: formatHoursLong(avg, input.lang) } })
  }
  if (study.monthSessions > 0) {
    insights.push({ key: "progress.insight.studyMonth", vars: { n: study.monthSessions } })
  }
  if (study.mostlyEvening) {
    insights.push({ key: "progress.insight.studyEvening" })
  }
  if (bible.monthDays > 0) {
    insights.push({ key: "progress.insight.bibleMonth", vars: { n: bible.monthDays } })
  }
  if (monthExperiences > 0) {
    insights.push({ key: "progress.insight.experiences", vars: { n: monthExperiences } })
  }
  return insights.slice(0, 5)
}
