"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { calculateCompletedHours } from "@/lib/calculations"
import {
  generateSuggestedSchedule,
  suggestWeekFill,
  type PlannerInput,
} from "@/lib/planner/algorithm"
import { formatDecimal, formatHoursShort } from "@/lib/format"
import {
  addHoursToTime,
  formatWeekdayLong,
  isoDate,
  isValidIsoDate,
  parseDate,
  weekDays,
} from "@/lib/dates"
import { useMonthSnapshot } from "@/lib/hooks"
import { useT, useLang } from "@/lib/i18n"
import { useAppStore, useCurrentTarget } from "@/lib/store"
import { useUiStore } from "@/lib/ui-store"
import { cn } from "@/lib/utils"
import { DEFAULT_AUXILIARY_HOURS, DEFAULT_REGULAR_HOURS } from "@/lib/constants"
import type {
  AvailabilitySlot,
  CalendarEvent,
  DayPart,
  PioneerTypeId,
  PlanningStyle,
  SessionPreference,
  SuggestedBlock,
  SuggestedOption,
} from "@/types"
import { StartTimerButton } from "@/components/activities/ServiceTimer"
import { StartOverDialog } from "@/components/calendar/StartOverDialog"

function suggestedPrefill(block: SuggestedBlock, title: string): Partial<CalendarEvent> {
  return {
    date: block.date,
    startTime: block.startTime,
    endTime: block.endTime,
    category: "field_service",
    title,
    status: "planned",
    serviceType: "house_to_house",
  }
}

