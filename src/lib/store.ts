"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type {
  ActivityCategory,
  AvailabilitySlot,
  CalendarEvent,
  Commitment,
  Experience,
  HistoricalMonth,
  MonthlyGoal,
  PioneerTypeId,
  PlanningStyle,
  SessionPreference,
  TimerState,
  UserAccount,
  UserProfile,
  UserSettings,
} from "@/types"
import { DEFAULT_REGULAR_HOURS, DEFAULT_SETTINGS, LAST_EMAIL_KEY, STORAGE_KEY } from "@/lib/constants"
import { detectScheduleConflict } from "@/lib/calculations"
import { minutesBetween } from "@/lib/dates"
import { createDemoData, emptyUserData } from "@/lib/seed"
import { rememberEmail, updateStoredAccountName, mergeStoredAccounts, readStoredAccounts } from "@/lib/auth"
import { clearCloudSession, type PlannerSnapshot } from "@/lib/cloud"
import { flushDurableStorage, removeDurable, zustandDurableStorage } from "@/lib/durable-storage"
import type { PioneerTip } from "@/lib/tips"

export type CalendarClearScope = "month" | "planned" | "all"

export interface AppState {
  hydrated: boolean
  user: UserProfile | null
  activeProfileId: string | null
  onboarded: boolean
  pioneerType: PioneerTypeId
  customMonthlyHours: number
  monthlyGoals: MonthlyGoal[]
  events: CalendarEvent[]
  availability: AvailabilitySlot[]
  commitments: Commitment[]
  experiences: Experience[]
  history: HistoricalMonth[]
  settings: UserSettings
  timer: TimerState
  hiddenCategories: ActivityCategory[]
  customTips: PioneerTip[]
  setHydrated: (value: boolean) => void
  login: (
    profile: UserProfile,
    options?: { demo?: boolean; fresh?: boolean; snapshot?: PlannerSnapshot | null }
  ) => void
  applyPlannerSnapshot: (snapshot: PlannerSnapshot, profile?: UserProfile) => void
  exportSnapshot: () => PlannerSnapshot
  logout: () => void
  completeOnboarding: () => void
  updateProfile: (patch: Partial<UserProfile>) => void
  setPioneerGoal: (type: PioneerTypeId, hours: number) => void
  setSettings: (patch: Partial<UserSettings>) => void
  setAvailability: (slots: AvailabilitySlot[]) => void
  setCommitments: (items: Commitment[]) => void
  addCommitment: (item: Commitment) => void
  removeCommitment: (id: string) => void
  upsertEvent: (event: CalendarEvent) => void
  deleteEvent: (id: string) => void
  moveEvent: (id: string, date: string, startTime?: string, endTime?: string) => void
  setEventStatus: (id: string, status: CalendarEvent["status"]) => void
  upsertExperience: (experience: Experience) => void
  deleteExperience: (id: string) => void
  toggleFavorite: (id: string) => void
  toggleCategory: (category: ActivityCategory) => void
  upsertCustomTip: (tip: PioneerTip) => void
  deleteCustomTip: (id: string) => void
  startTimer: () => void
  pauseTimer: () => void
  tickTimer: () => void
  stopTimer: () => { elapsedMs: number }
  resetTimer: () => void
  applySuggestedBlocks: (
    blocks: { date: string; startTime: string; endTime: string }[]
  ) => { added: number; skipped: number }
  clearCalendar: (scope: CalendarClearScope, monthDate?: Date) => void
  exportData: () => string
  importBackup: (json: string) => { ok: true; signedIn: boolean } | { error: "invalid" }
  deleteAccountLocal: () => void
}

const idleTimer: TimerState = {
  running: false,
  paused: false,
  startedAt: null,
  elapsedMs: 0,
  category: "field_service",
}

function currentGoalPatch(
  type: PioneerTypeId,
  hours: number
): MonthlyGoal {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    pioneerType: type,
    targetHours: hours,
  }
}

type PlannerBits = {
  events?: CalendarEvent[]
  experiences?: Experience[]
  commitments?: Commitment[]
  history?: HistoricalMonth[]
  customTips?: PioneerTip[]
}

export function hasSavedPlanner(state: PlannerBits) {
  return (
    (state.events?.length ?? 0) +
      (state.experiences?.length ?? 0) +
      (state.commitments?.length ?? 0) +
      (state.history?.length ?? 0) +
      (state.customTips?.length ?? 0) >
    0
  )
}

