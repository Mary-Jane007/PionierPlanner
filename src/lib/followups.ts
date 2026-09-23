import { addDays } from "date-fns"
import { isoDate } from "@/lib/dates"
import type { FollowUp, FollowUpKind, FollowUpQuestion } from "@/types"

export const FOLLOW_SUGGESTIONS: Record<FollowUpKind, string[]> = {
  return_visit: [
    "follow.suggest.liked",
    "follow.suggest.theirQuestion",
    "follow.suggest.scripture",
    "follow.suggest.next",
    "follow.suggest.open",
  ],
  bible_study: [
    "follow.suggest.progress",
    "follow.suggest.understood",
    "follow.suggest.review",
    "follow.suggest.theirQuestion",
    "follow.suggest.next",
  ],
}

export function withFollowUpPatch(item: FollowUp, partial: Partial<FollowUp>): FollowUp {
  return {
    ...item,
    ...partial,
    id: item.id,
    kind: partial.kind ?? item.kind,
    name: partial.name ?? item.name,
    notes: partial.notes ?? item.notes,
    questions: partial.questions ?? item.questions,
    visits: partial.visits ?? item.visits,
    status: partial.status ?? item.status,
    createdAt: item.createdAt,
    updatedAt: new Date().toISOString(),
  }
}

export function emptyFollowUp(kind: FollowUpKind, name = ""): FollowUp {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    kind,
    name,
    notes: "",
    questions: [],
    visits: [],
    status: "active",
    createdAt: now,
    updatedAt: now,
  }
}

export function emptyQuestion(question = ""): FollowUpQuestion {
  return {
    id: crypto.randomUUID(),
    question,
    answer: "",
  }
}

export function unansweredCount(item: FollowUp) {
  return item.questions.filter((entry) => entry.question.trim() && !entry.answer.trim()).length
}

export function sortFollowUps(items: FollowUp[]) {
  return [...items].sort((a, b) => {
    if (a.status !== b.status) {
      if (a.status === "active") return -1
      if (b.status === "active") return 1
      if (a.status === "paused") return -1
      if (b.status === "paused") return 1
    }
    const aDate = a.nextDate || "9999"
    const bDate = b.nextDate || "9999"
    if (aDate !== bDate) return aDate.localeCompare(bDate)
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  })
}

export function dueSoon(item: FollowUp, days = 7) {
  if (item.status === "done" || !item.nextDate) return false
  const today = isoDate(new Date())
  const limit = isoDate(addDays(new Date(), days))
  return item.nextDate >= today && item.nextDate <= limit
}

export function isOverdue(item: FollowUp) {
  if (item.status === "done" || !item.nextDate) return false
  return item.nextDate < isoDate(new Date())
}
