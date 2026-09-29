import { addDays } from "date-fns"
import { endTimeFromDuration, isoDate, minutesBetween } from "@/lib/dates"
import type {
  CalendarEvent,
  FollowUp,
  FollowUpContactType,
  FollowUpConversation,
  FollowUpKind,
  FollowUpMaterialKind,
  FollowUpNextQuestion,
  FollowUpScripture,
  FollowUpStatus,
  FollowUpStudy,
  LocaleCode,
  StudentGoal,
  StudentQuestion,
  StudentTracker,
} from "@/types"

export const FOLLOW_STATUSES: FollowUpStatus[] = [
  "new",
  "planned",
  "regular",
  "bible_study",
  "not_interested",
  "try_later",
]

export const FOLLOW_CONTACT_TYPES: FollowUpContactType[] = [
  "first_conversation",
  "return_visit",
  "bible_study",
]

export const FOLLOW_MATERIALS: FollowUpMaterialKind[] = [
  "bible",
  "publication",
  "article",
  "video",
  "jw_link",
  "other",
]

export function emptyConversation(): FollowUpConversation {
  return { topic: "", theySaid: "", interest: "", openQuestion: "", reaction: "" }
}

export function emptyNextQuestion(): FollowUpNextQuestion {
  return { question: "", scripture: "", topic: "", material: "" }
}

export function emptyStudy(): FollowUpStudy {
  return {
    date: "",
    publication: "",
    lesson: "",
    paragraphs: "",
    topic: "",
    understood: "",
    difficult: "",
    questions: "",
    textsDiscussed: "",
    textThatTouched: "",
    apply: "",
    agreed: "",
    nextLesson: "",
    nextTopic: "",
    nextQuestion: "",
    nextTexts: "",
  }
}

export function emptyTracker(): StudentTracker {
  return {
    publication: "",
    chapter: "",
    startedDate: "",
    progress: "",
    workOn: "",
    nextFocus: "",
    goals: [],
    questions: [],
  }
}

export function emptyGoal(text = ""): StudentGoal {
  return { id: crypto.randomUUID(), text, done: false }
}

export function emptyStudentQuestion(question = ""): StudentQuestion {
  return { id: crypto.randomUUID(), question, note: "" }
}

export function normalizeTracker(
  input?: Partial<StudentTracker>,
  study?: Partial<FollowUpStudy>
): StudentTracker {
  const tracker = { ...emptyTracker(), ...(input ?? {}) }
  const goals = Array.isArray(tracker.goals)
    ? tracker.goals.map((goal) => ({
        id: goal.id || crypto.randomUUID(),
        text: asString(goal.text),
        done: Boolean(goal.done),
      }))
    : []
  const questions = Array.isArray(tracker.questions)
    ? tracker.questions.map((entry) => ({
        id: entry.id || crypto.randomUUID(),
        question: asString(entry.question),
        note: asString(entry.note),
      }))
    : []
  return {
    publication: tracker.publication.trim() || asString(study?.publication),
    chapter: tracker.chapter.trim() || asString(study?.lesson),
    startedDate: tracker.startedDate,
    progress: tracker.progress,
    workOn: tracker.workOn,
    nextFocus: tracker.nextFocus,
    goals,
    questions,
  }
}

export function emptyScripture(): FollowUpScripture {
  return {
    id: crypto.randomUUID(),
    book: "",
    verse: "",
    why: "",
    reaction: "",
  }
}

function asString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function migrateStatus(raw: unknown, kind: FollowUpKind): FollowUpStatus {
  if (raw === "new" || raw === "planned" || raw === "regular" || raw === "bible_study" || raw === "not_interested" || raw === "try_later") {
    return raw
  }
  if (raw === "done") return "not_interested"
  if (raw === "paused") return "try_later"
  if (kind === "bible_study") return "bible_study"
  if (raw === "active") return "planned"
  return "new"
}

