"use client"

import { useState } from "react"
import { officialResources } from "@/lib/jworg/resources"
import { getDailyTip } from "@/lib/jworg/daily"
import { useT, useLang } from "@/lib/i18n"

const categories = [
  "pioneering",
  "ministry",
  "studies",
  "return",
  "informal",
  "time",
  "study",
  "encourage",
  "challenges",
] as const

export function TipsBoard() {
  const t = useT()
  const lang = useLang()
  const [category, setCategory] = useState<(typeof categories)[number] | "all">("all")
  const tip = getDailyTip(lang)
  const resources = officialResources.filter((item) => {
    if (category === "all") return true
    const map: Record<string, string[]> = {
      pioneering: ["pioneering"],
      ministry: ["ministry"],
      studies: ["study"],
      return: ["ministry"],
      informal: ["ministry"],
      time: ["time"],
      study: ["study"],
      encourage: ["encourage"],
      challenges: ["encourage"],
    }
    return map[category]?.includes(item.category)
  })

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">{t("tips.title")}</p>
        <h1 className="font-heading text-4xl">{t("tips.title")}</h1>
      </header>

      <article className="card-quiet rounded-3xl p-6">
        <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{t("home.tip")}</p>
        <h2 className="font-heading mt-2 text-3xl">{tip.title}</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{tip.text}</p>
        <p className="mt-4 text-xs">{t("home.originalTip")}</p>
      </article>

      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`rounded-full border px-3 py-1 text-xs ${category === item ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
          >
            {t(`tips.cat.${item}`)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {resources.map((item) => (
          <article key={item.id} className="card-quiet rounded-3xl p-5">
            <h2 className="font-heading text-2xl">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.summary}</p>
            <p className="mt-4 text-xs text-muted-foreground">{t("tips.sourceJw")}</p>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex text-sm text-primary underline-offset-4 hover:underline"
            >
              {t("tips.readJw")}
            </a>
          </article>
        ))}
      </div>
    </div>
  )
}
