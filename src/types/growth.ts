export type GrowthFocusId =
  | "bible_reading"
  | "personal_study"
  | "ministry"
  | "prayer"
  | "return_visits"
  | "bible_studies"
  | "teaching"
  | "qualities"
  | "planning"
  | "other"

export type GoalCategory =
  | "bible_reading"
  | "personal_study"
  | "prayer"
  | "ministry"
  | "qualities"
  | "skills"
  | "congregation"
  | "expansion"
  | "personal"

export type GoalFrequency = "daily" | "weekly" | "monthly" | "once"
export type GoalStatus = "active" | "paused" | "completed" | "released"

export type StudyCategory =
  | "bible"
  | "watchtower"
  | "project"
  | "meeting"
  | "ministry_prep"
  | "background"
  | "personal_topic"
  | "other"

export type BiblePlanKind = "own" | "chronological" | "whole_bible" | "custom"
export type SkillCategory =
  | "starting"
  | "listening"
  | "questions"
  | "scriptures"
  | "return_visits"
  | "bible_studies"
  | "informal"
  | "teaching"
  | "teamwork"
  | "other"

export interface GoalStep {
  id: string
  title: string
  completed: boolean
  completedAt?: string
  sortOrder: number
}

export interface SpiritualGoal {
  id: string
  title: string
  category: GoalCategory
  reason: string
  firstStep: string
  frequency: GoalFrequency
  startDate: string
  targetDate?: string
  reminder: boolean
  status: GoalStatus
  releasedWhy?: string
  notes: string
  steps: GoalStep[]
  experienceIds: string[]
  eventIds: string[]
  createdAt: string
  updatedAt: string
}

export interface BibleReadingPlan {
  kind: BiblePlanKind
  label: string
}

export interface BibleReadingEntry {
  id: string
  date: string
  book: string
  chapterStart: string
  chapterEnd: string
  durationMinutes: number
  completed: boolean
  noticed?: string
  remember?: string
  apply?: string
  createdAt: string
  updatedAt: string
}

export interface StudySession {
  id: string
  date: string
  durationMinutes: number
  title: string
  category: StudyCategory
  notes?: string
  learned?: string
  aboutJehovah?: string
  apply?: string
  ministryUse?: string
  projectId?: string
  createdAt: string
  updatedAt: string
}

export interface StudyProjectTopic {
  id: string
  title: string
  done: boolean
}

export interface StudyProject {
  id: string
  title: string
  description: string
  goal: string
  startDate: string
  targetDate?: string
  notes: string
  sources: string
  topics: StudyProjectTopic[]
  createdAt: string
  updatedAt: string
}

export interface PersonalRoutineItem {
  id: string
  title: string
}

export interface PersonalRoutine {
  id: string
  title: string
  items: PersonalRoutineItem[]
  createdAt: string
  updatedAt: string
}

export interface RoutineCheck {
  id: string
  routineId: string
  itemId: string
  date: string
}

export interface MeetingPrep {
  id: string
  date: string
  prepared: boolean
  scripturesRead: boolean
  answerReady: boolean
  extraResearch: boolean
}

export interface MinistrySkill {
  id: string
  category: SkillCategory
  title: string
  aim: string
  nextStep: string
  wentWell: string
  workOn: string
  createdAt: string
  updatedAt: string
}

export interface MonthlyReflection {
  id: string
  year: number
  month: number
  gratitude: string
  learned: string
  ministry: string
  workOn: string
  remember: string
  nextMonth: string
  favoriteExperienceId?: string
  createdAt: string
  updatedAt: string
}

export interface WeeklyReflection {
  id: string
  weekStart: string
  wentWell: string
  hard: string
  remember: string
  nextWeek: string
  createdAt: string
  updatedAt: string
}

export interface ServiceYearReflection {
  id: string
  startYear: number
  learned: string
  grown: string
  remember: string
  nextYear: string
  createdAt: string
  updatedAt: string
}

export interface GrowthState {
  focus: GrowthFocusId[]
  goals: SpiritualGoal[]
  biblePlan: BibleReadingPlan
  bibleEntries: BibleReadingEntry[]
  studySessions: StudySession[]
  studyProjects: StudyProject[]
  routines: PersonalRoutine[]
  routineChecks: RoutineCheck[]
  meetingPrep: MeetingPrep[]
  skills: MinistrySkill[]
  monthlyReflections: MonthlyReflection[]
  weeklyReflections: WeeklyReflection[]
  yearReflections: ServiceYearReflection[]
}
