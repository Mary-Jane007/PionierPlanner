import type { DailyContent, LocaleCode } from "@/types"

export type TipCategory =
  | "pioneering"
  | "ministry"
  | "studies"
  | "return"
  | "informal"
  | "time"
  | "study"
  | "encourage"
  | "challenges"

export type LocalizedText = Record<LocaleCode, string>

export interface PioneerTip {
  id: string
  category: TipCategory
  scriptureReference: string
  title: LocalizedText | string
  text: LocalizedText | string
  reflection: LocalizedText | string
  ownerAdded?: boolean
  createdAt?: string
}

export function toDailyContent(tip: PioneerTip, lang: LocaleCode): DailyContent {
  const pick = (value: LocalizedText | string) =>
    typeof value === "string" ? value : value[lang] || value.nl
  return {
    id: tip.id,
    title: pick(tip.title),
    text: pick(tip.text),
    scriptureReference: tip.scriptureReference,
    reflection: pick(tip.reflection),
    sourceType: "original",
    language: lang,
    category: tip.category,
  }
}
