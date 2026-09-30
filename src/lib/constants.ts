import type {
  ActivityCategory,
  ColorTheme,
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
export const JW_ORG_BIBLE = "https://www.jw.org/nl/bibliotheek/bijbel/"
export const JW_ORG_LIBRARY = "https://www.jw.org/nl/bibliotheek/"
export const JW_ORG_WOL = "https://wol.jw.org/nl/"

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

export const COLOR_THEME_IDS: ColorTheme[] = ["earth", "forest", "blush"]

export const COLOR_THEME_META: Record<ColorTheme, string> = {
  earth: "#6A6A53",
  forest: "#29483F",
  blush: "#6E2C3A",
}

export const COLOR_THEME_SWATCHES: Record<ColorTheme, string[]> = {
  earth: ["#6A6A53", "#9B9879", "#4D342D", "#EDE7DB", "#DDCCB7"],
  forest: ["#29483F", "#708579", "#C68F68", "#F7F5EF", "#FFFFFF"],
  blush: ["#6E2C3A", "#F3E6D8", "#CAA697", "#E8D5C4"],
}

export const SURFACE_TONES = ["primary", "sage", "warm", "accent"] as const

export function surfaceClass(index: number) {
  return `surface-${SURFACE_TONES[index % SURFACE_TONES.length]}`
}

export function surfaceClassFromKey(key: string) {
  let n = 0
  for (let i = 0; i < key.length; i += 1) n += key.charCodeAt(i) * (i + 1)
  return surfaceClass(n)
}

export const DEFAULT_SETTINGS: UserSettings = {
  language: "nl",
  timezone: "Europe/Amsterdam",
  theme: "system",
  colorTheme: "earth",
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
export const SAVE_LOGIN_KEY = "pioniersplanner-save-login"
export const CLOUD_TOKEN_KEY = "pioniersplanner-cloud-token"
