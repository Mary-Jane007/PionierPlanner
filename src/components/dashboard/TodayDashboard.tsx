"use client"

import Link from "next/link"
import { ProgressRing } from "@/components/progress/ProgressRing"
import { TimelineItem } from "@/components/calendar/CalendarBoard"
import { StartTimerButton } from "@/components/activities/ServiceTimer"
import { Button, buttonVariants } from "@/components/ui/button"
import { getDailyContent, getDailyTip } from "@/lib/jworg/daily"
import { formatDecimal, formatPercent } from "@/lib/format"
import { formatHumanDate, formatMonthTitle, greetingKey, isoDate } from "@/lib/dates"
import { useMonthSnapshot } from "@/lib/hooks"
import { useT, useLang } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { useUiStore } from "@/lib/ui-store"
import { JW_ORG_PIONEERS } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function TodayDashboard() {
  const t = useT()
  const lang = useLang()
  const user = useAppStore((s) => s.user)
  const pioneerType = useAppStore((s) => s.pioneerType)
  const events = useAppStore((s) => s.events)
  const snapshot = useMonthSnapshot()
  const openActivity = useUiStore((s) => s.openActivity)
  const now = new Date()
  const today = isoDate(now)
  const greeting = greetingKey(now)
  const daily = getDailyContent(lang, now)
  const tip = getDailyTip(lang, now)
  const todayEvents = events
    .filter((event) => event.date === today && event.status !== "cancelled")
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
  const recommendedWeek = formatDecimal(snapshot.requiredWeekly, lang)
  const nextLabel = snapshot.next
    ? `${snapshot.next.date === isoDate(new Date(now.getTime() + 86400000)) ? (lang === "en" ? "Tomorrow" : "Morgen") : formatHumanDate(new Date(`${snapshot.next.date}T12:00:00`), lang)} — ${snapshot.next.startTime}`
    : t("home.noneNext")

  const bestStep = getBestStep(t, snapshot, lang)

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <header>
          <h1 className="font-heading text-4xl sm:text-5xl">
            {t(`home.greeting.${greeting}`, { name: user?.name ?? "" })}
          </h1>
          <p className="mt-1 capitalize text-muted-foreground">
            {formatMonthTitle(now, lang)}
          </p>
        </header>

        <section className="surface-sage rounded-3xl p-6 sm:p-8">
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            {t(`pioneer.${pioneerType}`)}
          </p>
          <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:items-center">
            <ProgressRing
              value={snapshot.percent}
              label={formatPercent(snapshot.percent)}
              caption={`${formatDecimal(snapshot.completed, lang)} / ${snapshot.target}`}
            />
            <div className="w-full flex-1 space-y-4">
              <p className="font-heading text-4xl">
                {formatDecimal(snapshot.completed, lang)} / {snapshot.target} {t("common.hours")}
              </p>
              <p className="text-muted-foreground">
                {t("home.remaining", { n: formatDecimal(snapshot.remaining, lang) })}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Mini
                  tone="sage"
                  label={t("home.thisWeek")}
                  value={t("home.hoursPlanned", { n: formatDecimal(snapshot.weekHours, lang) })}
                />
                <Mini
                  tone="warm"
                  label={t("home.today")}
                  value={t("home.hoursPlanned", { n: formatDecimal(snapshot.todayHours, lang) })}
                />
                <Mini tone="accent" label={t("home.next")} value={nextLabel} />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/planner" className={cn(buttonVariants(), "h-11 rounded-xl px-4")}>
                  {t("home.viewPlan")}
                </Link>
                <Button
                  variant="outline"
                  className="h-11 rounded-xl"
                  onClick={() =>
                    openActivity({
                      category: "field_service",
                      title: t("category.field_service"),
                      date: today,
                    })
                  }
                >
                  {t("home.addService")}
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className={cn("rounded-3xl p-6", `health-${snapshot.health}`)}>
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            {t("home.bestNext")}
          </p>
          <h2 className="font-heading mt-2 text-2xl">{bestStep.title}</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">{bestStep.text}</p>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-heading text-3xl">{t("home.today")}</h2>
            <StartTimerButton />
          </div>
          {todayEvents.length === 0 ? (
            <div className="surface-primary rounded-3xl px-6 py-10 text-center">
              <h3 className="font-heading text-2xl">{t("empty.month")}</h3>
              <p className="mt-2 text-muted-foreground">{t("empty.monthText")}</p>
              <Button className="mt-4" onClick={() => openActivity({ date: today, category: "field_service" })}>
                {t("empty.planFirst")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayEvents.map((event) => (
                <TimelineItem key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-4">
        <article className="surface-warm rounded-3xl p-5">
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            {t("home.encouragement")}
          </p>
          <h2 className="font-heading mt-3 text-2xl leading-snug">“{daily.title}”</h2>
          {daily.scriptureReference ? (
            <p className="mt-3 text-sm text-primary">{daily.scriptureReference}</p>
          ) : null}
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {daily.reflection}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            {t("home.originalTip")}
          </p>
        </article>
        <article className="surface-sage rounded-3xl p-5">
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            {t("home.tip")}
          </p>
          <h2 className="font-heading mt-3 text-2xl">{tip.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{tip.text}</p>
        </article>
        <article className="surface-primary rounded-3xl p-5">
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            {t("planner.pace")}
          </p>
          <p className="font-heading mt-2 text-2xl">
            {t("planner.paceText", { n: recommendedWeek })}
          </p>
          <Link href="/tips" className={cn(buttonVariants({ variant: "link" }), "h-auto px-0")}>
            {t("home.readMore")}
          </Link>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("pioneer.source")} ·{" "}
            <a className="underline-offset-2 hover:underline" href={JW_ORG_PIONEERS} target="_blank" rel="noreferrer">
              {t("pioneer.readOfficial")}
            </a>
          </p>
        </article>
      </aside>
    </div>
  )
}

function Mini({
  label,
  value,
  tone = "sage",
}: {
  label: string
  value: string
  tone?: "sage" | "warm" | "accent"
}) {
  return (
    <div className={cn("rounded-2xl px-3 py-3", `surface-${tone}`)}>
      <p className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  )
}

function getBestStep(
  t: (key: string, vars?: Record<string, string | number>) => string,
  snapshot: ReturnType<typeof useMonthSnapshot>,
  lang: "nl" | "en" | "es" | "pap"
) {
  if (snapshot.stillToPlan <= 0.5 && snapshot.projected >= snapshot.target - 0.5) {
    return {
      title: t("planner.health.balanced"),
      text:
        lang === "en"
          ? "Your month is covered. Keep the sessions that already feel good."
          : "Je maand is gedekt. Houd de sessies die al prettig aanvoelen.",
    }
  }
  if (snapshot.health === "adjust") {
    return {
      title: t("planner.review"),
      text: t("planner.under", {
        n: formatDecimal(Math.max(0, snapshot.target - snapshot.projected), lang),
      }),
    }
  }
  if (snapshot.next) {
    const when = `${snapshot.next.date} ${snapshot.next.startTime}`
    return {
      title: t("home.next"),
      text:
        lang === "en"
          ? `Your next session is already planned: ${when}. Showing up is enough for today.`
          : `Je volgende sessie staat al gepland: ${when}. Verschijnen is vandaag al genoeg.`,
    }
  }
  return {
    title: t("empty.planFirst"),
    text:
      lang === "en"
        ? `Based on your current plan, about ${formatDecimal(snapshot.requiredDaily, lang)} hours on an available day would help you reach your goal comfortably.`
        : `Op basis van je huidige planning zou ongeveer ${formatDecimal(snapshot.requiredDaily, lang)} uur op een beschikbare dag je helpen om je doel comfortabel te bereiken.`,
  }
}
