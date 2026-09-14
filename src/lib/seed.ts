import { addDays, getISODay, startOfMonth } from "date-fns"
import { DEFAULT_REGULAR_HOURS, DEFAULT_SETTINGS } from "@/lib/constants"
import { isoDate, minutesBetween } from "@/lib/dates"
import type {
  AvailabilitySlot,
  CalendarEvent,
  Commitment,
  Experience,
  HistoricalMonth,
  UserProfile,
  UserSettings,
} from "@/types"

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function event(partial: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt" | "durationMinutes"> & { id?: string }): CalendarEvent {
  const now = new Date().toISOString()
  return {
    id: partial.id ?? uid("evt"),
    createdAt: now,
    updatedAt: now,
    durationMinutes: minutesBetween(partial.startTime, partial.endTime),
    ...partial,
  }
}

export function defaultAvailability(): AvailabilitySlot[] {
  return [
    { weekday: 1, parts: ["evening"] },
    { weekday: 2, parts: ["evening"] },
    { weekday: 3, parts: ["morning", "afternoon", "evening"] },
    { weekday: 4, parts: ["morning", "afternoon"] },
    { weekday: 5, parts: ["morning", "afternoon", "evening"] },
    { weekday: 6, parts: ["morning", "afternoon"] },
    { weekday: 7, parts: ["afternoon"] },
  ]
}

export function demoCommitments(): Commitment[] {
  return [
    {
      id: uid("com"),
      title: "Deeltijdwerk",
      type: "work",
      weekday: 1,
      date: null,
      startTime: "09:00",
      endTime: "16:00",
    },
    {
      id: uid("com"),
      title: "Deeltijdwerk",
      type: "work",
      weekday: 2,
      date: null,
      startTime: "09:00",
      endTime: "16:00",
    },
    {
      id: uid("com"),
      title: "Doordeweekse vergadering",
      type: "meeting",
      weekday: 4,
      date: null,
      startTime: "19:30",
      endTime: "21:15",
    },
    {
      id: uid("com"),
      title: "Weekendvergadering",
      type: "meeting",
      weekday: 7,
      date: null,
      startTime: "10:00",
      endTime: "12:00",
    },
  ]
}

