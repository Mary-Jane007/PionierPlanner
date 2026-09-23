"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { emptyQuestion, FOLLOW_SUGGESTIONS, withFollowUpPatch } from "@/lib/followups"
import { formatHumanDate, isoDate, parseDate } from "@/lib/dates"
import { useT, useLang } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import type { FollowUp, FollowUpStatus } from "@/types"

export function FollowUpDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const t = useT()
  const lang = useLang()
  const stored = useAppStore((s) => s.followUps.find((item) => item.id === id))
  const upsert = useAppStore((s) => s.upsertFollowUp)
  const remove = useAppStore((s) => s.deleteFollowUp)
  const [draft, setDraft] = useState<FollowUp | null>(stored ?? null)
  const [visitDate, setVisitDate] = useState(isoDate(new Date()))
  const [visitNotes, setVisitNotes] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const current = useAppStore.getState().followUps.find((item) => item.id === id) ?? null
    setDraft(current)
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

  const addSuggested = (question: string) => {
    if (current.questions.some((item) => item.question === question)) return
    patch({ questions: [...current.questions, emptyQuestion(question)] })
  }

  const addVisit = () => {
    const notes = visitNotes.trim()
    if (!visitDate) return
    patch({
      visits: [
        { id: crypto.randomUUID(), date: visitDate, notes },
        ...current.visits,
      ].sort((a, b) => b.date.localeCompare(a.date)),
    })
    setVisitNotes("")
    setVisitDate(isoDate(new Date()))
  }

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
          {t(`follow.kind.${draft.kind}`)}
        </p>
        <h1 className="font-heading text-4xl">{draft.name || t("follow.newTitle")}</h1>
      </header>

      <section className="card-quiet grid gap-4 rounded-3xl p-6 sm:grid-cols-2">
        <label className="grid gap-1.5 sm:col-span-2">
          <Label>{t("follow.name")}</Label>
          <Input value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
        </label>
        <label className="grid gap-1.5">
          <Label>{t("follow.status")}</Label>
          <Select value={draft.status} onValueChange={(value) => patch({ status: value as FollowUpStatus })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t("follow.status.active")}</SelectItem>
              <SelectItem value="paused">{t("follow.status.paused")}</SelectItem>
              <SelectItem value="done">{t("follow.status.done")}</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="grid gap-1.5">
          <Label>{t("follow.next")}</Label>
          <Input
            type="date"
            value={draft.nextDate ?? ""}
            onChange={(e) => patch({ nextDate: e.target.value || undefined })}
          />
        </label>
        <label className="grid gap-1.5">
          <Label>{t("follow.publication")}</Label>
          <Input
            value={draft.publication ?? ""}
            onChange={(e) => patch({ publication: e.target.value || undefined })}
          />
        </label>
        <label className="grid gap-1.5">
          <Label>{t("follow.language")}</Label>
          <Input
            value={draft.language ?? ""}
            onChange={(e) => patch({ language: e.target.value || undefined })}
          />
        </label>
        <label className="grid gap-1.5 sm:col-span-2">
          <Label>{t("follow.address")}</Label>
          <Input
            value={draft.address ?? ""}
            onChange={(e) => patch({ address: e.target.value || undefined })}
          />
        </label>
        <label className="grid gap-1.5 sm:col-span-2">
          <Label>{t("follow.phone")}</Label>
          <Input
            value={draft.phone ?? ""}
            onChange={(e) => patch({ phone: e.target.value || undefined })}
          />
        </label>
      </section>

      <section className="card-quiet space-y-3 rounded-3xl p-6">
        <h2 className="font-heading text-2xl">{t("follow.notes")}</h2>
        <p className="text-sm text-muted-foreground">{t("follow.notesHint")}</p>
        <Textarea
          className="min-h-48"
          value={draft.notes}
          onChange={(e) => patch({ notes: e.target.value })}
        />
      </section>

      <section className="card-quiet space-y-4 rounded-3xl p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl">{t("follow.questions")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("follow.questionsHint")}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => patch({ questions: [...draft.questions, emptyQuestion()] })}
          >
            <Plus className="size-4" />
            {t("follow.addQuestion")}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {FOLLOW_SUGGESTIONS[draft.kind].map((key) => (
            <button
              key={key}
              type="button"
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary"
              onClick={() => addSuggested(t(key))}
            >
              {t(key)}
            </button>
          ))}
        </div>
        {draft.questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("follow.questionsHint")}</p>
        ) : (
          <div className="space-y-4">
            {draft.questions.map((entry, index) => (
              <article key={entry.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <label className="grid flex-1 gap-1.5">
                    <Label>{t("follow.question")}</Label>
                    <Input
                      value={entry.question}
                      onChange={(e) => {
                        const questions = draft.questions.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, question: e.target.value } : item
                        )
                        patch({ questions })
                      }}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-6"
                    onClick={() =>
                      patch({ questions: draft.questions.filter((item) => item.id !== entry.id) })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <label className="mt-3 grid gap-1.5">
                  <Label>{t("follow.answer")}</Label>
                  <Textarea
                    className="min-h-28"
                    placeholder={t("follow.unanswered")}
                    value={entry.answer}
                    onChange={(e) => {
                      const questions = draft.questions.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, answer: e.target.value } : item
                      )
                      patch({ questions })
                    }}
                  />
                </label>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="card-quiet space-y-4 rounded-3xl p-6">
        <h2 className="font-heading text-2xl">{t("follow.visits")}</h2>
        <div className="grid gap-3 sm:grid-cols-[160px_1fr_auto]">
          <Input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
          <Textarea
            className="min-h-16"
            placeholder={t("follow.visitNotes")}
            value={visitNotes}
            onChange={(e) => setVisitNotes(e.target.value)}
          />
          <Button type="button" className="h-11 self-start rounded-xl" onClick={addVisit}>
            {t("follow.addVisit")}
          </Button>
        </div>
        {draft.visits.length === 0 ? null : (
          <div className="space-y-3">
            {draft.visits.map((visit) => (
              <article key={visit.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                    {formatHumanDate(parseDate(visit.date), lang)}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      patch({ visits: draft.visits.filter((item) => item.id !== visit.id) })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{visit.notes}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <ConfirmDeleteButton
        title={t("activity.delete")}
        description={t("follow.deleteConfirm")}
        variant="destructive"
        size="default"
        className="h-11"
        onConfirm={() => {
          remove(draft.id)
          onBack()
        }}
      >
        {t("activity.delete")}
      </ConfirmDeleteButton>
    </div>
  )
}