export function normalizeFollowUp(input: Partial<FollowUp> & { id?: string; name?: string }): FollowUp {
  const kind: FollowUpKind = input.kind === "bible_study" ? "bible_study" : "return_visit"
  const contactType: FollowUpContactType =
    input.contactType === "first_conversation" || input.contactType === "return_visit" || input.contactType === "bible_study"
      ? input.contactType
      : kind === "bible_study"
        ? "bible_study"
        : "return_visit"
  const status = migrateStatus(input.status, kind)
  const nextKind: FollowUpKind =
    status === "bible_study" || contactType === "bible_study" ? "bible_study" : kind
  const conversation = {
    ...emptyConversation(),
    ...(input.conversation ?? {}),
  }
  if (!conversation.topic && asString(input.notes)) {
    conversation.topic = asString(input.notes)
  }
  if (!conversation.openQuestion && input.questions?.[0]?.question) {
    conversation.openQuestion = input.questions[0].question
  }
  const nextQuestion = {
    ...emptyNextQuestion(),
    ...(input.nextQuestion ?? {}),
  }
  if (!nextQuestion.question && input.questions?.[0]?.question) {
    nextQuestion.question = input.questions[0].question
  }
  const now = new Date().toISOString()
  return {
    id: input.id || crypto.randomUUID(),
    kind: nextKind,
    contactType: nextKind === "bible_study" ? "bible_study" : contactType,
    name: asString(input.name),
    address: input.address || undefined,
    phone: input.phone || undefined,
    language: input.language || undefined,
    firstTalkDate: input.firstTalkDate || undefined,
    firstTalkTime: input.firstTalkTime || undefined,
    family: input.family || undefined,
    background: input.background || undefined,
    interests: input.interests || undefined,
    concerns: input.concerns || undefined,
    publication: input.publication || undefined,
    nextDate: input.nextDate || undefined,
    nextTime: input.nextTime || undefined,
    nextLocation: input.nextLocation || undefined,
    nextPurpose: input.nextPurpose || undefined,
    reminder: Boolean(input.reminder),
    calendarEventId: input.calendarEventId || undefined,
    conversation,
    scriptures: Array.isArray(input.scriptures) ? input.scriptures : [],
    materials: Array.isArray(input.materials) ? input.materials : [],
    materialDetail: input.materialDetail || undefined,
    nextQuestion,
    study: { ...emptyStudy(), ...(input.study ?? {}) },
    tracker: normalizeTracker(input.tracker, input.study),
    notes: asString(input.notes),
    questions: Array.isArray(input.questions) ? input.questions : [],
    visits: Array.isArray(input.visits) ? input.visits : [],
    status: nextKind === "bible_study" && status === "new" ? "bible_study" : status,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  }
}

export function emptyFollowUp(kind: FollowUpKind = "return_visit", name = ""): FollowUp {
  return normalizeFollowUp({
    kind,
    contactType: kind === "bible_study" ? "bible_study" : "first_conversation",
    name,
    status: kind === "bible_study" ? "bible_study" : "new",
    reminder: true,
    notes: "",
  })
}

export function withFollowUpPatch(item: FollowUp, partial: Partial<FollowUp>): FollowUp {
  return normalizeFollowUp({
    ...item,
    ...partial,
    id: item.id,
    createdAt: item.createdAt,
    updatedAt: new Date().toISOString(),
    conversation: { ...item.conversation, ...partial.conversation },
    nextQuestion: { ...item.nextQuestion, ...partial.nextQuestion },
    study: { ...item.study, ...partial.study },
    tracker: partial.tracker
      ? {
          ...item.tracker,
          ...partial.tracker,
          goals: partial.tracker.goals ?? item.tracker.goals,
          questions: partial.tracker.questions ?? item.tracker.questions,
        }
      : item.tracker,
  })
}

export function lastContactDate(item: FollowUp) {
  const dates = [
    item.firstTalkDate,
    item.conversation.date,
    ...item.visits.map((visit) => visit.date),
  ].filter(Boolean) as string[]
  if (dates.length === 0) return undefined
  return dates.sort().at(-1)
}

export function lastTopic(item: FollowUp) {
  return (
    item.conversation.topic.trim() ||
    item.visits.find((visit) => visit.notes.trim())?.notes.trim() ||
    item.notes.trim() ||
    ""
  )
}

export function isClosedStatus(status: FollowUpStatus) {
  return status === "not_interested"
}

export function dueSoon(item: FollowUp, days = 7) {
  if (isClosedStatus(item.status) || !item.nextDate) return false
  const today = isoDate(new Date())
  const limit = isoDate(addDays(new Date(), days))
  return item.nextDate >= today && item.nextDate <= limit
}

export function isOverdue(item: FollowUp) {
  if (isClosedStatus(item.status) || !item.nextDate) return false
  return item.nextDate < isoDate(new Date())
}

export function isTomorrow(item: FollowUp) {
  if (isClosedStatus(item.status) || !item.nextDate) return false
  return item.nextDate === isoDate(addDays(new Date(), 1))
}

