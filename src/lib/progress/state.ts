import type {
  BibleReadingEntry,
  GoalStep,
  GrowthState,
  PersonalRoutine,
  SpiritualGoal,
  StudyProject,
  StudySession,
} from "@/types/growth"

export function emptyGrowth(): GrowthState {
  return {
    focus: [],
    goals: [],
    biblePlan: { kind: "own", label: "" },
    bibleEntries: [],
    studySessions: [],
    studyProjects: [],
    routines: [],
    routineChecks: [],
    meetingPrep: [],
    skills: [],
    monthlyReflections: [],
    weeklyReflections: [],
    yearReflections: [],
  }
}

export function normalizeGrowth(input?: Partial<GrowthState> | null): GrowthState {
  const base = emptyGrowth()
  if (!input) return base
  return {
    focus: Array.isArray(input.focus) ? input.focus.slice(0, 3) : [],
    goals: Array.isArray(input.goals) ? input.goals : [],
    biblePlan: { ...base.biblePlan, ...(input.biblePlan ?? {}) },
    bibleEntries: Array.isArray(input.bibleEntries) ? input.bibleEntries : [],
    studySessions: Array.isArray(input.studySessions) ? input.studySessions : [],
    studyProjects: Array.isArray(input.studyProjects) ? input.studyProjects : [],
    routines: Array.isArray(input.routines) ? input.routines : [],
    routineChecks: Array.isArray(input.routineChecks) ? input.routineChecks : [],
    meetingPrep: Array.isArray(input.meetingPrep) ? input.meetingPrep : [],
    skills: Array.isArray(input.skills) ? input.skills : [],
    monthlyReflections: Array.isArray(input.monthlyReflections) ? input.monthlyReflections : [],
    weeklyReflections: Array.isArray(input.weeklyReflections) ? input.weeklyReflections : [],
    yearReflections: Array.isArray(input.yearReflections) ? input.yearReflections : [],
  }
}

export function hasGrowthData(growth?: GrowthState | null) {
  const data = normalizeGrowth(growth)
  return (
    data.focus.length +
      data.goals.length +
      data.bibleEntries.length +
      data.studySessions.length +
      data.studyProjects.length +
      data.routines.length +
      data.skills.length +
      data.monthlyReflections.length +
      data.weeklyReflections.length >
    0
  )
}

export function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  const index = list.findIndex((entry) => entry.id === item.id)
  if (index === -1) return [item, ...list]
  return list.map((entry, i) => (i === index ? item : entry))
}

export function emptyGoal(title = ""): SpiritualGoal {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    title,
    category: "ministry",
    reason: "",
    firstStep: "",
    frequency: "weekly",
    startDate: now.slice(0, 10),
    reminder: false,
    status: "active",
    notes: "",
    steps: [],
    experienceIds: [],
    eventIds: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function emptyStep(title = "", sortOrder = 0): GoalStep {
  return { id: crypto.randomUUID(), title, completed: false, sortOrder }
}

export function emptyBibleEntry(date: string): BibleReadingEntry {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    date,
    book: "",
    chapterStart: "",
    chapterEnd: "",
    durationMinutes: 0,
    completed: true,
    createdAt: now,
    updatedAt: now,
  }
}

export function emptyStudySession(date: string): StudySession {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    date,
    durationMinutes: 30,
    title: "",
    category: "bible",
    createdAt: now,
    updatedAt: now,
  }
}

export function emptyProject(): StudyProject {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    goal: "",
    startDate: now.slice(0, 10),
    notes: "",
    sources: "",
    topics: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function emptyRoutine(title: string, items: string[]): PersonalRoutine {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    title,
    items: items.map((item) => ({ id: crypto.randomUUID(), title: item })),
    createdAt: now,
    updatedAt: now,
  }
}

export function goalProgress(goal: SpiritualGoal) {
  const total = goal.steps.length
  const done = goal.steps.filter((step) => step.completed).length
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 }
}
