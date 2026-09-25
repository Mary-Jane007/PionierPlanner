"use client"

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { calculateBibleReadingProgress, calculateMonthlySummary, calculateStudyFrequency } from "@/lib/progress"
import { formatDecimal } from "@/lib/format"
import { useNow } from "@/lib/hooks"
import { useT, useLang } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function HomeProgressCard() {
  const t = useT()
  const lang = useLang()
  const now = useNow()
  const events = useAppStore((s) => s.events)
  const experiences = useAppStore((s) => s.experiences)
  const pioneerType = useAppStore((s) => s.pioneerType)
  const customHours = useAppStore((s) => s.customMonthlyHours)
  const monthlyGoals = useAppStore((s) => s.monthlyGoals)
  const growth = useAppStore((s) => s.growth)
  const month = calculateMonthlySummary({
    events,
    growth,
    experiences,
    pioneerType,
    customHours,
    monthlyGoals,
    year: now.getFullYear(),
    month: now.getMonth(),
  })
  const bible = calculateBibleReadingProgress(growth, now)
  const study = calculateStudyFrequency(growth, now)
  const focus = growth.focus[0]

  return (
    <article className="card-quiet rounded-3xl p-6">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">{t("progress.home")}</p>
      <h2 className="font-heading mt-2 text-3xl">{t("progress.home")}</h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">{t("progress.card.service")}</dt>
          <dd className="mt-1 text-sm font-medium">
            {t("progress.hoursOf", { n: formatDecimal(month.completed, lang), t: month.target })}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">{t("progress.card.bible")}</dt>
          <dd className="mt-1 text-sm font-medium">{t("progress.days", { n: bible.monthDays })}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">{t("progress.card.study")}</dt>
          <dd className="mt-1 text-sm font-medium">{t("progress.sessions", { n: study.monthSessions })}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">{t("progress.myFocus")}</dt>
          <dd className="mt-1 text-sm font-medium">
            {focus ? t(`progress.focus.${focus}`) : t("progress.noFocus")}
          </dd>
        </div>
      </dl>
      <Link href="/vorderingen/" className={cn(buttonVariants(), "mt-5 h-11 rounded-xl")}>
        {t("progress.view")}
      </Link>
    </article>
  )
}
