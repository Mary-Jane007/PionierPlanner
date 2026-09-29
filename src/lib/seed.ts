import { DEFAULT_REGULAR_HOURS, DEFAULT_SETTINGS } from "@/lib/constants"
import { emptyGrowth } from "@/lib/progress"
import type {
  AvailabilitySlot,
  CalendarEvent,
  Commitment,
  Experience,
  HistoricalMonth,
  UserProfile,
  UserSettings,
} from "@/types"

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

export function createDemoData(now = new Date()) {
  const year = now.getFullYear()
  const month = now.getMonth()

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
    events: [] as CalendarEvent[],
    availability: defaultAvailability(),
    commitments: [] as Commitment[],
    experiences: [] as Experience[],
    growth: emptyGrowth(),
    history: [] as HistoricalMonth[],
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
    growth: emptyGrowth(),
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