function mergeById<T extends { id: string; updatedAt?: string; createdAt?: string }>(
  local: T[],
  remote: T[]
) {
  const map = new Map<string, T>()
  for (const item of local) map.set(item.id, item)
  for (const item of remote) {
    const previous = map.get(item.id)
    if (!previous) {
      map.set(item.id, item)
      continue
    }
    const remoteStamp = item.updatedAt ?? item.createdAt ?? ""
    const localStamp = previous.updatedAt ?? previous.createdAt ?? ""
    if (remoteStamp > localStamp) map.set(item.id, item)
  }
  return [...map.values()]
}

function mergeHistory(local: HistoricalMonth[], remote: HistoricalMonth[]) {
  const map = new Map<string, HistoricalMonth>()
  for (const item of [...remote, ...local]) {
    map.set(`${item.year}-${item.month}`, item)
  }
  return [...map.values()]
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      user: null,
      activeProfileId: null,
      onboarded: false,
      pioneerType: "regular",
      customMonthlyHours: DEFAULT_REGULAR_HOURS,
      monthlyGoals: [],
      events: [],
      availability: [],
      commitments: [],
      experiences: [],
      history: [],
      settings: DEFAULT_SETTINGS,
      timer: idleTimer,
      hiddenCategories: [],
      customTips: [],
      setHydrated: (value) => set({ hydrated: value }),
      login: (profile, options) => {
        if (profile.email) rememberEmail(profile.email)
        const persistSoon = () => {
          queueMicrotask(() => {
            void flushDurableStorage()
          })
        }
        const keepPlanner = hasSavedPlanner(get())

        if (options?.demo && !keepPlanner) {
          const data = createDemoData()
          set({
            user: {
              ...data.profile,
              name: profile.name,
              email: profile.email,
              id: profile.id,
              createdAt: profile.createdAt,
            },
            activeProfileId: profile.id,
            onboarded: true,
            pioneerType: data.pioneerType,
            customMonthlyHours: data.customMonthlyHours,
            monthlyGoals: data.monthlyGoals,
            events: data.events,
            availability: data.availability,
            commitments: data.commitments,
            experiences: data.experiences,
            history: data.history,
            settings: { ...DEFAULT_SETTINGS, ...data.settings } satisfies UserSettings,
            timer: idleTimer,
          })
          persistSoon()
          return
        }
        if (options?.snapshot && !keepPlanner) {
          get().applyPlannerSnapshot(options.snapshot, profile)
          persistSoon()
          return
        }
        if (options?.fresh && !keepPlanner) {
          const empty = emptyUserData(profile)
          set({
            ...empty,
            user: profile,
            activeProfileId: profile.id,
            onboarded: false,
            timer: idleTimer,
          })
          persistSoon()
          return
        }
        if (!keepPlanner && get().activeProfileId && get().activeProfileId !== profile.id) {
          const empty = emptyUserData(profile)
          set({
            ...empty,
            user: profile,
            activeProfileId: profile.id,
            onboarded: false,
            timer: idleTimer,
          })
          persistSoon()
          return
        }
        if (options?.snapshot && keepPlanner) {
          get().applyPlannerSnapshot(options.snapshot, profile)
          persistSoon()
          return
        }
        set({
          user: profile,
          activeProfileId: profile.id,
          onboarded: keepPlanner ? true : get().onboarded,
          timer: idleTimer,
        })
        persistSoon()
      },
      logout: () => {
        clearCloudSession()
        set({
          user: null,
          timer: idleTimer,
        })
        void flushDurableStorage()
      },
      completeOnboarding: () => set({ onboarded: true }),
      updateProfile: (patch) => {
        const user = get().user
        if (!user) return
        const next = { ...user, ...patch }
        set({ user: next })
        if (patch.name !== undefined) updateStoredAccountName(user.id, next.name)
        if (patch.email !== undefined && next.email) rememberEmail(next.email)
      },
      setPioneerGoal: (type, hours) => {
        const now = new Date()
        const monthlyGoals = get().monthlyGoals.filter(
          (goal) => !(goal.year === now.getFullYear() && goal.month === now.getMonth())
        )
        set({
          pioneerType: type,
          customMonthlyHours: hours,
          monthlyGoals: [...monthlyGoals, currentGoalPatch(type, hours)],
        })
      },
      setSettings: (patch) =>
        set({ settings: { ...get().settings, ...patch } }),
      setAvailability: (slots) => set({ availability: slots }),
      setCommitments: (items) => set({ commitments: items }),
      addCommitment: (item) =>
        set({ commitments: [...get().commitments, item] }),
      removeCommitment: (id) =>
        set({ commitments: get().commitments.filter((item) => item.id !== id) }),
      upsertEvent: (event) => {
        const events = get().events
        const index = events.findIndex((item) => item.id === event.id)
        if (index === -1) set({ events: [...events, event] })
        else {
          const next = [...events]
          next[index] = event
          set({ events: next })
        }
      },
      deleteEvent: (id) =>
        set({ events: get().events.filter((item) => item.id !== id) }),
      moveEvent: (id, date, startTime, endTime) => {
        const events = get().events.map((item) => {
          if (item.id !== id) return item
          const nextStart = startTime ?? item.startTime
          const nextEnd = endTime ?? item.endTime
          return {
            ...item,
            date,
            startTime: nextStart,
            endTime: nextEnd,
            durationMinutes: minutesBetween(nextStart, nextEnd),
            updatedAt: new Date().toISOString(),
          }
        })
        set({ events })
      },
      setEventStatus: (id, status) =>
        set({
          events: get().events.map((item) =>
            item.id === id
              ? { ...item, status, updatedAt: new Date().toISOString() }
              : item
          ),
        }),
      upsertExperience: (experience) => {
        const experiences = get().experiences
        const index = experiences.findIndex((item) => item.id === experience.id)
        if (index === -1) set({ experiences: [experience, ...experiences] })
        else {
          const next = [...experiences]
          next[index] = experience
          set({ experiences: next })
        }
      },
      deleteExperience: (id) =>
        set({
          experiences: get().experiences.filter((item) => item.id !== id),
        }),
      toggleFavorite: (id) =>
        set({
          experiences: get().experiences.map((item) =>
            item.id === id ? { ...item, favorite: !item.favorite } : item
          ),
        }),
      toggleCategory: (category) => {
        const hidden = get().hiddenCategories
        set({
          hiddenCategories: hidden.includes(category)
            ? hidden.filter((item) => item !== category)
            : [...hidden, category],
        })
      },
      upsertCustomTip: (tip) => {
        const tips = get().customTips
        const index = tips.findIndex((item) => item.id === tip.id)
        if (index === -1) set({ customTips: [tip, ...tips] })
        else {
          const next = [...tips]
          next[index] = tip
          set({ customTips: next })
        }
      },
      deleteCustomTip: (id) =>
        set({ customTips: get().customTips.filter((item) => item.id !== id) }),
      startTimer: () =>
        set({
          timer: {
            running: true,
            paused: false,
            startedAt: new Date().toISOString(),
            elapsedMs: get().timer.elapsedMs,
            category: "field_service",
          },
        }),
      pauseTimer: () => {
        const timer = get().timer
        if (!timer.running || timer.paused || !timer.startedAt) {
          set({ timer: { ...timer, paused: false, running: true, startedAt: new Date().toISOString() } })
          return
        }
        const extra = Date.now() - new Date(timer.startedAt).getTime()
        set({
          timer: {
            ...timer,
            running: true,
            paused: true,
            elapsedMs: timer.elapsedMs + extra,
            startedAt: null,
          },
        })
      },
      tickTimer: () => {
        const timer = get().timer
        if (!timer.running || timer.paused || !timer.startedAt) return
      },
      stopTimer: () => {
        const timer = get().timer
        let elapsed = timer.elapsedMs
        if (timer.running && !timer.paused && timer.startedAt) {
          elapsed += Date.now() - new Date(timer.startedAt).getTime()
        }
        set({ timer: idleTimer })
        return { elapsedMs: elapsed }
      },
      resetTimer: () => set({ timer: idleTimer }),
      applySuggestedBlocks: (blocks) => {
        const now = new Date().toISOString()
        const current = get().events
        const extra: CalendarEvent[] = []
        let skipped = 0
        for (const block of blocks) {
          const candidate: CalendarEvent = {
            id: crypto.randomUUID(),
            title: "Velddienst",
            category: "field_service",
            date: block.date,
            startTime: block.startTime,
            endTime: block.endTime,
            durationMinutes: minutesBetween(block.startTime, block.endTime),
            status: "planned",
            serviceType: "house_to_house",
            createdAt: now,
            updatedAt: now,
          }
          if (detectScheduleConflict([...current, ...extra], candidate)) {
            skipped += 1
            continue
          }
          extra.push(candidate)
        }
        if (extra.length) set({ events: [...current, ...extra] })
        return { added: extra.length, skipped }
      },
      clearCalendar: (scope, monthDate = new Date()) => {
        if (scope === "all") {
          set({ events: [] })
          return
        }
        const year = monthDate.getFullYear()
        const month = monthDate.getMonth()
        const prefix = `${year}-${String(month + 1).padStart(2, "0")}`
        set({
          events: get().events.filter((event) => {
            if (!event.date.startsWith(prefix)) return true
            if (scope === "month") return false
            return event.status === "completed"
          }),
        })
      },
      exportData: () => {
        const state = get()
        return JSON.stringify(
          {
            version: 1,
            exportedAt: new Date().toISOString(),
            accounts: readStoredAccounts(),
            user: state.user,
            onboarded: state.onboarded,
            pioneerType: state.pioneerType,
            customMonthlyHours: state.customMonthlyHours,
            monthlyGoals: state.monthlyGoals,
            events: state.events,
            availability: state.availability,
            commitments: state.commitments,
            experiences: state.experiences,
            history: state.history,
            settings: state.settings,
            hiddenCategories: state.hiddenCategories,
            customTips: state.customTips,
          },
          null,
          2
        )
      },
      importBackup: (json) => {
        let parsed: Record<string, unknown>
        try {
          parsed = JSON.parse(json) as Record<string, unknown>
        } catch {
          return { error: "invalid" }
        }
        const data = parsed
        const incomingAccounts = Array.isArray(data.accounts) ? (data.accounts as UserAccount[]) : []
        const user = (data.user ?? null) as UserProfile | null
        if (!user && incomingAccounts.length === 0 && !Array.isArray(data.events)) {
          return { error: "invalid" }
        }
        mergeStoredAccounts(incomingAccounts)
        const pioneerType = (data.pioneerType as PioneerTypeId | undefined) ?? "regular"
        const events = Array.isArray(data.events) ? (data.events as CalendarEvent[]) : []
        const commitments = Array.isArray(data.commitments) ? (data.commitments as Commitment[]) : []
        const experiences = Array.isArray(data.experiences) ? (data.experiences as Experience[]) : []
        const history = Array.isArray(data.history) ? (data.history as HistoricalMonth[]) : []
        const customTips = Array.isArray(data.customTips) ? (data.customTips as PioneerTip[]) : []
        set({
          user,
          activeProfileId: user?.id ?? null,
          onboarded:
            Boolean(data.onboarded ?? user) ||
            hasSavedPlanner({ events, commitments, experiences, history, customTips }),
          pioneerType,
          customMonthlyHours:
            typeof data.customMonthlyHours === "number" ? data.customMonthlyHours : DEFAULT_REGULAR_HOURS,
          monthlyGoals: Array.isArray(data.monthlyGoals) ? data.monthlyGoals : [],
          events,
          availability: Array.isArray(data.availability) ? data.availability : [],
          commitments,
          experiences,
          history,
          settings: { ...DEFAULT_SETTINGS, ...(data.settings as UserSettings | undefined) },
          hiddenCategories: Array.isArray(data.hiddenCategories) ? data.hiddenCategories : [],
          customTips,
          timer: idleTimer,
          hydrated: true,
        })
        if (user?.email) rememberEmail(user.email)
        void flushDurableStorage()
        return { ok: true, signedIn: Boolean(user) }
      },
      exportSnapshot: () => {
        const state = get()
        return {
          version: 1 as const,
          updatedAt: new Date().toISOString(),
          user: state.user,
          onboarded: state.onboarded,
          pioneerType: state.pioneerType,
          customMonthlyHours: state.customMonthlyHours,
          monthlyGoals: state.monthlyGoals,
          events: state.events,
          availability: state.availability,
          commitments: state.commitments,
          experiences: state.experiences,
          history: state.history,
          settings: state.settings,
          hiddenCategories: state.hiddenCategories,
          customTips: state.customTips,
        }
      },
      applyPlannerSnapshot: (snapshot, profile) => {
        const user = profile ?? (snapshot.user as UserProfile | null)
        if (!user) return
        const local = get()
        const keep = hasSavedPlanner(local)
        const remoteHas = hasSavedPlanner(snapshot)
        const pioneerType = (snapshot.pioneerType as PioneerTypeId | undefined) ?? local.pioneerType ?? "regular"
        if (keep && remoteHas) {
          set({
            user,
            activeProfileId: user.id,
            onboarded: Boolean(snapshot.onboarded ?? local.onboarded ?? user),
            pioneerType,
            customMonthlyHours:
              typeof snapshot.customMonthlyHours === "number"
                ? snapshot.customMonthlyHours
                : local.customMonthlyHours,
            monthlyGoals:
              Array.isArray(snapshot.monthlyGoals) && snapshot.monthlyGoals.length > 0
                ? snapshot.monthlyGoals
                : local.monthlyGoals,
            events: mergeById(local.events, Array.isArray(snapshot.events) ? snapshot.events : []),
            availability:
              Array.isArray(snapshot.availability) && snapshot.availability.length > 0
                ? snapshot.availability
                : local.availability,
            commitments: mergeById(
              local.commitments,
              Array.isArray(snapshot.commitments) ? snapshot.commitments : []
            ),
            experiences: mergeById(
              local.experiences,
              Array.isArray(snapshot.experiences) ? snapshot.experiences : []
            ),
            history: mergeHistory(
              local.history,
              Array.isArray(snapshot.history) ? snapshot.history : []
            ),
            settings: { ...DEFAULT_SETTINGS, ...local.settings, ...(snapshot.settings as UserSettings | undefined) },
            hiddenCategories: local.hiddenCategories,
            customTips: mergeById(
              local.customTips,
              Array.isArray(snapshot.customTips) ? snapshot.customTips : []
            ),
            timer: idleTimer,
          })
        } else if (keep && !remoteHas) {
          set({
            user,
            activeProfileId: user.id,
            onboarded: Boolean(local.onboarded ?? user),
            timer: idleTimer,
          })
        } else {
          set({
            user,
            activeProfileId: user.id,
            onboarded: Boolean(snapshot.onboarded ?? user),
            pioneerType,
            customMonthlyHours:
              typeof snapshot.customMonthlyHours === "number"
                ? snapshot.customMonthlyHours
                : DEFAULT_REGULAR_HOURS,
            monthlyGoals: Array.isArray(snapshot.monthlyGoals) ? snapshot.monthlyGoals : [],
            events: Array.isArray(snapshot.events) ? snapshot.events : [],
            availability: Array.isArray(snapshot.availability) ? snapshot.availability : [],
            commitments: Array.isArray(snapshot.commitments) ? snapshot.commitments : [],
            experiences: Array.isArray(snapshot.experiences) ? snapshot.experiences : [],
            history: Array.isArray(snapshot.history) ? snapshot.history : [],
            settings: { ...DEFAULT_SETTINGS, ...(snapshot.settings as UserSettings | undefined) },
            hiddenCategories: Array.isArray(snapshot.hiddenCategories) ? snapshot.hiddenCategories : [],
            customTips: Array.isArray(snapshot.customTips) ? snapshot.customTips : [],
            timer: idleTimer,
          })
        }
        if (user.email) rememberEmail(user.email)
      },
      deleteAccountLocal: () => {
        removeDurable(LAST_EMAIL_KEY)
        clearCloudSession()
        set({
          user: null,
          activeProfileId: null,
          onboarded: false,
          pioneerType: "regular",
          customMonthlyHours: DEFAULT_REGULAR_HOURS,
          monthlyGoals: [],
          events: [],
          availability: [],
          commitments: [],
          experiences: [],
          history: [],
          settings: DEFAULT_SETTINGS,
          timer: idleTimer,
          hiddenCategories: [],
        })
      },
    }),
    {
      name: STORAGE_KEY,
      skipHydration: true,
      storage: createJSONStorage(() => zustandDurableStorage),
      partialize: (state) => ({
        user: state.user,
        activeProfileId: state.activeProfileId,
        onboarded: state.onboarded,
        pioneerType: state.pioneerType,
        customMonthlyHours: state.customMonthlyHours,
        monthlyGoals: state.monthlyGoals,
        events: state.events,
        availability: state.availability,
        commitments: state.commitments,
        experiences: state.experiences,
        history: state.history,
        settings: state.settings,
        hiddenCategories: state.hiddenCategories,
        customTips: state.customTips,
      }),
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<AppState>
        if (current.user && !stored.user) {
          return current
        }
        return { ...current, ...stored }
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)

export function useCurrentTarget(): number {
  const pioneerType = useAppStore((s) => s.pioneerType)
  const custom = useAppStore((s) => s.customMonthlyHours)
  const monthlyGoals = useAppStore((s) => s.monthlyGoals)
  const now = new Date()
  const current = monthlyGoals.find(
    (goal) => goal.year === now.getFullYear() && goal.month === now.getMonth()
  )
  if (current) return current.targetHours
  if (pioneerType === "auxiliary") return 30
  if (pioneerType === "custom") return custom
  return 50
}

export function useSessionPreferences(): SessionPreference[] {
  return useAppStore((s) => s.settings.sessionPreferences)
}

export function usePlanningStyle(): PlanningStyle {
  return useAppStore((s) => s.settings.planningStyle)
}
