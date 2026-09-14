"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { calculateCompletedHours } from "@/lib/calculations"
import {
  generateSuggestedSchedule,
  suggestWeekFill,
  type PlannerInput,
} from "@/lib/planner/algorithm"
import { formatDecimal, formatHoursShort } from "@/lib/format"
import {
  formatWeekdayLong,
  isoDate,
  parseDate,
  weekDays,
} from "@/lib/dates"
import { useMonthSnapshot } from "@/lib/hooks"
import { useT, useLang } from "@/lib/i18n"
import { useAppStore, useCurrentTarget } from "@/lib/store"
import { useUiStore } from "@/lib/ui-store"
import { DEFAULT_AUXILIARY_HOURS, DEFAULT_REGULAR_HOURS } from "@/lib/constants"
import type {
  AvailabilitySlot,
  DayPart,
  PioneerTypeId,
  PlanningStyle,
  SessionPreference,
  SuggestedOption,
} from "@/types"
import { StartTimerButton } from "@/components/activities/ServiceTimer"

export function PlannerBoard() {
  const t = useT()
  const lang = useLang()
  const snapshot = useMonthSnapshot()
  const events = useAppStore((s) => s.events)
  const availability = useAppStore((s) => s.availability)
  const commitments = useAppStore((s) => s.commitments)
  const settings = useAppStore((s) => s.settings)
  const apply = useAppStore((s) => s.applySuggestedBlocks)
  const target = useCurrentTarget()
  const wizardOpen = useUiStore((s) => s.wizardOpen)
  const setWizardOpen = useUiStore((s) => s.setWizardOpen)
  const whatIfOpen = useUiStore((s) => s.whatIfOpen)
  const setWhatIfOpen = useUiStore((s) => s.setWhatIfOpen)
  const fillOpen = useUiStore((s) => s.fillWeekOpen)
  const setFillOpen = useUiStore((s) => s.setFillWeekOpen)
  const now = new Date()
  const weekNeed = Math.max(0, snapshot.requiredWeekly - snapshot.weekHours)
  const under = Math.max(0, snapshot.target - snapshot.projected)

  const plannerInput: PlannerInput = {
    targetHours: target,
    completedHours: snapshot.completed,
    events,
    availability,
    commitments,
    now,
    style: settings.planningStyle,
    preferences: settings.sessionPreferences,
    preferredSessionHours: settings.preferredSessionHours,
    maxSessionHours: settings.maxSessionHours,
  }

  const recovery = useMemo(
    () => generateSuggestedSchedule({ ...plannerInput, hoursNeeded: Math.max(under, weekNeed) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [snapshot.completed, snapshot.planned, events, availability, commitments, target]
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            {t("planner.title")}
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl">{t("planner.monthWizard")}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <StartTimerButton />
          <Button variant="outline" onClick={() => setWhatIfOpen(true)}>
            {t("planner.whatIf")}
          </Button>
          <Button variant="outline" onClick={() => setFillOpen(true)}>
            {t("planner.fillWeek")}
          </Button>
          <Button onClick={() => setWizardOpen(true)}>{t("planner.monthWizard")}</Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("planner.goal")} value={`${snapshot.target}u`} />
        <Stat label={t("planner.completed")} value={`${formatDecimal(snapshot.completed, lang)}u`} />
        <Stat label={t("planner.remaining")} value={`${formatDecimal(snapshot.remaining, lang)}u`} />
        <Stat label={t("planner.planned")} value={`${formatDecimal(snapshot.planned, lang)}u`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="card-quiet rounded-3xl p-5 lg:col-span-2">
          <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
            {t("planner.pace")}
          </p>
          <h2 className="font-heading mt-2 text-3xl">
            {t("planner.paceText", { n: formatDecimal(snapshot.requiredWeekly, lang) })}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat label={t("planner.needWeek")} value={`${formatDecimal(snapshot.requiredWeekly, lang)}u`} />
            <Stat label={t("planner.needDay")} value={`${formatDecimal(snapshot.requiredDaily, lang)}u`} />
            <Stat label={t("planner.projected")} value={`${formatDecimal(snapshot.projected, lang)}u`} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {under > 0.4
              ? t("planner.under", { n: formatDecimal(under, lang) })
              : t("planner.over", { n: formatDecimal(snapshot.projected - snapshot.target, lang) })}
          </p>
        </article>
        <article className="card-quiet rounded-3xl p-5">
          <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
            {t("planner.health")}
          </p>
          <h2 className="font-heading mt-2 text-3xl">
            {t(`planner.health.${snapshot.health}`)}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {snapshot.daysRemaining} {lang === "en" ? "days left in the month" : "dagen over in de maand"}
          </p>
        </article>
      </section>

      <WeeklyBoard />

      {under > 1 ? (
        <section className="card-quiet rounded-3xl p-6">
          <h2 className="font-heading text-3xl">{t("planner.review")}</h2>
          <p className="mt-2 text-muted-foreground">
            {t("planner.possible")}
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {recovery.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                onUse={() => apply(option.blocks)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <MonthWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
      <WhatIfDialog open={whatIfOpen} onClose={() => setWhatIfOpen(false)} />
      <FillWeekDialog
        open={fillOpen}
        onClose={() => setFillOpen(false)}
        hoursNeeded={weekNeed}
        input={plannerInput}
      />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-quiet rounded-2xl p-4">
      <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
      <p className="font-heading mt-1 text-2xl">{value}</p>
    </div>
  )
}

function WeeklyBoard() {
  const t = useT()
  const lang = useLang()
  const events = useAppStore((s) => s.events)
  const snapshot = useMonthSnapshot()
  const openActivity = useUiStore((s) => s.openActivity)
  const setFillOpen = useUiStore((s) => s.setFillWeekOpen)
  const days = weekDays(new Date())
  const remaining = Math.max(0, snapshot.requiredWeekly - snapshot.weekHours)

  return (
    <section className="card-quiet rounded-3xl p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-3xl">{t("planner.weekTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {formatDecimal(snapshot.weekHours, lang)}u · {t("planner.weekGoal")} {formatDecimal(snapshot.requiredWeekly, lang)}u
          </p>
        </div>
        {remaining > 0.4 ? (
          <Button onClick={() => setFillOpen(true)}>
            {t("planner.planHours", { n: formatDecimal(remaining, lang) })}
          </Button>
        ) : null}
      </div>
      <div className="mt-5 grid gap-2">
        {days.map((day) => {
          const date = isoDate(day)
          const items = events.filter(
            (event) => event.date === date && event.category === "field_service" && event.status !== "cancelled"
          )
          const hours = items.reduce((sum, event) => sum + event.durationMinutes / 60, 0)
          return (
            <button
              key={date}
              type="button"
              onClick={() => openActivity({ date, category: "field_service" })}
              className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3 text-left"
            >
              <div>
                <p className="text-sm font-medium">{formatWeekdayLong(day, lang)}</p>
                <p className="text-xs text-muted-foreground">
                  {items.length === 0
                    ? "—"
                    : items.map((item) => `${item.startTime}–${item.endTime}`).join(" · ")}
                </p>
              </div>
              <p className="text-sm">{hours ? formatHoursShort(hours, lang) : "—"}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function OptionCard({
  option,
  onUse,
}: {
  option: SuggestedOption
  onUse: () => void
}) {
  const t = useT()
  const lang = useLang()
  return (
    <article className="rounded-2xl border border-border p-4">
      <h3 className="font-heading text-xl">{t(option.titleKey)}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {formatDecimal(option.totalHours, lang)}u
      </p>
      <ul className="mt-3 space-y-1 text-sm">
        {option.blocks.slice(0, 6).map((block) => (
          <li key={`${block.date}-${block.startTime}`}>
            {formatWeekdayLong(parseDate(block.date), lang)} — {formatHoursShort(block.hours, lang)}
          </li>
        ))}
      </ul>
      <Button className="mt-4 w-full" onClick={onUse} disabled={option.blocks.length === 0}>
        {t("planner.usePlan")}
      </Button>
    </article>
  )
}

function MonthWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT()
  const [step, setStep] = useState(1)
  const pioneerType = useAppStore((s) => s.pioneerType)
  const customHours = useAppStore((s) => s.customMonthlyHours)
  const setPioneerGoal = useAppStore((s) => s.setPioneerGoal)
  const availability = useAppStore((s) => s.availability)
  const setAvailability = useAppStore((s) => s.setAvailability)
  const commitments = useAppStore((s) => s.commitments)
  const addCommitment = useAppStore((s) => s.addCommitment)
  const removeCommitment = useAppStore((s) => s.removeCommitment)
  const settings = useAppStore((s) => s.settings)
  const setSettings = useAppStore((s) => s.setSettings)
  const events = useAppStore((s) => s.events)
  const apply = useAppStore((s) => s.applySuggestedBlocks)
  const [type, setType] = useState<PioneerTypeId>(pioneerType)
  const [hours, setHours] = useState(customHours)
  const [options, setOptions] = useState<SuggestedOption[]>([])
  const [newTitle, setNewTitle] = useState("Werk")
  const [newWeekday, setNewWeekday] = useState(1)
  const [newStart, setNewStart] = useState("09:00")
  const [newEnd, setNewEnd] = useState("17:00")

  const prefs: SessionPreference[] = [
    "short",
    "long",
    "mornings",
    "afternoons",
    "evenings",
    "weekends",
    "flexible",
  ]

  function generate() {
    const now = new Date()
    const nextHours =
      type === "regular" ? DEFAULT_REGULAR_HOURS : type === "auxiliary" ? DEFAULT_AUXILIARY_HOURS : hours
    setPioneerGoal(type, nextHours)
    const completed = calculateCompletedHours(events, now.getFullYear(), now.getMonth())
    setOptions(
      generateSuggestedSchedule({
        targetHours: nextHours,
        completedHours: completed,
        events,
        availability,
        commitments,
        now,
        style: settings.planningStyle,
        preferences: settings.sessionPreferences,
        preferredSessionHours: settings.preferredSessionHours,
        maxSessionHours: settings.maxSessionHours,
      })
    )
    setStep(6)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{t("planner.monthWizard")}</DialogTitle>
        </DialogHeader>
        {step === 1 ? (
          <Step title={t("planner.step.goal")}>
            <GoalPick type={type} hours={hours} onType={setType} onHours={setHours} />
          </Step>
        ) : null}
        {step === 2 ? (
          <Step title={t("planner.step.availability")}>
            <AvailabilityEditor value={availability} onChange={setAvailability} />
          </Step>
        ) : null}
        {step === 3 ? (
          <Step title={t("planner.step.commitments")}>
            <div className="space-y-2">
              {commitments.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm">
                  <span>
                    {item.title} · {t(`weekday.${item.weekday}`)} {item.startTime}–{item.endTime}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => removeCommitment(item.id)}>
                    {t("activity.delete")}
                  </Button>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2">
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                <select
                  className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm"
                  value={newWeekday}
                  onChange={(e) => setNewWeekday(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <option key={day} value={day}>
                      {t(`weekday.${day}`)}
                    </option>
                  ))}
                </select>
                <Input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} />
                <Input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
              </div>
              <Button
                variant="secondary"
                onClick={() =>
                  addCommitment({
                    id: crypto.randomUUID(),
                    title: newTitle,
                    type: "work",
                    weekday: newWeekday,
                    date: null,
                    startTime: newStart,
                    endTime: newEnd,
                  })
                }
              >
                {t("calendar.add")}
              </Button>
            </div>
          </Step>
        ) : null}
        {step === 4 ? (
          <Step title={t("planner.step.preference")}>
            <div className="flex flex-wrap gap-2">
              {prefs.map((pref) => {
                const active = settings.sessionPreferences.includes(pref)
                return (
                  <button
                    key={pref}
                    type="button"
                    className={`rounded-full border px-3 py-1 text-sm ${active ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
                    onClick={() => {
                      const next = active
                        ? settings.sessionPreferences.filter((item) => item !== pref)
                        : [...settings.sessionPreferences, pref]
                      setSettings({ sessionPreferences: next.length ? next : ["flexible"] })
                    }}
                  >
                    {t(`pref.${pref}`)}
                  </button>
                )
              })}
            </div>
          </Step>
        ) : null}
        {step === 5 ? (
          <Step title={t("planner.step.style")}>
            <div className="grid gap-2">
              {(["even", "weekend", "weekdays", "flexible"] as PlanningStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  className={`rounded-2xl border px-4 py-3 text-left ${settings.planningStyle === style ? "border-primary bg-primary/8" : "border-border"}`}
                  onClick={() => setSettings({ planningStyle: style })}
                >
                  {t(`style.${style}`)}
                </button>
              ))}
            </div>
          </Step>
        ) : null}
        {step === 6 ? (
          <Step title={t("planner.step.suggest")}>
            <div className="grid gap-3">
              {options.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  onUse={() => {
                    apply(option.blocks)
                    onClose()
                    setStep(1)
                  }}
                />
              ))}
            </div>
          </Step>
        ) : null}
        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => (step === 1 ? onClose() : setStep(step - 1))}>
            {t("setup.back")}
          </Button>
          {step < 5 ? (
            <Button onClick={() => setStep(step + 1)}>{t("setup.next")}</Button>
          ) : step === 5 ? (
            <Button onClick={generate}>{t("planner.step.suggest")}</Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3">
      <h3 className="font-heading text-xl">{title}</h3>
      {children}
    </div>
  )
}

function GoalPick({
  type,
  hours,
  onType,
  onHours,
}: {
  type: PioneerTypeId
  hours: number
  onType: (value: PioneerTypeId) => void
  onHours: (value: number) => void
}) {
  const t = useT()
  return (
    <div className="grid gap-2">
      <button
        type="button"
        className={`rounded-2xl border p-4 text-left ${type === "regular" ? "border-primary bg-primary/8" : "border-border"}`}
        onClick={() => onType("regular")}
      >
        <p className="font-medium">{t("pioneer.regular")}</p>
        <p className="text-sm text-muted-foreground">{t("pioneer.hoursMonth", { n: DEFAULT_REGULAR_HOURS })}</p>
      </button>
      <button
        type="button"
        className={`rounded-2xl border p-4 text-left ${type === "auxiliary" ? "border-primary bg-primary/8" : "border-border"}`}
        onClick={() => onType("auxiliary")}
      >
        <p className="font-medium">{t("pioneer.auxiliary")}</p>
        <p className="text-sm text-muted-foreground">{t("pioneer.hoursMonth", { n: DEFAULT_AUXILIARY_HOURS })}</p>
      </button>
      <button
        type="button"
        className={`rounded-2xl border p-4 text-left ${type === "custom" ? "border-primary bg-primary/8" : "border-border"}`}
        onClick={() => onType("custom")}
      >
        <p className="font-medium">{t("pioneer.custom")}</p>
        <Input
          type="number"
          min={1}
          className="mt-2"
          value={hours}
          onChange={(e) => onHours(Number(e.target.value))}
        />
      </button>
    </div>
  )
}

function AvailabilityEditor({
  value,
  onChange,
}: {
  value: AvailabilitySlot[]
  onChange: (value: AvailabilitySlot[]) => void
}) {
  const t = useT()
  const parts: DayPart[] = ["morning", "afternoon", "evening"]
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5, 6, 7].map((weekday) => {
        const slot = value.find((item) => item.weekday === weekday) ?? {
          weekday,
          parts: [],
        }
        return (
          <div key={weekday} className="flex flex-wrap items-center gap-2">
            <span className="w-28 text-sm">{t(`weekday.${weekday}`)}</span>
            {parts.map((part) => {
              const checked = slot.parts.includes(part)
              return (
                <label key={part} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(next) => {
                      const partsNext = next
                        ? [...slot.parts, part]
                        : slot.parts.filter((item) => item !== part)
                      onChange([
                        ...value.filter((item) => item.weekday !== weekday),
                        { weekday, parts: partsNext },
                      ])
                    }}
                  />
                  {t(`day.${part}`)}
                </label>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function WhatIfDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT()
  const lang = useLang()
  const snapshot = useMonthSnapshot()
  const apply = useAppStore((s) => s.applySuggestedBlocks)
  const [date, setDate] = useState(isoDate(new Date()))
  const [hours, setHours] = useState(3)
  const projected = snapshot.completed + snapshot.planned + hours
  const remaining = Math.max(0, snapshot.target - (snapshot.completed + hours))

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{t("whatif.title")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{t("whatif.intro")}</p>
        <div className="grid grid-cols-2 gap-3">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input type="number" min={1} max={6} step={0.5} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
        </div>
        <div className="rounded-2xl bg-muted p-4 text-sm">
          <p>
            {t("planner.completed")}: {formatDecimal(snapshot.completed, lang)} / {snapshot.target}
          </p>
          <p className="mt-1">
            {t("whatif.after")}: {formatDecimal(snapshot.completed + hours, lang)} / {snapshot.target}
          </p>
          <p className="mt-1">
            {t("planner.remaining")}: {formatDecimal(remaining, lang)}u
          </p>
          <p className="mt-1">
            {t("planner.projected")}: {formatDecimal(projected, lang)}u
          </p>
        </div>
        <Button
          onClick={() => {
            apply([
              {
                date,
                startTime: "09:00",
                endTime: `${String(9 + Math.floor(hours)).padStart(2, "0")}:${hours % 1 ? "30" : "00"}`,
              },
            ])
            onClose()
          }}
        >
          {t("whatif.confirm")}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

function FillWeekDialog({
  open,
  onClose,
  hoursNeeded,
  input,
}: {
  open: boolean
  onClose: () => void
  hoursNeeded: number
  input: PlannerInput
}) {
  const t = useT()
  const lang = useLang()
  const apply = useAppStore((s) => s.applySuggestedBlocks)
  const blocks = useMemo(
    () => suggestWeekFill(input, Math.max(1, hoursNeeded)).filter((block) => {
      const week = weekDays(new Date())
      return week.some((item) => isoDate(item) === block.date)
    }),
    [input, hoursNeeded]
  )

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{t("planner.fillWeek")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("planner.fillNeed", { n: formatDecimal(hoursNeeded, lang) })}
        </p>
        {blocks.length === 0 ? (
          <p>{t("planner.noSlot")}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {blocks.map((block) => (
              <li key={`${block.date}-${block.startTime}`}>
                {formatWeekdayLong(parseDate(block.date), lang)} {block.startTime}–{block.endTime} · {formatHoursShort(block.hours, lang)}
              </li>
            ))}
          </ul>
        )}
        <Button
          disabled={blocks.length === 0}
          onClick={() => {
            apply(blocks)
            onClose()
          }}
        >
          {t("timer.add")}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
