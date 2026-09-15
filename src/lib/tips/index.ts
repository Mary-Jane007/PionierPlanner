import type { DailyContent, LocaleCode } from "@/types"
import { builtInTips, pickCopy, TIP_CATEGORIES } from "@/lib/tips/library"
import { toDailyContent, type PioneerTip, type TipCategory } from "@/lib/tips/types"

export { TIP_CATEGORIES, builtInTips, toDailyContent, pickCopy }
export type { PioneerTip, TipCategory }

export function localizeTip(tip: PioneerTip, lang: LocaleCode): PioneerTip & {
  title: string
  text: string
  reflection: string
} {
  return {
    ...tip,
    title: pickCopy(tip.title, lang),
    text: pickCopy(tip.text, lang),
    reflection: pickCopy(tip.reflection, lang),
  }
}

export function mergeTips(customTips: PioneerTip[] = []): PioneerTip[] {
  const extra = customTips.filter((tip) => !builtInTips.some((item) => item.id === tip.id))
  return [...extra, ...builtInTips]
}

export function listTips(lang: LocaleCode, customTips: PioneerTip[] = []): DailyContent[] {
  return mergeTips(customTips).map((tip) => toDailyContent(tip, lang))
}

export function getDailyContent(
  lang: LocaleCode,
  date = new Date(),
  customTips: PioneerTip[] = []
): DailyContent {
  const all = listTips(lang, customTips)
  const index = (date.getFullYear() + date.getMonth() + date.getDate()) % all.length
  return all[index]
}

export function getDailyTip(
  lang: LocaleCode,
  date = new Date(),
  customTips: PioneerTip[] = []
): DailyContent {
  const all = listTips(lang, customTips)
  const preferred = all.filter(
    (item) => item.category === "time" || item.category === "encourage" || item.category === "pioneering"
  )
  const pool = preferred.length ? preferred : all
  const index = date.getDate() % pool.length
  return pool[index]
}
