"use client"

import { useEffect, useState, type ReactNode } from "react"
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  HelpCircle,
  Library,
  MessageCircle,
  NotebookPen,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { StudentTrackerSection } from "@/components/followups/StudentTrackerSection"
import {
  emptyScripture,
  FOLLOW_MATERIALS,
  FOLLOW_STATUSES,
  normalizeFollowUp,
  reminderLine,
  withFollowUpPatch,
} from "@/lib/followups"
import { isoDate } from "@/lib/dates"
import { JW_ORG_BIBLE, JW_ORG_LIBRARY, JW_ORG_WOL } from "@/lib/constants"
import { useT } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import type {
  FollowUp,
  FollowUpContactType,
  FollowUpConversation,
  FollowUpMaterialKind,
  FollowUpNextQuestion,
  FollowUpStatus,
  FollowUpStudy,
  StudentTracker,
} from "@/types"

export function FollowUpDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const t = useT()
  const stored = useAppStore((s) => s.followUps.find((item) => item.id === id))
  const upsert = useAppStore((s) => s.upsertFollowUp)
  const remove = useAppStore((s) => s.deleteFollowUp)
  const [draft, setDraft] = useState<FollowUp | null>(stored ? normalizeFollowUp(stored) : null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const current = useAppStore.getState().followUps.find((item) => item.id === id)
    setDraft(current ? normalizeFollowUp(current) : null)
  }, [id])

  const current = draft
  if (!current) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4" />
          {t("follow.back")}
        </Button>
        <div className="card-quiet rounded-3xl px-6 py-16 text-center">
          <h2 className="font-heading text-3xl">{t("follow.missing")}</h2>
        </div>
      </div>
    )
  }

  const save = (next: FollowUp) => {
    setDraft(next)
    upsert(next)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1200)
  }

  const patch = (partial: Partial<FollowUp>) => {
    save(withFollowUpPatch(current, partial))
  }

  const patchConversation = (partial: Partial<FollowUpConversation>) => {
    patch({
      conversation: {
        ...current.conversation,
        ...partial,
        date: current.conversation.date || isoDate(new Date()),
      },
    })
  }

  const patchNext = (partial: Partial<FollowUpNextQuestion>) => {
    patch({ nextQuestion: { ...current.nextQuestion, ...partial } })
  }

  const patchStudy = (partial: Partial<FollowUpStudy>) => {
    patch({ study: { ...current.study, ...partial } })
  }

  const patchTracker = (partial: Partial<StudentTracker>) => {
    patch({ tracker: { ...current.tracker, ...partial } })
  }

  const summary = reminderLine(current)
  const studyMode = current.kind === "bible_study" || current.status === "bible_study"

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4" />
          {t("follow.back")}
        </Button>
        <p className="text-xs text-muted-foreground">{saved ? t("follow.saved") : t("follow.privacy")}</p>
      </div>

      <header className="space-y-1">
        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
          {t(`follow.kind.${current.kind}`)}
        </p>
        <h1 className="font-heading text-4xl">{current.name || t("follow.newTitle")}</h1>
      </header>

      {(summary.previous || summary.openQuestion || summary.next) ? (
        <article className="rounded-3xl border border-primary/20 bg-primary/6 p-5">
          {summary.previous ? (
            <p className="text-sm leading-relaxed">
              <span className="font-medium">{t("follow.summaryPrevious")}:</span> {summary.previous}
            </p>
          ) : null}
          {summary.openQuestion ? (
            <p className="mt-2 text-sm leading-relaxed">
              <span className="font-medium">{t("follow.summaryOpen")}:</span> {summary.openQuestion}
            </p>
          ) : null}
          {summary.next ? (
            <p className="mt-2 text-sm leading-relaxed">
              <span className="font-medium">{t("follow.summaryNext")}:</span> {summary.next}
            </p>
          ) : null}
        </article>
      ) : null}

      <Section icon={UserRound} title={t("follow.basics")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("follow.name")} className="sm:col-span-2">
            <Input value={current.name} onChange={(e) => patch({ name: e.target.value })} />
          </Field>
          <Field label={t("follow.status")}>
            <select
              className={selectClass}
              value={current.status}
              onChange={(e) => patch({ status: e.target.value as FollowUpStatus })}
            >
              {FOLLOW_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`follow.status.${status}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("follow.contact")}>
            <select
              className={selectClass}
              value={current.contactType}
              onChange={(e) => {
                const contactType = e.target.value as FollowUpContactType
                patch({
                  contactType,
                  kind: contactType === "bible_study" ? "bible_study" : "return_visit",
                  status: contactType === "bible_study" ? "bible_study" : current.status,
                })
              }}
            >
              <option value="first_conversation">{t("follow.contact.first_conversation")}</option>
              <option value="return_visit">{t("follow.contact.return_visit")}</option>
              <option value="bible_study">{t("follow.contact.bible_study")}</option>
            </select>
          </Field>
          <Field label={t("follow.firstTalk")}>
            <Input
              type="date"
              value={current.firstTalkDate ?? ""}
              onChange={(e) => patch({ firstTalkDate: e.target.value || undefined })}
            />
          </Field>
          <Field label={t("follow.time")}>
            <Input
              type="time"
              value={current.firstTalkTime ?? ""}
              onChange={(e) => patch({ firstTalkTime: e.target.value || undefined })}
            />
          </Field>
          <Field label={t("follow.address")} className="sm:col-span-2">
            <Input value={current.address ?? ""} onChange={(e) => patch({ address: e.target.value || undefined })} />
          </Field>
          <Field label={t("follow.phone")} className="sm:col-span-2">
            <Input value={current.phone ?? ""} onChange={(e) => patch({ phone: e.target.value || undefined })} />
          </Field>
        </div>
      </Section>

      <Section icon={NotebookPen} title={t("follow.backgroundTitle")} hint={t("follow.backgroundHint")}>
        <div className="grid gap-4">
          <Field label={t("follow.family")}>
            <Input value={current.family ?? ""} onChange={(e) => patch({ family: e.target.value || undefined })} />
          </Field>
          <Field label={t("follow.belief")}>
            <Input value={current.background ?? ""} onChange={(e) => patch({ background: e.target.value || undefined })} />
          </Field>
          <Field label={t("follow.interests")}>
            <Input value={current.interests ?? ""} onChange={(e) => patch({ interests: e.target.value || undefined })} />
          </Field>
          <Field label={t("follow.concerns")}>
            <Textarea
              className="min-h-20"
              value={current.concerns ?? ""}
              onChange={(e) => patch({ concerns: e.target.value || undefined })}
            />
          </Field>
        </div>
      </Section>

      <Section icon={MessageCircle} title={t("follow.previous")} hint={t("follow.previousHint")}>
        <div className="grid gap-4">
          <Field label={t("follow.topic")}>
            <Textarea
              className="min-h-20"
              value={current.conversation.topic}
              onChange={(e) => patchConversation({ topic: e.target.value })}
            />
          </Field>
          <Field label={t("follow.theySaid")}>
            <Textarea
              className="min-h-20"
              value={current.conversation.theySaid}
              onChange={(e) => patchConversation({ theySaid: e.target.value })}
            />
          </Field>
          <Field label={t("follow.interest")}>
            <Textarea
              className="min-h-20"
              value={current.conversation.interest}
              onChange={(e) => patchConversation({ interest: e.target.value })}
            />
          </Field>
          <Field label={t("follow.openQuestion")}>
            <Textarea
              className="min-h-20"
              value={current.conversation.openQuestion}
              onChange={(e) => patchConversation({ openQuestion: e.target.value })}
            />
          </Field>
          <Field label={t("follow.reaction")}>
            <Textarea
              className="min-h-20"
              value={current.conversation.reaction}
              onChange={(e) => patchConversation({ reaction: e.target.value })}
            />
          </Field>
        </div>
      </Section>

      <Section icon={BookOpen} title={t("follow.scriptures")}>
        <p className="text-sm">
          <a href={JW_ORG_BIBLE} className="text-primary underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
            {t("follow.readOnJw")}
          </a>
        </p>
        <Button type="button" variant="outline" onClick={() => patch({ scriptures: [...current.scriptures, emptyScripture()] })}>
          <Plus className="size-4" />
          {t("follow.addScripture")}
        </Button>
        {current.scriptures.map((entry, index) => (
          <article key={entry.id} className="rounded-2xl border border-border p-4">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => patch({ scriptures: current.scriptures.filter((item) => item.id !== entry.id) })}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("follow.scriptureBook")}>
                <Input
                  value={entry.book}
                  onChange={(e) => {
                    const scriptures = current.scriptures.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, book: e.target.value } : item
                    )
                    patch({ scriptures })
                  }}
                />
              </Field>
              <Field label={t("follow.scriptureVerse")}>
                <Input
                  value={entry.verse}
                  placeholder="37:10, 11"
                  onChange={(e) => {
                    const scriptures = current.scriptures.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, verse: e.target.value } : item
                    )
                    patch({ scriptures })
                  }}
                />
              </Field>
              <Field label={t("follow.scriptureWhy")} className="sm:col-span-2">
                <Input
                  value={entry.why}
                  onChange={(e) => {
                    const scriptures = current.scriptures.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, why: e.target.value } : item
                    )
                    patch({ scriptures })
                  }}
                />
              </Field>
              <Field label={t("follow.scriptureReaction")} className="sm:col-span-2">
                <Textarea
                  className="min-h-16"
                  value={entry.reaction}
                  onChange={(e) => {
                    const scriptures = current.scriptures.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, reaction: e.target.value } : item
                    )
                    patch({ scriptures })
                  }}
                />
              </Field>
            </div>
          </article>
        ))}
      </Section>

      <Section icon={Library} title={t("follow.leftBehind")}>
        <div className="grid gap-2 sm:grid-cols-2">
          {FOLLOW_MATERIALS.map((kind) => (
            <label key={kind} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={current.materials.includes(kind)}
                onCheckedChange={(checked) => {
                  const materials = checked
                    ? [...current.materials, kind]
                    : current.materials.filter((item) => item !== kind)
                  patch({ materials })
                }}
              />
              {t(`follow.material.${kind}`)}
            </label>
          ))}
        </div>
        <Field label={t("follow.leftDetail")}>
          <Textarea
            className="min-h-20"
            value={current.materialDetail ?? ""}
            onChange={(e) => patch({ materialDetail: e.target.value || undefined })}
          />
        </Field>
        <p className="text-xs text-muted-foreground">
          <a href={JW_ORG_LIBRARY} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
            JW.org
          </a>
          {" · "}
          <a href={JW_ORG_WOL} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
            WOL.JW.org
          </a>
        </p>
      </Section>

      <Section icon={HelpCircle} title={t("follow.nextQuestionTitle")} hint={t("follow.nextQuestionHint")} highlight>
        <Field label={t("follow.question")}>
          <Textarea
            className="min-h-24"
            value={current.nextQuestion.question}
            onChange={(e) => patchNext({ question: e.target.value })}
          />
        </Field>
        <Field label={t("follow.nextScripture")}>
          <Input
            value={current.nextQuestion.scripture}
            placeholder="Openbaring 21:3, 4"
            onChange={(e) => patchNext({ scripture: e.target.value })}
          />
        </Field>
        <Field label={t("follow.nextTopic")}>
          <Input value={current.nextQuestion.topic} onChange={(e) => patchNext({ topic: e.target.value })} />
        </Field>
        <Field label={t("follow.nextMaterial")}>
          <Input value={current.nextQuestion.material} onChange={(e) => patchNext({ material: e.target.value })} />
        </Field>
      </Section>

      <Section icon={CalendarDays} title={t("follow.nextVisit")} hint={t("follow.calendarNote")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("follow.next")}>
            <Input
              type="date"
              value={current.nextDate ?? ""}
              onChange={(e) => patch({ nextDate: e.target.value || undefined })}
            />
          </Field>
          <Field label={t("follow.time")}>
            <Input
              type="time"
              value={current.nextTime ?? ""}
              onChange={(e) => patch({ nextTime: e.target.value || undefined })}
            />
          </Field>
          <Field label={t("follow.nextLocation")} className="sm:col-span-2">
            <Input
              value={current.nextLocation ?? ""}
              onChange={(e) => patch({ nextLocation: e.target.value || undefined })}
            />
          </Field>
          <Field label={t("follow.nextPurpose")} className="sm:col-span-2">
            <Textarea
              className="min-h-20"
              value={current.nextPurpose ?? ""}
              onChange={(e) => patch({ nextPurpose: e.target.value || undefined })}
            />
          </Field>
        </div>
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm">{t("follow.reminder")}</span>
          <Switch checked={current.reminder} onCheckedChange={(checked) => patch({ reminder: Boolean(checked) })} />
        </label>
      </Section>

      {studyMode ? (
        <StudentTrackerSection tracker={current.tracker} onChange={patchTracker} />
      ) : null}

      {studyMode ? (
        <Section icon={BookOpen} title={t("follow.studyTitle")} hint={t("follow.studyHint")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("follow.studyDate")}>
              <Input type="date" value={current.study.date} onChange={(e) => patchStudy({ date: e.target.value })} />
            </Field>
            <Field label={t("follow.studyPublication")}>
              <Input value={current.study.publication} onChange={(e) => patchStudy({ publication: e.target.value })} />
            </Field>
            <Field label={t("follow.studyLesson")}>
              <Input value={current.study.lesson} onChange={(e) => patchStudy({ lesson: e.target.value })} />
            </Field>
            <Field label={t("follow.studyParagraphs")}>
              <Input value={current.study.paragraphs} onChange={(e) => patchStudy({ paragraphs: e.target.value })} />
            </Field>
            <Field label={t("follow.nextTopic")} className="sm:col-span-2">
              <Input value={current.study.topic} onChange={(e) => patchStudy({ topic: e.target.value })} />
            </Field>
            <Field label={t("follow.studyUnderstood")} className="sm:col-span-2">
              <Textarea className="min-h-20" value={current.study.understood} onChange={(e) => patchStudy({ understood: e.target.value })} />
            </Field>
            <Field label={t("follow.studyDifficult")} className="sm:col-span-2">
              <Textarea className="min-h-20" value={current.study.difficult} onChange={(e) => patchStudy({ difficult: e.target.value })} />
            </Field>
            <Field label={t("follow.studyQuestions")} className="sm:col-span-2">
              <Textarea className="min-h-20" value={current.study.questions} onChange={(e) => patchStudy({ questions: e.target.value })} />
            </Field>
            <Field label={t("follow.studyTexts")} className="sm:col-span-2">
              <Textarea className="min-h-16" value={current.study.textsDiscussed} onChange={(e) => patchStudy({ textsDiscussed: e.target.value })} />
            </Field>
            <Field label={t("follow.studyTouched")} className="sm:col-span-2">
              <Input value={current.study.textThatTouched} onChange={(e) => patchStudy({ textThatTouched: e.target.value })} />
            </Field>
            <Field label={t("follow.studyApply")} className="sm:col-span-2">
              <Textarea className="min-h-16" value={current.study.apply} onChange={(e) => patchStudy({ apply: e.target.value })} />
            </Field>
            <Field label={t("follow.studyAgreed")} className="sm:col-span-2">
              <Textarea className="min-h-16" value={current.study.agreed} onChange={(e) => patchStudy({ agreed: e.target.value })} />
            </Field>
          </div>
          <h3 className="font-heading pt-2 text-xl">{t("follow.studyNext")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("follow.studyLesson")}>
              <Input value={current.study.nextLesson} onChange={(e) => patchStudy({ nextLesson: e.target.value })} />
            </Field>
            <Field label={t("follow.nextTopic")}>
              <Input value={current.study.nextTopic} onChange={(e) => patchStudy({ nextTopic: e.target.value })} />
            </Field>
            <Field label={t("follow.studyNextQuestion")} className="sm:col-span-2">
              <Textarea className="min-h-16" value={current.study.nextQuestion} onChange={(e) => patchStudy({ nextQuestion: e.target.value })} />
            </Field>
            <Field label={t("follow.studyNextTexts")} className="sm:col-span-2">
              <Input value={current.study.nextTexts} onChange={(e) => patchStudy({ nextTexts: e.target.value })} />
            </Field>
          </div>
        </Section>
      ) : null}

      <ConfirmDeleteButton
        title={t("activity.delete")}
        description={t("follow.deleteConfirm")}
        variant="destructive"
        size="default"
        className="h-11"
        onConfirm={() => {
          remove(current.id)
          onBack()
        }}
      >
        {t("activity.delete")}
      </ConfirmDeleteButton>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  hint,
  highlight,
  children,
}: {
  icon: typeof UserRound
  title: string
  hint?: string
  highlight?: boolean
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        "card-quiet space-y-4 rounded-3xl p-6",
        highlight && "border border-primary/25 bg-primary/5"
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-1 size-5 text-primary" />
        <div>
          <h2 className="font-heading text-2xl">{title}</h2>
          {hint ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{hint}</p> : null}
        </div>
      </div>
      {children}
    </section>
  )
}

function Field({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&>option]:bg-popover [&>option]:text-popover-foreground"
