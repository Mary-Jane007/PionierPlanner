"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { addDays, addWeeks, startOfWeek } from "date-fns"
import { ArrowLeft, Plus, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProgressRing } from "@/components/progress/ProgressRing"
import { Textarea } from "@/components/ui/textarea"
import { GoalDialog } from "@/components/growth/GoalDialog"
import { officialResources } from "@/lib/jworg/resources"
import {
  calculateBibleReadingProgress,
  calculateGoalTotals,
  calculateMonthlySummary,
  calculateServiceYearProgress,
  calculateStudyFrequency,
  emptyBibleEntry,
  emptyProject,
  emptyRoutine,
  emptyStep,
  emptyStudySession,
  FOCUS_IDS,
  generatePersonalInsights,
  GOAL_LIBRARY,
  goalProgress,
  ROUTINE_TEMPLATES,
  upsertById,
} from "@/lib/progress"
import { endTimeFromDuration, formatHumanDate, formatMonthTitle, isoDate, parseDate } from "@/lib/dates"
import { formatDecimal, formatPercent } from "@/lib/format"
import { JW_ORG_LIBRARY } from "@/lib/constants"
import { useNow } from "@/lib/hooks"
import { useT, useLang } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { GoalStatus, SkillCategory, StudyCategory } from "@/types/growth"
import type { CalendarEvent } from "@/types"
import type { SpiritualGoal } from "@/types/growth"

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&>option]:bg-popover [&>option]:text-popover-foreground"

const skillCats: SkillCategory[] = [
  "starting",
  "listening",
  "questions",
  "scriptures",
  "return_visits",
  "bible_studies",
  "informal",
  "teaching",
  "teamwork",
  "other",
]

const studyCats: StudyCategory[] = [
  "bible",
  "watchtower",
  "project",
  "meeting",
  "ministry_prep",
  "background",
  "personal_topic",
  "other",
]

