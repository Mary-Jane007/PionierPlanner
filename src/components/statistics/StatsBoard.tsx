"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ProgressRing } from "@/components/progress/ProgressRing"
import {
  hoursByCategory,
  hoursByWeek,
  personalInsights,
  yearOverview,
} from "@/lib/calculations"
import { formatDecimal, formatHoursShort, formatPercent } from "@/lib/format"
import { formatMonthTitle } from "@/lib/dates"
import { useMonthSnapshot } from "@/lib/hooks"
import { useT, useLang } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function StatsBoard() {
  const t = useT()
  const lang = useLang()
  const events = useAppStore((s) => s.events)
  const history = useAppStore((s) => s.history)
  const snapshot = useMonthSnapshot()
  const now = new Date()
  const weekData = hoursByWeek(events, now.getFullYear(), now.getMonth())
  const yearData = yearOverview(
    events,
    history,
    now.getFullYear(),
    now.getMonth(),
    snapshot.completed
  )
  const types = hoursByCategory(events, now.getFullYear(), now.getMonth())
  const insights = personalInsights(events, history, now)
  const yearTotal = yearData.reduce((sum, item) => sum + item.hours, 0)
  const monthsTracked = yearData.filter((item) => item.hours > 0).length
  const sessionsTotal =
    history.reduce((sum, item) => sum + item.sessions, 0) + snapshot.sessionsCompleted

  const monthLabels = yearData.map((item) => ({
    ...item,
    name: formatMonthTitle(new Date(now.getFullYear(), item.month, 1), lang).split(" ")[0],
  }))

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">{t("stats.title")}</p>
        <h1 className="font-heading text-4xl capitalize">{formatMonthTitle(now, lang)}</h1>
      </header>

      <section className="surface-primary flex flex-col items-center gap-6 rounded-3xl p-8 sm:flex-row">
        <ProgressRing value={snapshot.percent} label={formatPercent(snapshot.percent)} />
        <div className="grid flex-1 grid-cols-2 gap-3">
          <Stat tone="done" label={t("planner.completed")} value={`${formatDecimal(snapshot.completed, lang)}u`} />
          <Stat tone="left" label={t("planner.remaining")} value={`${formatDecimal(snapshot.remaining, lang)}u`} />
          <Stat tone="planned" label={t("planner.planned")} value={`${formatDecimal(snapshot.planned, lang)}u`} />
          <Stat tone="goal" label={t("status.cancelled")} value={`${formatDecimal(snapshot.cancelled, lang)}u`} />
          <Stat tone="done" label={t("stats.avgSession")} value={formatHoursShort(snapshot.averageSession, lang)} />
          <Stat tone="left" label={t("stats.sessions")} value={String(snapshot.sessionsCompleted)} />
          <Stat tone="goal" label={t("planner.needWeek")} value={`${formatDecimal(snapshot.weeklyAverage, lang)}u`} />
          <Stat tone="planned" label={t("planner.projected")} value={`${formatDecimal(snapshot.projected, lang)}u`} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ChartCard title={t("stats.weekChart")} tone="sage">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="var(--primary)" name={t("planner.completed")} radius={6} />
              <Bar dataKey="planned" fill="var(--accent)" name={t("planner.planned")} radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={t("stats.monthChart")} tone="warm">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthLabels}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="hours" fill="var(--primary)" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="surface-sage rounded-3xl p-6">
        <h2 className="font-heading text-3xl">{t("stats.year")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <Stat tone="goal" label={t("stats.yearTotal")} value={`${formatDecimal(yearTotal, lang)}u`} />
          <Stat
            tone="done"
            label={t("stats.yearAverage")}
            value={`${formatDecimal(monthsTracked ? yearTotal / monthsTracked : 0, lang)}u`}
          />
          <Stat tone="planned" label={t("stats.monthsTracked")} value={String(monthsTracked)} />
          <Stat tone="left" label={t("stats.sessions")} value={String(sessionsTotal)} />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{t("stats.personal")}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="surface-warm rounded-3xl p-6">
          <h2 className="font-heading text-2xl">{t("stats.insights")}</h2>
          <dl className="mt-4 grid gap-3">
            <Row label={t("stats.longest")} value={formatHoursShort((insights.longestSessionMinutes || 0) / 60, lang)} />
            <Row
              label={t("stats.busiestMonth")}
              value={
                insights.busiestMonth !== null
                  ? formatMonthTitle(new Date(now.getFullYear(), insights.busiestMonth, 1), lang)
                  : "—"
              }
            />
            <Row
              label={t("stats.busiestDay")}
              value={insights.busiestWeekday ? t(`weekday.${insights.busiestWeekday}`) : "—"}
            />
            <Row
              label={t("stats.avgSession")}
              value={formatHoursShort((insights.averageSessionMinutes || 0) / 60, lang)}
            />
          </dl>
        </article>
        <article className="surface-accent rounded-3xl p-6">
          <h2 className="font-heading text-2xl">{t("stats.types")}</h2>
          <ul className="mt-4 space-y-2">
            {types.map((item) => (
              <li key={item.category} className="flex justify-between gap-3 text-sm">
                <span className={cn("cat-" + item.category, "rounded-full px-2 py-0.5")}>
                  {t(`category.${item.category}`)}
                </span>
                <span>{formatHoursShort(item.hours, lang)}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  )
}

function ChartCard({
  title,
  children,
  tone = "sage",
}: {
  title: string
  children: React.ReactNode
  tone?: "sage" | "warm"
}) {
  return (
    <article className={cn("rounded-3xl p-5", `surface-${tone}`)}>
      <h2 className="font-heading mb-4 text-2xl">{title}</h2>
      {children}
    </article>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "goal" | "done" | "left" | "planned"
}) {
  return (
    <div className={cn("rounded-2xl p-3", tone ? `stat-${tone}` : "bg-muted/60")}>
      <p className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">{label}</p>
      <p className="font-heading mt-1 text-xl">{value}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}
