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
  UserProfile,
  UserSettings,
} from "@/types"
import { DEFAULT_REGULAR_HOURS, DEFAULT_SETTINGS, STORAGE_KEY } from "@/lib/constants"
import { minutesBetween } from "@/lib/dates"
import { createDemoData, emptyUserData } from "@/lib/seed"

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
  setHydrated: (value: boolean) => void
  login: (profile: UserProfile, options?: { demo?: boolean; fresh?: boolean }) => void
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
  startTimer: () => void
  pauseTimer: () => void
  tickTimer: () => void
  stopTimer: () => { elapsedMs: number }
  resetTimer: () => void
  applySuggestedBlocks: (
    blocks: { date: string; startTime: string; endTime: string }[]
  ) => void
  exportData: () => string
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
      setHydrated: (value) => set({ hydrated: value }),
      login: (profile, options) => {
        if (options?.demo) {
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
          return
        }
        if (options?.fresh) {
          const empty = emptyUserData(profile)
          set({
            ...empty,
            user: profile,
            activeProfileId: profile.id,
            onboarded: false,
            timer: idleTimer,
          })
          return
        }
        if (get().activeProfileId !== profile.id) {
          const empty = emptyUserData(profile)
          set({
            ...empty,
            user: profile,
            activeProfileId: profile.id,
            onboarded: false,
            timer: idleTimer,
          })
          return
        }
        set({
          user: profile,
          timer: idleTimer,
        })
      },
      logout: () =>
        set({
          user: null,
          timer: idleTimer,
        }),
      completeOnboarding: () => set({ onboarded: true }),
      updateProfile: (patch) => {
        const user = get().user
        if (!user) return
        set({ user: { ...user, ...patch } })
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
        const extra: CalendarEvent[] = blocks.map((block) => ({
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
        }))
        set({ events: [...get().events, ...extra] })
      },
      exportData: () => {
        const state = get()
        return JSON.stringify(
          {
            user: state.user,
            pioneerType: state.pioneerType,
            customMonthlyHours: state.customMonthlyHours,
            monthlyGoals: state.monthlyGoals,
            events: state.events,
            availability: state.availability,
            commitments: state.commitments,
            experiences: state.experiences,
            history: state.history,
            settings: state.settings,
          },
          null,
          2
        )
      },
      deleteAccountLocal: () => {
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
      storage: createJSONStorage(() => localStorage),
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
