"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { concreteGoalSuggestions, emptyGoal, emptyStep, GOAL_CATEGORIES } from "@/lib/progress"
import { useT } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { upsertById } from "@/lib/progress"
import type { GoalCategory, GoalFrequency, SpiritualGoal } from "@/types/growth"

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&>option]:bg-popover [&>option]:text-popover-foreground"

export function GoalDialog({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial?: Partial<SpiritualGoal>
  onSaved?: (goal: SpiritualGoal) => void
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      {open ? (
        <GoalForm
          key={initial?.id ?? initial?.title ?? "new-goal"}
          initial={initial}
          onClose={onClose}
          onSaved={onSaved}
        />
      ) : null}
    </Dialog>
  )
}

function GoalForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Partial<SpiritualGoal>
  onClose: () => void
  onSaved?: (goal: SpiritualGoal) => void
}) {
  const t = useT()
  const growth = useAppStore((s) => s.growth)
  const setGrowth = useAppStore((s) => s.setGrowth)
  const [draft, setDraft] = useState<SpiritualGoal>({
    ...emptyGoal(),
    ...initial,
    title: initial?.title ?? "",
  })

  function save() {
    if (!draft.title.trim()) return
    try {
      const steps =
        draft.steps.length === 0 && draft.firstStep.trim()
          ? [emptyStep(draft.firstStep.trim())]
          : draft.steps
      const saved = { ...draft, steps, updatedAt: new Date().toISOString() }
      setGrowth({ goals: upsertById(growth.goals, saved) })
      onClose()
      onSaved?.(saved)
    } catch {
      toast.error(t("progress.saveError"))
    }
  }

  const hints = concreteGoalSuggestions(draft.title)

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{t("progress.createGoal")}</DialogTitle>
          <DialogDescription>{t("progress.emptyGoalsHint")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <label className="grid gap-1.5">
            <Label>{t("progress.goalTitle")}</Label>
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </label>
          {hints.length > 0 ? (
            <div className="rounded-2xl border border-border p-3">
              <p className="text-sm font-medium">{t("progress.helper")}</p>
              <div className="mt-2 space-y-2">
                {hints.map((hint) => (
                  <button
                    key={hint.key}
                    type="button"
                    className="block w-full rounded-xl px-2 py-1 text-left text-sm text-muted-foreground hover:bg-primary/8 hover:text-foreground"
                    onClick={() => setDraft({ ...draft, title: t(hint.key) })}
                  >
                    {t("progress.useSuggestion")}: {t(hint.key)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <label className="grid gap-1.5">
            <Label>{t("progress.category")}</Label>
            <select
              className={selectClass}
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as GoalCategory })}
            >
              {GOAL_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {t(`progress.cat.${category}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <Label>{t("progress.goalWhy")}</Label>
            <Textarea className="min-h-20" value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} />
          </label>
          <label className="grid gap-1.5">
            <Label>{t("progress.goalFirst")}</Label>
            <Textarea className="min-h-16" value={draft.firstStep} onChange={(e) => setDraft({ ...draft, firstStep: e.target.value })} />
          </label>
          <label className="grid gap-1.5">
            <Label>{t("progress.frequency")}</Label>
            <select
              className={selectClass}
              value={draft.frequency}
              onChange={(e) => setDraft({ ...draft, frequency: e.target.value as GoalFrequency })}
            >
              <option value="daily">{t("progress.freq.daily")}</option>
              <option value="weekly">{t("progress.freq.weekly")}</option>
              <option value="monthly">{t("progress.freq.monthly")}</option>
              <option value="once">{t("progress.freq.once")}</option>
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <Label>{t("progress.start")}</Label>
              <Input type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} />
            </label>
            <label className="grid gap-1.5">
              <Label>{t("progress.end")}</Label>
              <Input type="date" value={draft.targetDate ?? ""} onChange={(e) => setDraft({ ...draft, targetDate: e.target.value || undefined })} />
            </label>
          </div>
          <label className="flex items-center justify-between">
            <span className="text-sm">{t("progress.reminder")}</span>
            <Switch checked={draft.reminder} onCheckedChange={(checked) => setDraft({ ...draft, reminder: Boolean(checked) })} />
          </label>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("activity.cancel")}
          </Button>
          <Button type="button" onClick={save}>
            {t("activity.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
  )
}