export function createDemoData(now = new Date()) {
  const year = now.getFullYear()
  const month = now.getMonth()
  const start = startOfMonth(now)
  const events: CalendarEvent[] = []
  const commitments = demoCommitments()

  for (const day of Array.from({ length: 28 }, (_, index) => addDays(start, index))) {
    if (day.getMonth() !== month) continue
    const weekday = getISODay(day)
    const date = isoDate(day)
    const isPast = day < addDays(now, 0) && isoDate(day) < isoDate(now)
    const isToday = isoDate(day) === isoDate(now)

    if (weekday === 1 || weekday === 2) {
      events.push(
        event({
          title: "Deeltijdwerk",
          category: "work",
          date,
          startTime: "09:00",
          endTime: "16:00",
          status: isPast || isToday ? "completed" : "planned",
        })
      )
    }
    if (weekday === 4) {
      events.push(
        event({
          title: "Doordeweekse vergadering",
          category: "meeting",
          date,
          startTime: "19:30",
          endTime: "21:15",
          status: isPast ? "completed" : "planned",
        })
      )
    }
    if (weekday === 7) {
      events.push(
        event({
          title: "Weekendvergadering",
          category: "meeting",
          date,
          startTime: "10:00",
          endTime: "12:00",
          status: isPast ? "completed" : "planned",
        })
      )
    }
  }

  const servicePlan: {
    offset: number
    start: string
    end: string
    type: CalendarEvent["serviceType"]
    companion?: string
    location?: string
  }[] = [
    { offset: 0, start: "18:30", end: "20:00", type: "informal" },
    { offset: 1, start: "18:30", end: "20:30", type: "phone" },
    { offset: 2, start: "09:30", end: "12:00", type: "public", location: "Winkelcentrum" },
    { offset: 4, start: "09:00", end: "13:00", type: "house_to_house", companion: "Eva" },
    { offset: 5, start: "13:30", end: "16:00", type: "return_visit", companion: "Eva" },
    { offset: 7, start: "18:00", end: "20:00", type: "letters" },
    { offset: 9, start: "09:00", end: "11:30", type: "house_to_house" },
    { offset: 11, start: "09:00", end: "13:00", type: "house_to_house", companion: "Noah" },
    { offset: 12, start: "13:30", end: "16:00", type: "bible_study" },
    { offset: 14, start: "18:30", end: "20:00", type: "informal" },
    { offset: 16, start: "09:30", end: "12:00", type: "public" },
    { offset: 18, start: "09:00", end: "13:00", type: "house_to_house", companion: "Eva" },
    { offset: 19, start: "13:30", end: "15:30", type: "return_visit" },
    { offset: 21, start: "18:00", end: "20:00", type: "phone" },
    { offset: 23, start: "09:00", end: "12:00", type: "house_to_house" },
  ]

  for (const item of servicePlan) {
    const day = addDays(start, item.offset)
    if (day.getMonth() !== month) continue
    const date = isoDate(day)
    const past = date < isoDate(now)
    events.push(
      event({
        title: "Velddienst",
        category: "field_service",
        date,
        startTime: item.start,
        endTime: item.end,
        serviceType: item.type,
        companion: item.companion,
        location: item.location,
        status: past ? "completed" : "planned",
      })
    )
  }

  const today = isoDate(now)
  const hasTodayService = events.some(
    (item) => item.date === today && item.category === "field_service"
  )
  if (!hasTodayService && getISODay(now) !== 1 && getISODay(now) !== 2) {
    events.push(
      event({
        title: "Velddienst",
        category: "field_service",
        date: today,
        startTime: "18:30",
        endTime: "20:00",
        serviceType: "informal",
        status: "planned",
      })
    )
  }

  const experiences: Experience[] = [
    {
      id: uid("exp"),
      title: "Een onverwacht gesprek",
      date: isoDate(addDays(now, -3)),
      category: "informal",
      text: "Bij de bushalte begon iemand zelf over hoe zwaar de week was. We lazen samen een korte bemoedigende tekst. Het gesprek duurde maar tien minuten, maar voelde oprecht.",
      learned: "Ik hoef niet alles te zeggen. Luisteren opende de deur.",
      tags: ["bemoediging", "informeel"],
      favorite: true,
      visibility: "private",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uid("exp"),
      title: "Nabezoek met ruimte",
      date: isoDate(addDays(now, -8)),
      category: "return_visit",
      text: "We hadden afgesproken om kort langs te gaan. De bewoner had weinig tijd, maar wilde volgende week wél een hoofdstuk lezen.",
      learned: "Korte, warme vervolgen werken beter dan een te vol programma.",
      tags: ["nabezoek"],
      favorite: false,
      visibility: "private",
      followUpDate: isoDate(addDays(now, 4)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  const history: HistoricalMonth[] = Array.from({ length: month }, (_, index) => ({
    year,
    month: index,
    completedHours: [42, 50, 48, 45, 51, 47, 49, 46, 50, 44, 48][index] ?? 46,
    sessions: [18, 22, 20, 19, 23, 21, 20, 19, 22, 18, 21][index] ?? 20,
    longestSessionMinutes: [210, 240, 180, 200, 240, 190, 220, 180, 240, 200, 210][index] ?? 200,
    busiestWeekday: 6,
  }))

  const profile: UserProfile = {
    id: "demo-user",
    email: "demo@pioniersplanner.app",
    name: "Marisol",
    createdAt: `${year}-01-12T09:00:00.000Z`,
  }

  return {
    profile,
    pioneerType: "regular" as const,
    customMonthlyHours: DEFAULT_REGULAR_HOURS,
    events,
    availability: defaultAvailability(),
    commitments,
    experiences,
    history,
    settings: {
      ...DEFAULT_SETTINGS,
      sessionPreferences: ["weekends", "mornings", "flexible"],
      preferredSessionHours: 2,
      planningStyle: "even",
    } satisfies UserSettings,
    monthlyGoals: [
      {
        year,
        month,
        pioneerType: "regular" as const,
        targetHours: DEFAULT_REGULAR_HOURS,
      },
    ],
  }
}

export function emptyUserData(profile: UserProfile) {
  return {
    profile,
    pioneerType: "regular" as const,
    customMonthlyHours: DEFAULT_REGULAR_HOURS,
    events: [] as CalendarEvent[],
    availability: defaultAvailability(),
    commitments: [] as Commitment[],
    experiences: [] as Experience[],
    history: [] as HistoricalMonth[],
    settings: DEFAULT_SETTINGS,
    monthlyGoals: [
      {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        pioneerType: "regular" as const,
        targetHours: DEFAULT_REGULAR_HOURS,
      },
    ],
  }
}
