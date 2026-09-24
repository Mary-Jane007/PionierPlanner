"use client"

import { GraduationCap, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { emptyGoal, emptyStudentQuestion } from "@/lib/followups"
import { JW_ORG_LIBRARY } from "@/lib/constants"
import { useT } from "@/lib/i18n"
import type { StudentTracker } from "@/types"

export function StudentTrackerSection({
  tracker,
  onChange,
}: {
  tracker: StudentTracker
  onChange: (partial: Partial<StudentTracker>) => void
}) {
  const t = useT()

  return (
    <section className="card-quiet space-y-5 rounded-3xl border border-primary/25 bg-primary/5 p-6">
      <div className="flex items-start gap-3">
        <GraduationCap className="mt-1 size-5 text-primary" />
        <div>
          <h2 className="font-heading text-2xl">{t("follow.tracker.title")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t("follow.tracker.hint")}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 sm:col-span-2">
          <Label>{t("follow.tracker.book")}</Label>
          <Input
            value={tracker.publication}
            onChange={(e) => onChange({ publication: e.target.value })}
            placeholder={t("follow.tracker.bookHint")}
          />
        </label>
        <label className="grid gap-1.5">
          <Label>{t("follow.tracker.chapter")}</Label>
          <Input
            value={tracker.chapter}
            onChange={(e) => onChange({ chapter: e.target.value })}
            placeholder={t("follow.tracker.chapterHint")}
          />
        </label>
        <label className="grid gap-1.5">
          <Label>{t("follow.tracker.started")}</Label>
          <Input
            type="date"
            value={tracker.startedDate}
            onChange={(e) => onChange({ startedDate: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5 sm:col-span-2">
          <Label>{t("follow.tracker.progress")}</Label>
          <Textarea
            className="min-h-20"
            value={tracker.progress}
            onChange={(e) => onChange({ progress: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5 sm:col-span-2">
          <Label>{t("follow.tracker.workOn")}</Label>
          <Textarea
            className="min-h-20"
            value={tracker.workOn}
            onChange={(e) => onChange({ workOn: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5 sm:col-span-2">
          <Label>{t("follow.tracker.nextFocus")}</Label>
          <Input
            value={tracker.nextFocus}
            onChange={(e) => onChange({ nextFocus: e.target.value })}
          />
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-heading text-xl">{t("follow.tracker.goals")}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange({ goals: [...tracker.goals, emptyGoal()] })}
          >
            <Plus className="size-4" />
            {t("follow.tracker.addGoal")}
          </Button>
        </div>
        {tracker.goals.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("follow.tracker.goalsEmpty")}</p>
        ) : (
          <ul className="space-y-2">
            {tracker.goals.map((goal, index) => (
              <li key={goal.id} className="flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-2">
                <Checkbox
                  checked={goal.done}
                  onCheckedChange={(checked) => {
                    const goals = tracker.goals.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, done: Boolean(checked) } : item
                    )
                    onChange({ goals })
                  }}
                />
                <Input
                  className={goal.done ? "flex-1 border-0 bg-transparent line-through opacity-60" : "flex-1 border-0 bg-transparent"}
                  value={goal.text}
                  placeholder={t("follow.tracker.goalPlaceholder")}
                  onChange={(e) => {
                    const goals = tracker.goals.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, text: e.target.value } : item
                    )
                    onChange({ goals })
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onChange({ goals: tracker.goals.filter((item) => item.id !== goal.id) })}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-heading text-xl">{t("follow.tracker.questions")}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange({ questions: [...tracker.questions, emptyStudentQuestion()] })}
          >
            <Plus className="size-4" />
            {t("follow.tracker.addQuestion")}
          </Button>
        </div>
        {tracker.questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("follow.tracker.questionsEmpty")}</p>
        ) : (
          <div className="space-y-3">
            {tracker.questions.map((entry, index) => (
              <article key={entry.id} className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      onChange({ questions: tracker.questions.filter((item) => item.id !== entry.id) })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <label className="grid gap-1.5">
                  <Label>{t("follow.question")}</Label>
                  <Input
                    value={entry.question}
                    onChange={(e) => {
                      const questions = tracker.questions.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, question: e.target.value } : item
                      )
                      onChange({ questions })
                    }}
                  />
                </label>
                <label className="mt-3 grid gap-1.5">
                  <Label>{t("follow.tracker.questionNote")}</Label>
                  <Textarea
                    className="min-h-16"
                    value={entry.note}
                    onChange={(e) => {
                      const questions = tracker.questions.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, note: e.target.value } : item
                      )
                      onChange({ questions })
                    }}
                  />
                </label>
              </article>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        <a href={JW_ORG_LIBRARY} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
          {t("follow.readOnJw")}
        </a>
      </p>
    </section>
  )
}
