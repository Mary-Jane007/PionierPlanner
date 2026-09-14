"use client"

import { useState } from "react"
import { Star } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { experienceSchema } from "@/lib/validation"
import { isoDate } from "@/lib/dates"
import { useT } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { useUiStore } from "@/lib/ui-store"
import type { Experience, ExperienceCategory, ExperienceVisibility } from "@/types"

const categories: ExperienceCategory[] = [
  "nice_response",
  "bible_study",
  "return_visit",
  "informal",
  "encouragement",
  "personal_lesson",
  "other",
]

export function ExperienceDialog() {
  const t = useT()
  const open = useUiStore((s) => s.experienceOpen)
  const close = useUiStore((s) => s.closeExperience)
  const editingId = useUiStore((s) => s.editingExperienceId)
  const experiences = useAppStore((s) => s.experiences)
  const upsert = useAppStore((s) => s.upsertExperience)
  const existing = experiences.find((item) => item.id === editingId)

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      {open ? (
        <ExperienceForm
          key={editingId ?? "new"}
          existing={existing}
          t={t}
          onClose={close}
          onSave={upsert}
        />
      ) : null}
    </Dialog>
  )
}

function ExperienceForm({
  existing,
  t,
  onClose,
  onSave,
}: {
  existing?: Experience
  t: (key: string, vars?: Record<string, string | number>) => string
  onClose: () => void
  onSave: (experience: Experience) => void
}) {
  const [title, setTitle] = useState(existing?.title ?? "")
  const [date, setDate] = useState(existing?.date ?? isoDate(new Date()))
  const [category, setCategory] = useState<ExperienceCategory>(existing?.category ?? "nice_response")
  const [text, setText] = useState(existing?.text ?? "")
  const [learned, setLearned] = useState(existing?.learned ?? "")
  const [followUpDate, setFollowUpDate] = useState(existing?.followUpDate ?? "")
  const [visibility, setVisibility] = useState<ExperienceVisibility>(existing?.visibility ?? "private")

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="font-heading text-2xl">{t("exp.new")}</DialogTitle>
        <DialogDescription>{t("exp.visibilityHint")}</DialogDescription>
      </DialogHeader>
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          const parsed = experienceSchema.safeParse({
            title,
            date,
            category,
            text,
            learned: learned || undefined,
            followUpDate: followUpDate || undefined,
            visibility,
          })
          if (!parsed.success) return
          const now = new Date().toISOString()
          const value: Experience = {
            id: existing?.id ?? crypto.randomUUID(),
            ...parsed.data,
            tags: [t(`exp.cat.${category}`).toLowerCase().replace(/\s+/g, "")],
            favorite: existing?.favorite ?? false,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
          }
          onSave(value)
          onClose()
        }}
      >
        <label className="grid gap-1.5">
          <Label>{t("activity.title")}</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5">
            <Label>{t("activity.date")}</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="grid gap-1.5">
            <Label>{t("activity.type")}</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExperienceCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {t(`exp.cat.${item}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
        <label className="grid gap-1.5">
          <Label>{t("exp.subtitle")}</Label>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} required />
        </label>
        <label className="grid gap-1.5">
          <Label>{t("exp.learned")}</Label>
          <Textarea value={learned} onChange={(e) => setLearned(e.target.value)} rows={2} />
        </label>
        <label className="grid gap-1.5">
          <Label>{t("exp.followUp")}</Label>
          <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
        </label>
        <Select value={visibility} onValueChange={(v) => setVisibility(v as ExperienceVisibility)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">{t("exp.private")}</SelectItem>
            <SelectItem value="share_ready">{t("exp.share")}</SelectItem>
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("activity.cancel")}
          </Button>
          <Button type="submit">
            <Star className="size-4" />
            {t("common.save")}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
