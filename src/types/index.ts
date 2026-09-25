export type PioneerTypeId = "regular" | "auxiliary" | "custom"
export type ActivityCategory =
  | "field_service"
  | "work"
  | "meeting"
  | "personal"
  | "rest"
  | "other"
export type FieldServiceType =
  | "house_to_house"
  | "informal"
  | "public"
  | "phone"
  | "letters"
  | "return_visit"
  | "bible_study"
  | "other"
export type ActivityStatus = "planned" | "completed" | "cancelled"
export type ExperienceCategory =
  | "nice_response"
  | "bible_study"
  | "return_visit"
  | "informal"
  | "encouragement"
  | "personal_lesson"
  | "other"
export type PlanningStyle = "even" | "weekend" | "weekdays" | "flexible"
export type SessionPreference =
  | "short"
  | "long"
  | "mornings"
  | "afternoons"
  | "evenings"
  | "weekends"
  | "flexible"
export type DayPart = "morning" | "afternoon" | "evening"
export type LocaleCode = "nl" | "en" | "es" | "pap"
export type ThemeMode = "light" | "dark" | "system"
export type SourceType = "official" | "original"
export type CommitmentType =
  | "work"
  | "meeting"
  | "school"
  | "family"
  | "appointment"
  | "other"
export type ExperienceVisibility = "private" | "share_ready"
export type FollowUpKind = "return_visit" | "bible_study"
export type FollowUpContactType = "first_conversation" | "return_visit" | "bible_study"
export type FollowUpStatus =
  | "new"
  | "planned"
  | "regular"
  | "bible_study"
  | "not_interested"
  | "try_later"
export type FollowUpMaterialKind =
  | "bible"
  | "publication"
  | "article"
  | "video"
  | "jw_link"
  | "other"

export interface FollowUpQuestion {
  id: string
  question: string
  answer: string
}

export interface FollowUpVisit {
  id: string
  date: string
  notes: string
}

export interface FollowUpConversation {
  topic: string
  theySaid: string
  interest: string
  openQuestion: string
  reaction: string
  date?: string
}

export interface FollowUpScripture {
  id: string
  book: string
  verse: string
  why: string
  reaction: string
}

export interface FollowUpNextQuestion {
  question: string
  scripture: string
  topic: string
  material: string
}

export interface FollowUpStudy {
  date: string
  publication: string
  lesson: string
  paragraphs: string
  topic: string
  understood: string
  difficult: string
  questions: string
  textsDiscussed: string
  textThatTouched: string
  apply: string
  agreed: string
  nextLesson: string
  nextTopic: string
  nextQuestion: string
  nextTexts: string
}

export interface StudentGoal {
  id: string
  text: string
  done: boolean
}

export interface StudentQuestion {
  id: string
  question: string
  note: string
}

export interface StudentTracker {
  publication: string
  chapter: string
  startedDate: string
  progress: string
  workOn: string
  nextFocus: string
  goals: StudentGoal[]
  questions: StudentQuestion[]
}

export interface FollowUp {
  id: string
  kind: FollowUpKind
  contactType: FollowUpContactType
  name: string
  address?: string
  phone?: string
  language?: string
  firstTalkDate?: string
  firstTalkTime?: string
  family?: string
  background?: string
  interests?: string
  concerns?: string
  publication?: string
  nextDate?: string
  nextTime?: string
  nextLocation?: string
  nextPurpose?: string
  reminder: boolean
  calendarEventId?: string
  conversation: FollowUpConversation
  scriptures: FollowUpScripture[]
  materials: FollowUpMaterialKind[]
  materialDetail?: string
  nextQuestion: FollowUpNextQuestion
  study: FollowUpStudy
  tracker: StudentTracker
  notes: string
  questions: FollowUpQuestion[]
  visits: FollowUpVisit[]
  status: FollowUpStatus
  createdAt: string
  updatedAt: string
}

export interface PioneerProfileConfig {
  id: PioneerTypeId
  monthlyHours: number | null
}

export interface UserAccount {
  id: string
  email: string
  name: string
  passwordHash: string
  googleSub?: string
  createdAt: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface NotificationSettings {
  tomorrowReminder: boolean
  todayHours: boolean
  monthlyRemaining: boolean
  planningUpdate: boolean
}

export interface UserSettings {
  language: LocaleCode
  timezone: string
  theme: ThemeMode
  highContrast: boolean
  notifications: NotificationSettings
  planningStyle: PlanningStyle
  sessionPreferences: SessionPreference[]
  preferredSessionHours: number
  maxSessionHours: number
}

export interface AvailabilitySlot {
  weekday: number
  parts: DayPart[]
}

export interface Commitment {
  id: string
  title: string
  type: CommitmentType
  weekday: number | null
  date: string | null
  startTime: string
  endTime: string
}

export interface CalendarEvent {
  id: string
  title: string
  category: ActivityCategory
  date: string
  startTime: string
  endTime: string
  durationMinutes: number
  companion?: string
  serviceType?: FieldServiceType
  location?: string
  notes?: string
  status: ActivityStatus
  followUpId?: string
  createdAt: string
  updatedAt: string
}

export interface Experience {
  id: string
  title: string
  date: string
  category: ExperienceCategory
  text: string
  learned?: string
  tags: string[]
  favorite: boolean
  visibility: ExperienceVisibility
  followUpDate?: string
  createdAt: string
  updatedAt: string
}

export interface DailyContent {
  id: string
  date?: string
  title: string
  text: string
  scriptureReference?: string
  reflection?: string
  sourceUrl?: string
  sourceType: SourceType
  language: LocaleCode
  category: string
}

export interface OfficialResource {
  id: string
  title: string
  summary: string
  category: string
  sourceUrl: string
  language: LocaleCode
}

export interface MonthlyGoal {
  year: number
  month: number
  pioneerType: PioneerTypeId
  targetHours: number
}

export interface HistoricalMonth {
  year: number
  month: number
  completedHours: number
  sessions: number
  longestSessionMinutes: number
  busiestWeekday: number
}

export interface TimerState {
  running: boolean
  paused: boolean
  startedAt: string | null
  elapsedMs: number
  category: ActivityCategory
}

export interface SuggestedBlock {
  date: string
  startTime: string
  endTime: string
  hours: number
  weekday: number
}

export interface SuggestedOption {
  id: string
  style: PlanningStyle
  titleKey: string
  blocks: SuggestedBlock[]
  totalHours: number
}

export interface ConflictInfo {
  eventTitle: string
  category: ActivityCategory
  startTime: string
  endTime: string
}

export type QuickAddKind = "field_service" | "event" | "experience" | "note"