export function sortFollowUps(items: FollowUp[]) {
  return [...items].map(normalizeFollowUp).sort((a, b) => {
    if (isClosedStatus(a.status) !== isClosedStatus(b.status)) {
      return isClosedStatus(a.status) ? 1 : -1
    }
    const aDate = a.nextDate || "9999"
    const bDate = b.nextDate || "9999"
    if (aDate !== bDate) return aDate.localeCompare(bDate)
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  })
}

export function searchHaystack(item: FollowUp) {
  return [
    item.name,
    item.kind,
    item.contactType,
    item.status,
    item.address,
    item.phone,
    item.family,
    item.background,
    item.interests,
    item.concerns,
    item.publication,
    item.notes,
    item.materialDetail,
    item.nextPurpose,
    item.nextLocation,
    item.firstTalkDate,
    item.nextDate,
    lastContactDate(item),
    lastTopic(item),
    item.conversation.topic,
    item.conversation.theySaid,
    item.conversation.interest,
    item.conversation.openQuestion,
    item.conversation.reaction,
    item.nextQuestion.question,
    item.nextQuestion.scripture,
    item.nextQuestion.topic,
    item.nextQuestion.material,
    ...item.scriptures.flatMap((entry) => [entry.book, entry.verse, entry.why, entry.reaction]),
    ...item.visits.map((visit) => `${visit.date} ${visit.notes}`),
    item.study.publication,
    item.study.topic,
    item.study.lesson,
    item.study.understood,
    item.study.difficult,
    item.study.questions,
    item.study.textsDiscussed,
    item.study.nextQuestion,
    item.tracker.publication,
    item.tracker.chapter,
    item.tracker.progress,
    item.tracker.workOn,
    item.tracker.nextFocus,
    ...item.tracker.goals.map((goal) => goal.text),
    ...item.tracker.questions.flatMap((entry) => [entry.question, entry.note]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

export function matchesQuery(item: FollowUp, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return searchHaystack(item).includes(needle)
}

export function shouldSyncCalendar(item: FollowUp) {
  return Boolean(item.nextDate) && !isClosedStatus(item.status)
}

export function followUpCalendarTitle(item: FollowUp, lang: LocaleCode) {
  if (item.kind === "bible_study") {
    if (lang === "en") return `Bible study · ${item.name}`
    if (lang === "es") return `Estudio bíblico · ${item.name}`
    if (lang === "pap") return `Estudio bíbliko · ${item.name}`
    return `Bijbelstudie · ${item.name}`
  }
  if (lang === "en") return `Return visit · ${item.name}`
  if (lang === "es") return `Revisita · ${item.name}`
  if (lang === "pap") return `Revisita · ${item.name}`
  return `Nabezoek · ${item.name}`
}

export function calendarEventForFollowUp(
  item: FollowUp,
  lang: LocaleCode,
  existing?: CalendarEvent
): CalendarEvent | null {
  if (!shouldSyncCalendar(item) || !item.nextDate) return null
  const startTime = item.nextTime || "10:00"
  const endTime = endTimeFromDuration(startTime, 1)
  const now = new Date().toISOString()
  const notes = [item.nextPurpose, item.nextQuestion.question, item.nextQuestion.scripture]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" · ")
  return {
    id: item.calendarEventId || existing?.id || crypto.randomUUID(),
    title: followUpCalendarTitle(item, lang),
    category: "field_service",
    date: item.nextDate,
    startTime,
    endTime,
    durationMinutes: minutesBetween(startTime, endTime),
    serviceType: item.kind === "bible_study" ? "bible_study" : "return_visit",
    location: item.nextLocation,
    notes: notes || undefined,
    status: existing?.status === "completed" ? "completed" : "planned",
    followUpId: item.id,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}

export function reminderLine(item: FollowUp) {
  return {
    previous: lastTopic(item),
    openQuestion: item.conversation.openQuestion.trim() || item.nextQuestion.question.trim(),
    next: item.nextQuestion.scripture.trim() || item.nextQuestion.topic.trim() || item.nextPurpose?.trim() || "",
  }
}

export function trackerSummary(item: FollowUp) {
  const tracker = item.tracker
  return {
    publication: tracker.publication.trim(),
    chapter: tracker.chapter.trim(),
    workOn: tracker.workOn.trim(),
    openGoals: tracker.goals.filter((goal) => goal.text.trim() && !goal.done).length,
    openQuestions: tracker.questions.filter((entry) => entry.question.trim()).length,
  }
}
