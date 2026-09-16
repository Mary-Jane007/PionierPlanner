import type {
  ActivityCategory,
  PioneerProfileConfig,
  UserSettings,
} from "@/types"

export const APP_NAME = "Pioniersplanner"
export const APP_SUBTITLE = "Plan je tijd. Houd je voortgang bij. Geniet van je dienst."

export const DEFAULT_PIONEER_PROFILES: PioneerProfileConfig[] = [
  { id: "regular", monthlyHours: 50 },
  { id: "auxiliary", monthlyHours: 30 },
  { id: "custom", monthlyHours: null },
]

export const DEFAULT_REGULAR_HOURS = 50
export const DEFAULT_AUXILIARY_HOURS = 30
export const DEFAULT_CUSTOM_HOURS = 40
export const ANNUAL_REFERENCE_HOURS = 600

export const JW_ORG_HOME = "https://www.jw.org/nl/"
export const JW_ORG_PIONEERS =
  "https://www.jw.org/nl/jehovahs-getuigen/vragen/wie-zijn-pioniers/"
export const JW_ORG_MINISTRY =
  "https://www.jw.org/nl/jehovahs-getuigen/activiteiten/"

export const DAY_PART_WINDOWS = {
  morning: { start: "09:00", end: "12:00" },
  afternoon: { start: "13:00", end: "17:00" },
  evening: { start: "18:00", end: "21:00" },
} as const

export const CATEGORY_ORDER: ActivityCategory[] = [
  "field_service",
  "work",
  "meeting",
  "personal",
  "rest",
  "other",
]

export const DEFAULT_SETTINGS: UserSettings = {
  language: "nl",
  timezone: "Europe/Amsterdam",
  theme: "system",
  highContrast: false,
  notifications: {
    tomorrowReminder: true,
    todayHours: true,
    monthlyRemaining: true,
    planningUpdate: true,
  },
  planningStyle: "even",
  sessionPreferences: ["flexible"],
  preferredSessionHours: 2,
  maxSessionHours: 4,
}

export const STORAGE_KEY = "pioniersplanner-v1"
export const ACCOUNTS_KEY = "pioniersplanner-accounts"
export const LAST_EMAIL_KEY = "pioniersplanner-last-email"
export const CLOUD_TOKEN_KEY = "pioniersplanner-cloud-token"