function reportApply(
  result: { added: number; skipped: number },
  t: (key: string, vars?: Record<string, string | number>) => string
) {
  if (result.added) toast.success(t("planner.added", { n: result.added }))
  if (result.skipped) toast.info(t("planner.skipped", { n: result.skipped }))
  if (!result.added && !result.skipped) toast.info(t("planner.nothingAdded"))
}

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
          <StartOverDialog />
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
        <Stat tone="goal" label={t("planner.goal")} value={`${snapshot.target}u`} />
        <Stat tone="done" label={t("planner.completed")} value={`${formatDecimal(snapshot.completed, lang)}u`} />
        <Stat tone="left" label={t("planner.remaining")} value={`${formatDecimal(snapshot.remaining, lang)}u`} />
        <Stat tone="planned" label={t("planner.planned")} value={`${formatDecimal(snapshot.planned, lang)}u`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="planner-pace rounded-3xl p-5 lg:col-span-2">
          <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
            {t("planner.pace")}
          </p>
          <h2 className="font-heading mt-2 text-3xl">
            {t("planner.paceText", { n: formatDecimal(snapshot.requiredWeekly, lang) })}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat tone="goal" label={t("planner.needWeek")} value={`${formatDecimal(snapshot.requiredWeekly, lang)}u`} />
            <Stat tone="left" label={t("planner.needDay")} value={`${formatDecimal(snapshot.requiredDaily, lang)}u`} />
            <Stat tone="planned" label={t("planner.projected")} value={`${formatDecimal(snapshot.projected, lang)}u`} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {under > 0.4
              ? t("planner.under", { n: formatDecimal(under, lang) })
              : t("planner.over", { n: formatDecimal(snapshot.projected - snapshot.target, lang) })}
          </p>
        </article>
        <article className={cn("rounded-3xl p-5", `health-${snapshot.health}`)}>
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
        <section className="planner-suggest rounded-3xl p-6">
          <h2 className="font-heading text-3xl">{t("planner.review")}</h2>
          <p className="mt-2 text-muted-foreground">
            {t("planner.possible")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t("planner.suggestHint")}</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {recovery.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                onUse={() => reportApply(apply(option.blocks), t)}
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
    <div className={cn("rounded-2xl p-4", tone ? `stat-${tone}` : "card-quiet")}>
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
    <section className="planner-week rounded-3xl p-6">
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
            (event) => event.date === date && event.status !== "cancelled"
          )
          const hours = items
            .filter((event) => event.category === "field_service")
            .reduce((sum, event) => sum + event.durationMinutes / 60, 0)
          return (
            <div
              key={date}
              className="planner-week-row flex items-start justify-between gap-3 rounded-2xl px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{formatWeekdayLong(day, lang)}</p>
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">—</p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={cn("cat-" + item.category, "rounded-md px-2 py-1 text-left text-xs")}
                        onClick={() => openActivity(item, item.id)}
                      >
                        {item.startTime}–{item.endTime} {item.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <p className="text-sm">{hours ? formatHoursShort(hours, lang) : "—"}</p>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={t("calendar.add")}
                  onClick={() =>
                    openActivity({
                      date,
                      category: "field_service",
                      title: t("category.field_service"),
                    })
                  }
                >
                  <Plus />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ConfirmSlotsButton({
  disabled,
  className,
  onConfirm,
}: {
  disabled?: boolean
  className?: string
  onConfirm: () => void
}) {
  const t = useT()
  const [open, setOpen] = useState(false)
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button className={className} disabled={disabled} />}>
        {t("planner.addFreeSlots")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("planner.addFreeSlots")}</AlertDialogTitle>
          <AlertDialogDescription>{t("planner.addFreeConfirm")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("activity.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm()
              setOpen(false)
            }}
          >
            {t("planner.addFreeSlots")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
  const openActivity = useUiStore((s) => s.openActivity)
  return (
    <article className="option-card-suggested rounded-2xl p-4">
      <h3 className="font-heading text-xl">{t(option.titleKey)}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {formatDecimal(option.totalHours, lang)}u
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {option.blocks.slice(0, 6).map((block) => (
          <li key={`${block.date}-${block.startTime}`} className="flex items-center justify-between gap-2">
            <span>
              {formatWeekdayLong(parseDate(block.date), lang)} {block.startTime}–{block.endTime} ·{" "}
              {formatHoursShort(block.hours, lang)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openActivity(suggestedPrefill(block, t("category.field_service")))}
            >
              {t("planner.editBlock")}
            </Button>
          </li>
        ))}
      </ul>
      <ConfirmSlotsButton
        className="mt-4 w-full"
        disabled={option.blocks.length === 0}
        onConfirm={onUse}
      />
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
            <p className="text-sm text-muted-foreground">{t("planner.suggestHint")}</p>
            <div className="grid gap-3">
              {options.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  onUse={() => {
                    reportApply(apply(option.blocks), t)
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
  const openActivity = useUiStore((s) => s.openActivity)
  const [date, setDate] = useState(isoDate(new Date()))
  const [hours, setHours] = useState(3)
  const projected = snapshot.completed + snapshot.planned + hours
  const remaining = Math.max(0, snapshot.target - (snapshot.completed + hours))
  const startTime = "09:00"

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{t("whatif.title")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{t("whatif.intro")}</p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              const next = e.target.value
              if (isValidIsoDate(next)) setDate(next)
            }}
          />
          <Input type="number" min={1} max={6} step={0.5} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
        </div>
        <div className="whatif-preview rounded-2xl p-4 text-sm">
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
            const nextDate = isValidIsoDate(date) ? date : isoDate(new Date())
            const nextHours = Number.isFinite(hours) && hours > 0 ? hours : 2
            openActivity({
              date: nextDate,
              startTime,
              endTime: addHoursToTime(startTime, nextHours),
              category: "field_service",
              title: t("category.field_service"),
              status: "planned",
            })
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
  const openActivity = useUiStore((s) => s.openActivity)
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
        <p className="text-sm text-muted-foreground">{t("planner.suggestHint")}</p>
        {blocks.length === 0 ? (
          <p>{t("planner.noSlot")}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {blocks.map((block) => (
              <li key={`${block.date}-${block.startTime}`} className="flex items-center justify-between gap-2">
                <span>
                  {formatWeekdayLong(parseDate(block.date), lang)} {block.startTime}–{block.endTime} · {formatHoursShort(block.hours, lang)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    openActivity(suggestedPrefill(block, t("category.field_service")))
                    onClose()
                  }}
                >
                  {t("planner.editBlock")}
                </Button>
              </li>
            ))}
          </ul>
        )}
        <ConfirmSlotsButton
          disabled={blocks.length === 0}
          onConfirm={() => {
            reportApply(apply(blocks), t)
            onClose()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