export function GrowthBoard() {
  const t = useT()
  const lang = useLang()
  const router = useRouter()
  const params = useSearchParams()
  const goalId = params.get("goal")
  const now = useNow()
  const today = isoDate(now)
  const events = useAppStore((s) => s.events)
  const experiences = useAppStore((s) => s.experiences)
  const pioneerType = useAppStore((s) => s.pioneerType)
  const customHours = useAppStore((s) => s.customMonthlyHours)
  const monthlyGoals = useAppStore((s) => s.monthlyGoals)
  const growth = useAppStore((s) => s.growth)
  const setGrowth = useAppStore((s) => s.setGrowth)
  const upsertEvent = useAppStore((s) => s.upsertEvent)
  const [goalOpen, setGoalOpen] = useState(false)
  const [goalPrefill, setGoalPrefill] = useState<Partial<SpiritualGoal> | undefined>()
  const [planGoalId, setPlanGoalId] = useState<string | null>(null)
  const [planSlots, setPlanSlots] = useState([{ weekday: "1", time: "19:00" }])
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null)
  const [editingBibleId, setEditingBibleId] = useState<string | null>(null)

  const year = useMemo(
    () =>
      calculateServiceYearProgress({
        events,
        pioneerType,
        customHours,
        monthlyGoals,
        now,
      }),
    [events, pioneerType, customHours, monthlyGoals, now]
  )
  const bible = calculateBibleReadingProgress(growth, now)
  const study = calculateStudyFrequency(growth, now)
  const goals = calculateGoalTotals(growth)
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
  const insights = generatePersonalInsights({
    events,
    growth,
    experiences,
    pioneerType,
    customHours,
    monthlyGoals,
    lang,
    now,
  })
  const selectedGoal = growth.goals.find((item) => item.id === goalId)
  const yesterday = isoDate(addDays(now, -1))
  const missedBible =
    !growth.bibleEntries.some((entry) => entry.date === yesterday && entry.completed) &&
    growth.bibleEntries.length > 0
  const monthReflection = growth.monthlyReflections.find(
    (item) => item.year === now.getFullYear() && item.month === now.getMonth()
  )
  const weekStart = isoDate(startOfWeek(now, { weekStartsOn: 1 }))
  const weekReflection = growth.weeklyReflections.find((item) => item.weekStart === weekStart)
  const yearLook = growth.yearReflections.find((item) => item.startYear === year.year.startYear)
  const jw = officialResources.find((item) => item.category === "study") ?? officialResources[0]

  function saveGrowth<K extends keyof typeof growth>(key: K, value: (typeof growth)[K]) {
    setGrowth({ [key]: value } as Partial<typeof growth>)
  }

  if (selectedGoal) {
    return (
      <GoalDetail
        goal={selectedGoal}
        onBack={() => router.push("/vorderingen/")}
        onChange={(next) => saveGrowth("goals", upsertById(growth.goals, next))}
        onDelete={() => {
          saveGrowth(
            "goals",
            growth.goals.filter((item) => item.id !== selectedGoal.id)
          )
          router.push("/vorderingen/")
        }}
        onPlan={() => setPlanGoalId(selectedGoal.id)}
        experiences={experiences}
        events={events}
      />
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">{t("progress.title")}</p>
          <h1 className="font-heading text-4xl">{t("progress.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("progress.subtitle")}</p>
          <p className="mt-1 text-sm text-primary">{t("progress.serviceYear", { label: year.year.label })}</p>
        </div>
        <Button variant="outline" onClick={() => printReport(t, year, bible, study, goals, month)}>
          <Printer className="size-4" />
          {t("progress.export")}
        </Button>
      </header>

      <section className="surface-primary rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <ProgressRing value={year.percent} label={formatPercent(year.percent)} caption={t("progress.serviceYear", { label: year.year.label })} />
          <div className="flex-1 space-y-3">
            <p className="font-heading text-4xl">
              {t("progress.hoursOf", { n: formatDecimal(year.completed, lang), t: year.target })}
            </p>
            <p className="text-sm text-muted-foreground">{t("progress.remaining", { n: formatDecimal(year.remaining, lang) })}</p>
            <div className="flex flex-wrap gap-2">
              {growth.focus.length === 0 ? (
                <span className="text-sm text-muted-foreground">{t("progress.chooseFocus")}</span>
              ) : (
                growth.focus.map((id) => (
                  <a
                    key={id}
                    href={`#progress-${id}`}
                    className="rounded-full bg-background/70 px-3 py-1 text-sm"
                  >
                    {t(`progress.focus.${id}`)}
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label={t("progress.card.service")} value={t("progress.hoursOf", { n: formatDecimal(month.completed, lang), t: month.target })} />
        <SummaryCard label={t("progress.card.bible")} value={`${bible.monthDays} / ${bible.monthTarget}`} />
        <SummaryCard label={t("progress.card.study")} value={t("progress.sessions", { n: study.monthSessions })} />
        <SummaryCard label={t("progress.card.goals")} value={t("progress.steps", { done: goals.stepDone, total: goals.stepTotal })} />
      </div>

      <Section title={t("progress.myFocus")} hint={t("progress.chooseFocus")} id="progress-focus">
        <div className="flex flex-wrap gap-2">
          {FOCUS_IDS.map((id) => {
            const active = growth.focus.includes(id)
            const disabled = !active && growth.focus.length >= 3
            return (
              <button
                key={id}
                type="button"
                disabled={disabled}
                onClick={() =>
                  saveGrowth(
                    "focus",
                    active ? growth.focus.filter((item) => item !== id) : [...growth.focus, id]
                  )
                }
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm",
                  active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
                  disabled && "opacity-40"
                )}
              >
                {t(`progress.focus.${id}`)}
              </button>
            )
          })}
        </div>
        {growth.focus.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {growth.focus.map((id) => (
              <a key={`focus-stat-${id}`} href={`#progress-${id}`} className="rounded-2xl border border-border p-3 text-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t(`progress.focus.${id}`)}</p>
                <p className="mt-1 font-medium">
                  {id === "bible_reading"
                    ? `${bible.monthDays} / ${bible.monthTarget}`
                    : id === "personal_study"
                      ? t("progress.sessions", { n: study.monthSessions })
                      : id === "ministry"
                        ? t("progress.skillsCount", { n: growth.skills.length })
                        : t("progress.activeGoals", { n: goals.active })}
                </p>
              </a>
            ))}
          </div>
        ) : null}
      </Section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Section title={t("progress.myYear")} id="progress-year">
            <p className="font-heading text-3xl">
              {t("progress.hoursOf", { n: formatDecimal(year.completed, lang), t: year.target })}
            </p>
            <p className="text-sm text-muted-foreground">{formatPercent(year.percent)}</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {year.months.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={cn(
                    "rounded-2xl border p-3 text-left text-sm",
                    selectedMonth?.year === item.year && selectedMonth?.month === item.month
                      ? "border-primary bg-primary/8"
                      : "border-border"
                  )}
                  onClick={() =>
                    setSelectedMonth(
                      selectedMonth?.year === item.year && selectedMonth?.month === item.month
                        ? null
                        : { year: item.year, month: item.month }
                    )
                  }
                >
                  <p className="capitalize text-muted-foreground">
                    {formatMonthTitle(new Date(item.year, item.month, 1), lang).split(" ")[0]}
                  </p>
                  <p className="mt-1 font-medium">
                    {formatDecimal(item.completed, lang)} / {item.target}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatPercent(item.percent)} · {t("progress.planned", { n: formatDecimal(item.planned, lang) })}
                  </p>
                </button>
              ))}
            </div>
            {selectedMonth ? (
              <MonthDetail
                year={selectedMonth.year}
                month={selectedMonth.month}
                events={events}
                growth={growth}
                experiences={experiences}
                pioneerType={pioneerType}
                customHours={customHours}
                monthlyGoals={monthlyGoals}
                lang={lang}
                t={t}
              />
            ) : null}
            <ol className="space-y-4 border-l border-border pl-4">
              {year.months.map((item) => {
                const summary = calculateMonthlySummary({
                  events,
                  growth,
                  experiences,
                  pioneerType,
                  customHours,
                  monthlyGoals,
                  year: item.year,
                  month: item.month,
                })
                return (
                  <li key={`tl-${item.key}`} className="text-sm">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {formatMonthTitle(new Date(item.year, item.month, 1), lang).split(" ")[0]}
                    </p>
                    <p className="font-medium">
                      {formatDecimal(item.completed, lang)} / {item.target} {t("common.hours")}
                    </p>
                    <p className="text-muted-foreground">
                      {t("progress.days", { n: summary.bibleDays })} · {t("progress.sessions", { n: summary.studySessions })} · {t("progress.activeGoals", { n: summary.activeGoals })}
                    </p>
                  </li>
                )
              })}
            </ol>
          </Section>

          <Section title={t("progress.myGoals")} id="progress-goals">
            <Button onClick={() => { setGoalPrefill(undefined); setGoalOpen(true) }}>
              {t("progress.newGoal")}
            </Button>
            {growth.goals.length === 0 ? (
              <Empty title={t("progress.emptyGoals")} hint={t("progress.emptyGoalsHint")} />
            ) : (
              <div className="grid gap-3">
                {growth.goals.map((goal) => {
                  const progress = goalProgress(goal)
                  return (
                    <article key={goal.id} className="rounded-2xl border border-border p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t(`progress.cat.${goal.category}`)} · {t(`progress.status.${goal.status}`)}
                      </p>
                      <h3 className="font-heading mt-1 text-2xl">{goal.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t("progress.steps", { done: progress.done, total: progress.total })}
                      </p>
                      <Button variant="ghost" size="sm" className="mt-2" onClick={() => router.push(`/vorderingen/?goal=${goal.id}`)}>
                        {t("follow.open")}
                      </Button>
                    </article>
                  )
                })}
              </div>
            )}
          </Section>

          <Section title={t("progress.bible")} id="progress-bible_reading" collapsible>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <Label>{t("progress.biblePlan")}</Label>
                <select
                  className={selectClass}
                  value={growth.biblePlan.kind}
                  onChange={(e) =>
                    saveGrowth("biblePlan", { ...growth.biblePlan, kind: e.target.value as typeof growth.biblePlan.kind })
                  }
                >
                  <option value="own">{t("progress.plan.own")}</option>
                  <option value="chronological">{t("progress.plan.chronological")}</option>
                  <option value="whole_bible">{t("progress.plan.whole_bible")}</option>
                  <option value="custom">{t("progress.plan.custom")}</option>
                </select>
              </label>
              <p className="self-end text-sm text-muted-foreground">
                {t("progress.thisMonth")}: {bible.monthDays} / {bible.monthTarget}
              </p>
            </div>
            {bible.current ? <p className="text-sm">{t("progress.biblePlan")}: {bible.current}</p> : null}
            {bible.latest ? (
              <p className="text-sm text-muted-foreground">
                {t("progress.lastReading")}: {formatHumanDate(parseDate(bible.latest.date), lang)}
              </p>
            ) : null}
            {missedBible ? (
              <div className="rounded-2xl border border-border p-3">
                <p>{t("progress.missed")}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={() => saveGrowth("bibleEntries", [emptyBibleEntry(today), ...growth.bibleEntries])}>
                    {t("progress.continueToday")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => saveGrowth("biblePlan", { ...growth.biblePlan, kind: "own" })}>
                    {t("progress.adjustPlan")}
                  </Button>
                </div>
              </div>
            ) : null}
            <BibleForm
              key={editingBibleId ?? "new-bible"}
              initial={editingBibleId ? growth.bibleEntries.find((item) => item.id === editingBibleId) : undefined}
              onSave={(entry) => {
                saveGrowth("bibleEntries", upsertById(growth.bibleEntries, entry))
                setEditingBibleId(null)
              }}
            />
            {growth.bibleEntries.length === 0 ? <Empty title={t("progress.emptyBible")} /> : (
              <ul className="space-y-2">
                {growth.bibleEntries.slice(0, 8).map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between gap-2 rounded-2xl border border-border px-3 py-2 text-sm">
                    <span>
                      {entry.date} · {entry.book} {entry.chapterStart}
                      {entry.chapterEnd ? `–${entry.chapterEnd}` : ""}
                    </span>
                    <div className="flex shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => setEditingBibleId(entry.id)}>
                        {t("progress.edit")}
                      </Button>
                      <ConfirmDeleteButton
                        title={t("activity.delete")}
                        description={t("progress.deleteConfirm")}
                        onConfirm={() => saveGrowth("bibleEntries", growth.bibleEntries.filter((item) => item.id !== entry.id))}
                      >
                        {t("activity.delete")}
                      </ConfirmDeleteButton>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={t("progress.study")} id="progress-personal_study" collapsible>
            <StudyForm
              onSave={(session) => saveGrowth("studySessions", upsertById(growth.studySessions, session))}
            />
            {growth.studySessions.length === 0 ? <Empty title={t("progress.emptyStudy")} /> : (
              <ul className="space-y-2">
                {growth.studySessions.slice(0, 6).map((session) => (
                  <li key={session.id} className="flex items-center justify-between gap-2 rounded-2xl border border-border p-3 text-sm">
                    <span>
                      {session.date} · {session.title || t(`progress.studyCat.${session.category}`)} · {session.durationMinutes}m
                    </span>
                    <ConfirmDeleteButton
                      title={t("activity.delete")}
                      description={t("progress.deleteConfirm")}
                      onConfirm={() =>
                        saveGrowth(
                          "studySessions",
                          growth.studySessions.filter((item) => item.id !== session.id)
                        )
                      }
                    >
                      {t("activity.delete")}
                    </ConfirmDeleteButton>
                  </li>
                ))}
              </ul>
            )}
            <h3 className="font-heading pt-2 text-xl">{t("progress.projects")}</h3>
            <Button
              variant="outline"
              onClick={() => saveGrowth("studyProjects", [emptyProject(), ...growth.studyProjects])}
            >
              {t("progress.addProject")}
            </Button>
            {growth.studyProjects.map((project) => (
              <article key={project.id} className="rounded-2xl border border-border p-4">
                <Input
                  value={project.title}
                  placeholder={t("progress.goalTitle")}
                  onChange={(e) =>
                    saveGrowth("studyProjects", upsertById(growth.studyProjects, { ...project, title: e.target.value, updatedAt: new Date().toISOString() }))
                  }
                />
                <Textarea
                  className="mt-2 min-h-16"
                  placeholder={t("progress.description")}
                  value={project.description}
                  onChange={(e) =>
                    saveGrowth("studyProjects", upsertById(growth.studyProjects, { ...project, description: e.target.value, updatedAt: new Date().toISOString() }))
                  }
                />
                <Textarea
                  className="mt-2 min-h-16"
                  placeholder={t("progress.projectGoal")}
                  value={project.goal}
                  onChange={(e) =>
                    saveGrowth("studyProjects", upsertById(growth.studyProjects, { ...project, goal: e.target.value, updatedAt: new Date().toISOString() }))
                  }
                />
                <Textarea
                  className="mt-2 min-h-16"
                  placeholder={t("progress.sources")}
                  value={project.sources}
                  onChange={(e) =>
                    saveGrowth("studyProjects", upsertById(growth.studyProjects, { ...project, sources: e.target.value, updatedAt: new Date().toISOString() }))
                  }
                />
                <div className="mt-3 space-y-2">
                  {project.topics.map((topic) => (
                    <label key={topic.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={topic.done}
                        onCheckedChange={(checked) =>
                          saveGrowth(
                            "studyProjects",
                            upsertById(growth.studyProjects, {
                              ...project,
                              topics: project.topics.map((item) =>
                                item.id === topic.id ? { ...item, done: Boolean(checked) } : item
                              ),
                              updatedAt: new Date().toISOString(),
                            })
                          )
                        }
                      />
                      {topic.title}
                    </label>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const title = window.prompt(t("progress.addTopic")) ?? ""
                      if (!title.trim()) return
                      saveGrowth(
                        "studyProjects",
                        upsertById(growth.studyProjects, {
                          ...project,
                          topics: [...project.topics, { id: crypto.randomUUID(), title, done: false }],
                          updatedAt: new Date().toISOString(),
                        })
                      )
                    }}
                  >
                    {t("progress.addTopic")}
                  </Button>
                </div>
              </article>
            ))}
            <p className="text-xs text-muted-foreground">
              {t("progress.fromJw")}:{" "}
              <a href={jw.sourceUrl} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
                {jw.title}
              </a>
              {" · "}
              {jw.summary}{" "}
              <a href={JW_ORG_LIBRARY} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
                JW.org
              </a>
            </p>
            <p className="text-xs text-muted-foreground">{t("progress.appTip")}: {t("progress.emptyGoalsHint")}</p>
          </Section>

          <Section title={t("progress.skills")} id="progress-ministry" collapsible>
            <Button
              variant="outline"
              onClick={() =>
                saveGrowth("skills", [
                  {
                    id: crypto.randomUUID(),
                    category: "listening",
                    title: t("progress.skill.listening"),
                    aim: "",
                    nextStep: "",
                    wentWell: "",
                    workOn: "",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                  ...growth.skills,
                ])
              }
            >
              {t("progress.addSkill")}
            </Button>
            {growth.skills.map((skill) => (
              <article key={skill.id} className="space-y-2 rounded-2xl border border-border p-4">
                <select
                  className={selectClass}
                  value={skill.category}
                  onChange={(e) =>
                    saveGrowth(
                      "skills",
                      upsertById(growth.skills, {
                        ...skill,
                        category: e.target.value as SkillCategory,
                        title: t(`progress.skill.${e.target.value}`),
                        updatedAt: new Date().toISOString(),
                      })
                    )
                  }
                >
                  {skillCats.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`progress.skill.${cat}`)}
                    </option>
                  ))}
                </select>
                <Textarea className="min-h-16" placeholder={t("progress.skillAim")} value={skill.aim} onChange={(e) => saveGrowth("skills", upsertById(growth.skills, { ...skill, aim: e.target.value, updatedAt: new Date().toISOString() }))} />
                <Textarea className="min-h-16" placeholder={t("progress.skillNext")} value={skill.nextStep} onChange={(e) => saveGrowth("skills", upsertById(growth.skills, { ...skill, nextStep: e.target.value, updatedAt: new Date().toISOString() }))} />
                <Textarea className="min-h-16" placeholder={t("progress.wentWell")} value={skill.wentWell} onChange={(e) => saveGrowth("skills", upsertById(growth.skills, { ...skill, wentWell: e.target.value, updatedAt: new Date().toISOString() }))} />
                <Textarea className="min-h-16" placeholder={t("progress.workOn")} value={skill.workOn} onChange={(e) => saveGrowth("skills", upsertById(growth.skills, { ...skill, workOn: e.target.value, updatedAt: new Date().toISOString() }))} />
              </article>
            ))}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title={t("progress.thisMonth")} id="progress-month">
            <p>{t("progress.hoursOf", { n: formatDecimal(month.completed, lang), t: month.target })}</p>
            <p className="text-sm text-muted-foreground">{t("progress.days", { n: month.bibleDays })} · {t("progress.sessions", { n: month.studySessions })}</p>
            <p className="text-sm text-muted-foreground">{t("progress.activeGoals", { n: month.activeGoals })}</p>
          </Section>
          <Section title={t("progress.insights")}>
            {insights.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("progress.emptyReflection")}</p>
            ) : (
              <ul className="space-y-2 text-sm leading-relaxed">
                {insights.map((item) => (
                  <li key={item.key}>{t(item.key, item.vars)}</li>
                ))}
              </ul>
            )}
          </Section>
          <Section title={t("progress.myMonth")}>
            {monthReflection?.learned ? (
              <p className="text-sm leading-relaxed">{monthReflection.learned}</p>
            ) : (
              <Empty title={t("progress.emptyReflection")} />
            )}
            <MonthlyForm
              value={monthReflection}
              onSave={(item) => saveGrowth("monthlyReflections", upsertById(growth.monthlyReflections, item))}
            />
          </Section>
          <Section title={t("progress.weekly")}>
            <WeeklyForm
              weekStart={weekStart}
              value={weekReflection}
              onSave={(item) => saveGrowth("weeklyReflections", upsertById(growth.weeklyReflections, item))}
            />
          </Section>
          <Section title={t("nav.experiences")} id="progress-experiences" collapsible>
            {experiences[0] ? (
              <Link href="/ervaringen/" className="block text-sm hover:text-primary">
                {experiences[0].title}
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">{t("exp.empty")}</p>
            )}
          </Section>
        </div>
      </div>

      <Section title={t("progress.routines")} id="progress-routines" collapsible>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              saveGrowth("routines", [
                ...ROUTINE_TEMPLATES.map((item) => emptyRoutine(t(item.titleKey), item.items.map((key) => t(key)))),
                ...growth.routines,
              ])
            }
          >
            {t("progress.useTemplates")}
          </Button>
          <Button variant="outline" onClick={() => saveGrowth("routines", [emptyRoutine(t("progress.myRoutine"), [t("progress.routine.reflect")]), ...growth.routines])}>
            {t("progress.addRoutine")}
          </Button>
        </div>
        {growth.routines.map((routine) => (
          <article key={routine.id} className="mt-3 rounded-2xl border border-border p-4">
            <Input
              value={routine.title}
              onChange={(e) =>
                saveGrowth(
                  "routines",
                  upsertById(growth.routines, { ...routine, title: e.target.value, updatedAt: new Date().toISOString() })
                )
              }
            />
            <p className="mb-2 mt-2 text-xs text-muted-foreground">{t("progress.myRoutine")}</p>
            <div className="space-y-2">
              {routine.items.map((item) => {
                const checked = growth.routineChecks.some(
                  (check) => check.routineId === routine.id && check.itemId === item.id && check.date === today
                )
                return (
                  <label key={item.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => {
                        if (value) {
                          saveGrowth("routineChecks", [
                            { id: crypto.randomUUID(), routineId: routine.id, itemId: item.id, date: today },
                            ...growth.routineChecks,
                          ])
                        } else {
                          saveGrowth(
                            "routineChecks",
                            growth.routineChecks.filter(
                              (check) =>
                                !(check.routineId === routine.id && check.itemId === item.id && check.date === today)
                            )
                          )
                        }
                      }}
                    />
                    {item.title}
                  </label>
                )
              })}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const title = window.prompt(t("progress.addStep")) ?? ""
                  if (!title.trim()) return
                  saveGrowth(
                    "routines",
                    upsertById(growth.routines, {
                      ...routine,
                      items: [...routine.items, { id: crypto.randomUUID(), title }],
                      updatedAt: new Date().toISOString(),
                    })
                  )
                }}
              >
                {t("progress.addStep")}
              </Button>
            </div>
          </article>
        ))}
      </Section>

      <Section title={t("progress.meeting")} id="progress-meeting" collapsible>
        {(() => {
          const prep =
            growth.meetingPrep.find((item) => item.date === today) ?? {
              id: `meeting-${today}`,
              date: today,
              prepared: false,
              scripturesRead: false,
              answerReady: false,
              extraResearch: false,
            }
          const toggle = (field: "prepared" | "scripturesRead" | "answerReady" | "extraResearch") =>
            saveGrowth("meetingPrep", upsertById(growth.meetingPrep, { ...prep, [field]: !prep[field] }))
          return (
            <div className="grid gap-2 sm:grid-cols-2">
              <CheckLine label={t("progress.meeting.prepared")} checked={prep.prepared} onChange={() => toggle("prepared")} />
              <CheckLine label={t("progress.meeting.scriptures")} checked={prep.scripturesRead} onChange={() => toggle("scripturesRead")} />
              <CheckLine label={t("progress.meeting.answer")} checked={prep.answerReady} onChange={() => toggle("answerReady")} />
              <CheckLine label={t("progress.meeting.extra")} checked={prep.extraResearch} onChange={() => toggle("extraResearch")} />
            </div>
          )
        })()}
      </Section>

      <Section title={t("progress.story")} id="progress-story" collapsible>
        <GrowthTimeline experiences={experiences} growth={growth} lang={lang} t={t} />
      </Section>

      <Section title={t("progress.library")} id="progress-library" collapsible>
        {GOAL_LIBRARY.map((group) => (
          <div key={group.category} className="mb-4">
            <h3 className="font-heading text-xl">{t(`progress.library.${group.category}`)}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.keys.map((key) => (
                <button
                  key={key}
                  type="button"
                  className="rounded-full border border-border px-3 py-1 text-sm hover:border-primary hover:text-primary"
                  onClick={() => {
                    setGoalPrefill({ title: t(`progress.library.${group.category}.${key}`) })
                    setGoalOpen(true)
                  }}
                >
                  {t(`progress.library.${group.category}.${key}`)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section title={t("progress.yearLookback")} id="progress-year-look" collapsible>
        <YearLookForm
          startYear={year.year.startYear}
          value={yearLook}
          onSave={(item) => saveGrowth("yearReflections", upsertById(growth.yearReflections, item))}
        />
      </Section>

      <GoalDialog
        open={goalOpen}
        onClose={() => setGoalOpen(false)}
        initial={goalPrefill}
        onSaved={(goal) => {
          if (goal.frequency !== "once") {
            setPlanSlots([{ weekday: "1", time: "19:00" }])
            setPlanGoalId(goal.id)
          }
        }}
      />

      {planGoalId ? (
        <div className="fixed inset-0 z-40 grid place-items-end bg-black/20 p-4 sm:place-items-center">
          <div
            role="dialog"
            aria-labelledby="plan-goal-title"
            className="card-quiet w-full max-w-md space-y-3 rounded-3xl p-6"
          >
            <p id="plan-goal-title">{t("progress.planCalendar")}</p>
            <div className="space-y-2">
              {planSlots.map((slot, index) => (
                <div key={`${slot.weekday}-${index}`} className="grid grid-cols-2 gap-3">
                  <label className="grid gap-1">
                    <span className="text-xs text-muted-foreground">{t("progress.planDay")}</span>
                    <select
                      className={selectClass}
                      value={slot.weekday}
                      onChange={(e) =>
                        setPlanSlots(
                          planSlots.map((item, i) => (i === index ? { ...item, weekday: e.target.value } : item))
                        )
                      }
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <option key={day} value={String(day)}>
                          {t(`weekday.${day}`)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs text-muted-foreground">{t("progress.planTime")}</span>
                    <Input
                      type="time"
                      value={slot.time}
                      onChange={(e) =>
                        setPlanSlots(planSlots.map((item, i) => (i === index ? { ...item, time: e.target.value } : item)))
                      }
                    />
                  </label>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPlanSlots([...planSlots, { weekday: "3", time: "19:00" }])}
              >
                {t("progress.addSlot")}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const goal = growth.goals.find((item) => item.id === planGoalId)
                  if (!goal) return
                  const ids: string[] = []
                  for (const slot of planSlots) {
                    const date = nextWeekday(startOfWeek(now, { weekStartsOn: 1 }), Number(slot.weekday))
                    for (let i = 0; i < 8; i++) {
                      const stamp = addWeeks(date, i)
                      const id = crypto.randomUUID()
                      ids.push(id)
                      upsertEvent({
                        id,
                        title: t("progress.eventTitle", { title: goal.title }),
                        category: "personal",
                        date: isoDate(stamp),
                        startTime: slot.time,
                        endTime: endTimeFromDuration(slot.time, 1),
                        durationMinutes: 60,
                        status: "planned",
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      })
                    }
                  }
                  saveGrowth(
                    "goals",
                    upsertById(growth.goals, { ...goal, eventIds: [...goal.eventIds, ...ids], updatedAt: new Date().toISOString() })
                  )
                  setPlanGoalId(null)
                }}
              >
                {t("progress.addTimes")}
              </Button>
              <Button variant="outline" onClick={() => setPlanGoalId(null)}>
                {t("progress.notNow")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function GoalDetail({
  goal,
  onBack,
  onChange,
  onDelete,
  onPlan,
  experiences,
  events,
}: {
  goal: SpiritualGoal
  onBack: () => void
  onChange: (goal: SpiritualGoal) => void
  onDelete: () => void
  onPlan: () => void
  experiences: { id: string; title: string }[]
  events: CalendarEvent[]
}) {
  const t = useT()
  const progress = goalProgress(goal)
  const linked = experiences.filter((item) => goal.experienceIds.includes(item.id))
  const linkedEvents = events.filter((item) => goal.eventIds.includes(item.id))

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="size-4" />
        {t("progress.back")}
      </Button>
      <header>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {t(`progress.cat.${goal.category}`)} · {t(`progress.status.${goal.status}`)}
        </p>
        <h1 className="font-heading text-4xl">{goal.title}</h1>
      </header>
      <select
        className={selectClass}
        value={goal.status}
        onChange={(e) => onChange({ ...goal, status: e.target.value as GoalStatus, updatedAt: new Date().toISOString() })}
      >
        <option value="active">{t("progress.status.active")}</option>
        <option value="paused">{t("progress.status.paused")}</option>
        <option value="completed">{t("progress.status.completed")}</option>
        <option value="released">{t("progress.status.released")}</option>
      </select>
      {goal.status === "released" ? (
        <Textarea
          placeholder={t("progress.releaseWhy")}
          value={goal.releasedWhy ?? ""}
          onChange={(e) => onChange({ ...goal, releasedWhy: e.target.value, updatedAt: new Date().toISOString() })}
        />
      ) : null}
      {goal.reason ? <p className="text-sm leading-relaxed">{goal.reason}</p> : null}
      <Section title={t("progress.stepsTitle")}>
        <p className="text-sm text-muted-foreground">{t("progress.steps", { done: progress.done, total: progress.total })}</p>
        {goal.steps.map((step) => (
          <label key={step.id} className="flex items-center gap-2">
            <Checkbox
              checked={step.completed}
              onCheckedChange={(checked) =>
                onChange({
                  ...goal,
                  steps: goal.steps.map((item) =>
                    item.id === step.id
                      ? { ...item, completed: Boolean(checked), completedAt: checked ? new Date().toISOString() : undefined }
                      : item
                  ),
                  updatedAt: new Date().toISOString(),
                })
              }
            />
            <span className={step.completed ? "line-through opacity-60" : undefined}>{step.title}</span>
          </label>
        ))}
        <Button
          variant="outline"
          onClick={() => {
            const title = window.prompt(t("progress.addStep")) ?? ""
            if (!title.trim()) return
            onChange({
              ...goal,
              steps: [...goal.steps, emptyStep(title, goal.steps.length)],
              updatedAt: new Date().toISOString(),
            })
          }}
        >
          <Plus className="size-4" />
          {t("progress.addStep")}
        </Button>
      </Section>
      <Section title={t("progress.notes")}>
        <Textarea
          className="min-h-28"
          value={goal.notes}
          onChange={(e) => onChange({ ...goal, notes: e.target.value, updatedAt: new Date().toISOString() })}
        />
      </Section>
      <Section title={t("progress.linkedExp")}>
        {linked.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("exp.empty")}</p>
        ) : (
          linked.map((item) => (
            <Link key={item.id} href="/ervaringen/" className="block text-sm hover:text-primary">
              {item.title}
            </Link>
          ))
        )}
      </Section>
      <Section title={t("progress.linkedCal")}>
        {linkedEvents.length === 0 ? (
          <Button variant="outline" onClick={onPlan}>{t("progress.planCalendar")}</Button>
        ) : (
          linkedEvents.map((item) => (
            <p key={item.id} className="text-sm">{item.date} · {item.startTime} · {item.title}</p>
          ))
        )}
      </Section>
      <ConfirmDeleteButton
        title={t("activity.delete")}
        description={t("progress.deleteGoalConfirm")}
        onConfirm={onDelete}
      >
        {t("activity.delete")}
      </ConfirmDeleteButton>
    </div>
  )
}

function BibleForm({
  onSave,
  initial,
}: {
  onSave: (entry: ReturnType<typeof emptyBibleEntry>) => void
  initial?: ReturnType<typeof emptyBibleEntry>
}) {
  const t = useT()
  const [entry, setEntry] = useState(() => initial ?? emptyBibleEntry(isoDate(new Date())))
  return (
    <form
      className="grid gap-3 rounded-2xl border border-border p-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ ...entry, updatedAt: new Date().toISOString() })
        setEntry(emptyBibleEntry(isoDate(new Date())))
      }}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Input type="date" value={entry.date} onChange={(e) => setEntry({ ...entry, date: e.target.value })} />
        <Input placeholder={t("progress.book")} value={entry.book} onChange={(e) => setEntry({ ...entry, book: e.target.value })} />
        <Input placeholder={t("progress.chapterStart")} value={entry.chapterStart} onChange={(e) => setEntry({ ...entry, chapterStart: e.target.value })} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input placeholder={t("progress.chapterEnd")} value={entry.chapterEnd} onChange={(e) => setEntry({ ...entry, chapterEnd: e.target.value })} />
        <Input type="number" min={0} placeholder={t("progress.duration")} value={entry.durationMinutes || ""} onChange={(e) => setEntry({ ...entry, durationMinutes: Number(e.target.value) || 0 })} />
      </div>
      <Textarea placeholder={t("progress.noticed")} value={entry.noticed ?? ""} onChange={(e) => setEntry({ ...entry, noticed: e.target.value })} />
      <Textarea placeholder={t("progress.remember")} value={entry.remember ?? ""} onChange={(e) => setEntry({ ...entry, remember: e.target.value })} />
      <Textarea placeholder={t("progress.apply")} value={entry.apply ?? ""} onChange={(e) => setEntry({ ...entry, apply: e.target.value })} />
      <Button type="submit">{t("progress.addReading")}</Button>
    </form>
  )
}

function StudyForm({ onSave }: { onSave: (session: ReturnType<typeof emptyStudySession>) => void }) {
  const t = useT()
  const [session, setSession] = useState(emptyStudySession(isoDate(new Date())))
  return (
    <form
      className="grid gap-3 rounded-2xl border border-border p-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ ...session, updatedAt: new Date().toISOString() })
        setSession(emptyStudySession(isoDate(new Date())))
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Input type="date" value={session.date} onChange={(e) => setSession({ ...session, date: e.target.value })} />
        <Input type="number" min={1} value={session.durationMinutes} onChange={(e) => setSession({ ...session, durationMinutes: Number(e.target.value) || 1 })} />
      </div>
      <Input placeholder={t("progress.goalTitle")} value={session.title} onChange={(e) => setSession({ ...session, title: e.target.value })} />
      <select className={selectClass} value={session.category} onChange={(e) => setSession({ ...session, category: e.target.value as StudyCategory })}>
        {studyCats.map((cat) => (
          <option key={cat} value={cat}>{t(`progress.studyCat.${cat}`)}</option>
        ))}
      </select>
      <Textarea placeholder={t("progress.learned")} value={session.learned ?? ""} onChange={(e) => setSession({ ...session, learned: e.target.value })} />
      <Textarea placeholder={t("progress.aboutJehovah")} value={session.aboutJehovah ?? ""} onChange={(e) => setSession({ ...session, aboutJehovah: e.target.value })} />
      <Textarea placeholder={t("progress.apply")} value={session.apply ?? ""} onChange={(e) => setSession({ ...session, apply: e.target.value })} />
      <Textarea placeholder={t("progress.ministryUse")} value={session.ministryUse ?? ""} onChange={(e) => setSession({ ...session, ministryUse: e.target.value })} />
      <Button type="submit">{t("progress.addStudy")}</Button>
    </form>
  )
}

function MonthlyForm({
  value,
  onSave,
}: {
  value?: { id: string; year: number; month: number; gratitude: string; learned: string; ministry: string; workOn: string; remember: string; nextMonth: string; createdAt: string; updatedAt: string }
  onSave: (item: NonNullable<typeof value>) => void
}) {
  const t = useT()
  const now = new Date()
  const [draft, setDraft] = useState(
    value ?? {
      id: crypto.randomUUID(),
      year: now.getFullYear(),
      month: now.getMonth(),
      gratitude: "",
      learned: "",
      ministry: "",
      workOn: "",
      remember: "",
      nextMonth: "",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }
  )
  return (
    <div className="grid gap-2">
      <Textarea placeholder={t("progress.gratitude")} value={draft.gratitude} onChange={(e) => setDraft({ ...draft, gratitude: e.target.value })} />
      <Textarea placeholder={t("progress.learned")} value={draft.learned} onChange={(e) => setDraft({ ...draft, learned: e.target.value })} />
      <Textarea placeholder={t("progress.ministryWent")} value={draft.ministry} onChange={(e) => setDraft({ ...draft, ministry: e.target.value })} />
      <Textarea placeholder={t("progress.workOn")} value={draft.workOn} onChange={(e) => setDraft({ ...draft, workOn: e.target.value })} />
      <Textarea placeholder={t("progress.remember")} value={draft.remember} onChange={(e) => setDraft({ ...draft, remember: e.target.value })} />
      <Textarea placeholder={t("progress.nextMonth")} value={draft.nextMonth} onChange={(e) => setDraft({ ...draft, nextMonth: e.target.value })} />
      <Button onClick={() => onSave({ ...draft, updatedAt: new Date().toISOString() })}>{t("activity.save")}</Button>
    </div>
  )
}

function WeeklyForm({
  weekStart,
  value,
  onSave,
}: {
  weekStart: string
  value?: { id: string; weekStart: string; wentWell: string; hard: string; remember: string; nextWeek: string; createdAt: string; updatedAt: string }
  onSave: (item: NonNullable<typeof value>) => void
}) {
  const t = useT()
  const now = new Date().toISOString()
  const [draft, setDraft] = useState(
    value ?? { id: crypto.randomUUID(), weekStart, wentWell: "", hard: "", remember: "", nextWeek: "", createdAt: now, updatedAt: now }
  )
  return (
    <div className="grid gap-2">
      <Textarea placeholder={t("progress.wentWell")} value={draft.wentWell} onChange={(e) => setDraft({ ...draft, wentWell: e.target.value })} />
      <Textarea placeholder={t("progress.hard")} value={draft.hard} onChange={(e) => setDraft({ ...draft, hard: e.target.value })} />
      <Textarea placeholder={t("progress.remember")} value={draft.remember} onChange={(e) => setDraft({ ...draft, remember: e.target.value })} />
      <Textarea placeholder={t("progress.nextWeek")} value={draft.nextWeek} onChange={(e) => setDraft({ ...draft, nextWeek: e.target.value })} />
      <Button onClick={() => onSave({ ...draft, weekStart, updatedAt: new Date().toISOString() })}>{t("activity.save")}</Button>
    </div>
  )
}

function YearLookForm({
  startYear,
  value,
  onSave,
}: {
  startYear: number
  value?: { id: string; startYear: number; learned: string; grown: string; remember: string; nextYear: string; createdAt: string; updatedAt: string }
  onSave: (item: NonNullable<typeof value>) => void
}) {
  const t = useT()
  const now = new Date().toISOString()
  const [draft, setDraft] = useState(
    value ?? { id: crypto.randomUUID(), startYear, learned: "", grown: "", remember: "", nextYear: "", createdAt: now, updatedAt: now }
  )
  return (
    <div className="grid gap-2">
      <Textarea placeholder={t("progress.yearLearned")} value={draft.learned} onChange={(e) => setDraft({ ...draft, learned: e.target.value })} />
      <Textarea placeholder={t("progress.yearGrown")} value={draft.grown} onChange={(e) => setDraft({ ...draft, grown: e.target.value })} />
      <Textarea placeholder={t("progress.yearRemember")} value={draft.remember} onChange={(e) => setDraft({ ...draft, remember: e.target.value })} />
      <Textarea placeholder={t("progress.yearNext")} value={draft.nextYear} onChange={(e) => setDraft({ ...draft, nextYear: e.target.value })} />
      <Button onClick={() => onSave({ ...draft, startYear, updatedAt: new Date().toISOString() })}>{t("activity.save")}</Button>
    </div>
  )
}

function GrowthTimeline({
  experiences,
  growth,
  lang,
  t,
}: {
  experiences: { id: string; title: string; date: string }[]
  growth: ReturnType<typeof useAppStore.getState>["growth"]
  lang: "nl" | "en" | "es" | "pap"
  t: (key: string) => string
}) {
  const items = [
    ...growth.goals.map((goal) => ({ date: goal.startDate, text: `${t("progress.story.goal")} — ${goal.title}` })),
    ...growth.goals.filter((goal) => goal.status === "completed").map((goal) => ({ date: goal.updatedAt.slice(0, 10), text: `${t("progress.story.goalDone")} — ${goal.title}` })),
    ...growth.bibleEntries.slice(0, 8).map((entry) => ({ date: entry.date, text: `${t("progress.story.bible")} — ${entry.book} ${entry.chapterStart}` })),
    ...experiences.slice(0, 8).map((item) => ({ date: item.date, text: `${t("progress.story.experience")} — ${item.title}` })),
    ...growth.studyProjects.map((item) => ({ date: item.startDate, text: `${t("progress.story.project")} — ${item.title}` })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 16)
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{t("progress.emptyGoals")}</p>
  return (
    <ol className="space-y-3">
      {items.map((item, index) => (
        <li key={`${item.date}-${index}`} className="border-l border-border pl-4 text-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {formatHumanDate(parseDate(item.date), lang)}
          </p>
          <p>{item.text}</p>
        </li>
      ))}
    </ol>
  )
}

function Section({
  title,
  hint,
  children,
  id,
  collapsible = false,
}: {
  title: string
  hint?: string
  children: React.ReactNode
  id?: string
  collapsible?: boolean
}) {
  const heading = (
    <div>
      <h2 className="font-heading text-2xl">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  )
  if (collapsible) {
    return (
      <details id={id} className="card-quiet rounded-3xl p-6" open>
        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          {heading}
        </summary>
        <div className="mt-4 space-y-4">{children}</div>
      </details>
    )
  }
  return (
    <section id={id} className="card-quiet space-y-4 rounded-3xl p-6">
      {heading}
      {children}
    </section>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="card-quiet rounded-3xl p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-heading mt-2 text-2xl">{value}</p>
    </article>
  )
}

function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center">
      <p>{title}</p>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function CheckLine({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={() => onChange()} />
      {label}
    </label>
  )
}

function nextWeekday(from: Date, weekday: number) {
  const target = weekday === 7 ? 0 : weekday
  const copy = new Date(from)
  const delta = (target - copy.getDay() + 7) % 7
  copy.setDate(copy.getDate() + delta)
  return copy
}

function MonthDetail({
  year,
  month,
  events,
  growth,
  experiences,
  pioneerType,
  customHours,
  monthlyGoals,
  lang,
  t,
}: {
  year: number
  month: number
  events: CalendarEvent[]
  growth: ReturnType<typeof useAppStore.getState>["growth"]
  experiences: { date: string }[]
  pioneerType: Parameters<typeof calculateMonthlySummary>[0]["pioneerType"]
  customHours: number
  monthlyGoals: Parameters<typeof calculateMonthlySummary>[0]["monthlyGoals"]
  lang: "nl" | "en" | "es" | "pap"
  t: (key: string, vars?: Record<string, string | number>) => string
}) {
  const summary = calculateMonthlySummary({
    events,
    growth,
    experiences,
    pioneerType,
    customHours,
    monthlyGoals,
    year,
    month,
  })
  return (
    <div className="rounded-2xl border border-border p-4 text-sm">
      <p className="font-heading text-xl capitalize">
        {formatMonthTitle(new Date(year, month, 1), lang)}
      </p>
      <p className="mt-2">{t("progress.hoursOf", { n: formatDecimal(summary.completed, lang), t: summary.target })}</p>
      <p className="text-muted-foreground">{t("progress.planned", { n: formatDecimal(summary.planned, lang) })}</p>
      <p className="text-muted-foreground">{t("progress.days", { n: summary.bibleDays })}</p>
      <p className="text-muted-foreground">{t("progress.sessions", { n: summary.studySessions })}</p>
      <p className="text-muted-foreground">{t("progress.activeGoals", { n: summary.activeGoals })}</p>
      <p className="text-muted-foreground">{t("progress.experiencesCount", { n: summary.experiences })}</p>
      {summary.reflection?.learned ? <p className="mt-2 leading-relaxed">{summary.reflection.learned}</p> : null}
    </div>
  )
}

function printReport(
  t: (key: string, vars?: Record<string, string | number>) => string,
  year: ReturnType<typeof calculateServiceYearProgress>,
  bible: ReturnType<typeof calculateBibleReadingProgress>,
  study: ReturnType<typeof calculateStudyFrequency>,
  goals: ReturnType<typeof calculateGoalTotals>,
  month: ReturnType<typeof calculateMonthlySummary>
) {
  const popup = window.open("", "_blank")
  if (!popup) return
  popup.document.write(`<!doctype html><html><head><title>${t("progress.title")}</title>
    <style>body{font-family:Georgia,serif;background:#F7F5EF;color:#252925;padding:48px;max-width:720px;margin:auto}h1{font-weight:500}</style>
    </head><body>
    <h1>${t("progress.title")}</h1>
    <p>${t("progress.serviceYear", { label: year.year.label })}</p>
    <p>${year.completed} / ${year.target}</p>
    <p>${t("progress.card.bible")}: ${bible.monthDays}</p>
    <p>${t("progress.card.study")}: ${study.monthSessions}</p>
    <p>${t("progress.myGoals")}: ${goals.completed} / ${goals.started}</p>
    <p>${t("progress.thisMonth")}: ${month.completed} / ${month.target}</p>
    </body></html>`)
  popup.document.close()
  popup.focus()
  popup.print()
}
