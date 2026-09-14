"use client"

import { create } from "zustand"
import type { CalendarEvent, Experience, QuickAddKind } from "@/types"

interface PendingConflict {
  pending: CalendarEvent
  existing: CalendarEvent
}

interface UiState {
  activityOpen: boolean
  editingEventId: string | null
  eventPrefill: Partial<CalendarEvent> | null
  experienceOpen: boolean
  editingExperienceId: string | null
  moveEventId: string | null
  quickOpen: boolean
  wizardOpen: boolean
  whatIfOpen: boolean
  fillWeekOpen: boolean
  timerPromptMs: number | null
  conflict: PendingConflict | null
  selectedDate: string | null
  openActivity: (prefill?: Partial<CalendarEvent>, id?: string | null) => void
  closeActivity: () => void
  openExperience: (id?: string | null) => void
  closeExperience: () => void
  openMove: (id: string) => void
  closeMove: () => void
  setQuickOpen: (open: boolean) => void
  setWizardOpen: (open: boolean) => void
  setWhatIfOpen: (open: boolean) => void
  setFillWeekOpen: (open: boolean) => void
  setTimerPrompt: (ms: number | null) => void
  setConflict: (conflict: PendingConflict | null) => void
  setSelectedDate: (date: string | null) => void
  quickKind: QuickAddKind | null
  setQuickKind: (kind: QuickAddKind | null) => void
}

export const useUiStore = create<UiState>((set) => ({
  activityOpen: false,
  editingEventId: null,
  eventPrefill: null,
  experienceOpen: false,
  editingExperienceId: null,
  moveEventId: null,
  quickOpen: false,
  wizardOpen: false,
  whatIfOpen: false,
  fillWeekOpen: false,
  timerPromptMs: null,
  conflict: null,
  selectedDate: null,
  quickKind: null,
  openActivity: (prefill, id = null) =>
    set({
      activityOpen: true,
      eventPrefill: prefill ?? null,
      editingEventId: id,
      quickOpen: false,
    }),
  closeActivity: () =>
    set({ activityOpen: false, eventPrefill: null, editingEventId: null }),
  openExperience: (id = null) =>
    set({ experienceOpen: true, editingExperienceId: id, quickOpen: false }),
  closeExperience: () =>
    set({ experienceOpen: false, editingExperienceId: null }),
  openMove: (id) => set({ moveEventId: id }),
  closeMove: () => set({ moveEventId: null }),
  setQuickOpen: (open) => set({ quickOpen: open }),
  setWizardOpen: (open) => set({ wizardOpen: open }),
  setWhatIfOpen: (open) => set({ whatIfOpen: open }),
  setFillWeekOpen: (open) => set({ fillWeekOpen: open }),
  setTimerPrompt: (ms) => set({ timerPromptMs: ms }),
  setConflict: (conflict) => set({ conflict }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setQuickKind: (kind) => set({ quickKind: kind }),
}))

export type { Experience }
