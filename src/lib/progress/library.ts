export const FOCUS_IDS = [
  "bible_reading",
  "personal_study",
  "ministry",
  "prayer",
  "return_visits",
  "bible_studies",
  "teaching",
  "qualities",
  "planning",
  "other",
] as const

export const GOAL_CATEGORIES = [
  "bible_reading",
  "personal_study",
  "prayer",
  "ministry",
  "qualities",
  "skills",
  "congregation",
  "expansion",
  "personal",
] as const

export const GOAL_LIBRARY: { category: string; keys: string[] }[] = [
  {
    category: "bible",
    keys: ["daily", "book", "background", "remember"],
  },
  {
    category: "study",
    keys: ["time", "project", "meditate", "prepare"],
  },
  {
    category: "ministry",
    keys: ["conversations", "questions", "return", "studies", "informal"],
  },
  {
    category: "qualities",
    keys: ["patience", "love", "humility", "self", "courage", "kindness", "faith", "endurance"],
  },
  {
    category: "service",
    keys: ["planning", "regular", "flexible", "new", "help"],
  },
]

export const ROUTINE_TEMPLATES = [
  { titleKey: "progress.routine.morning", items: ["progress.routine.read", "progress.routine.text"] },
  { titleKey: "progress.routine.beforeService", items: ["progress.routine.plan", "progress.routine.material"] },
  { titleKey: "progress.routine.evening", items: ["progress.routine.reflect", "progress.routine.read", "progress.routine.tomorrow"] },
]

export function goalCategoryFromExperience(category: string) {
  if (category === "personal_lesson") return "skills" as const
  if (category === "bible_study") return "ministry" as const
  if (category === "return_visit") return "ministry" as const
  if (category === "informal") return "ministry" as const
  if (category === "encouragement") return "qualities" as const
  if (category === "nice_response") return "ministry" as const
  return "personal" as const
}

export function concreteGoalSuggestions(title: string) {
  const text = title.toLowerCase()
  if (!text) return []
  const vague = /beter|better|mejor|ministry|bediening|groei|grow/.test(text) && text.length < 40
  if (!vague) return []
  return [
    { kind: "skill" as const, key: "progress.helper.skill" },
    { kind: "routine" as const, key: "progress.helper.routine" },
    { kind: "study" as const, key: "progress.helper.study" },
  ]
}
