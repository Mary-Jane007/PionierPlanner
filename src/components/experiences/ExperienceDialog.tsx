"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ImagePlus, Star } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { compressExperiencePhoto, isExperiencePhoto } from "@/lib/photo"
import { experienceSchema } from "@/lib/validation"
import { isoDate } from "@/lib/dates"
import { emptyGoal, emptyStep, goalCategoryFromExperience, upsertById } from "@/lib/progress"
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
  const router = useRouter()
  const growth = useAppStore((s) => s.growth)
  const setGrowth = useAppStore((s) => s.setGrowth)
  const [title, setTitle] = useState(existing?.title ?? "")
  const [date, setDate] = useState(existing?.date ?? isoDate(new Date()))
  const [category, setCategory] = useState<ExperienceCategory>(existing?.category ?? "nice_response")
  const [text, setText] = useState(existing?.text ?? "")
  const [learned, setLearned] = useState(existing?.learned ?? "")
  const [followUpDate, setFollowUpDate] = useState(existing?.followUpDate ?? "")
  const [visibility, setVisibility] = useState<ExperienceVisibility>(existing?.visibility ?? "private")
  const [photo, setPhoto] = useState(existing?.photo)
  const [savedExperience, setSavedExperience] = useState<Experience | null>(null)

  function createGoalFromExperience(experience: Experience) {
    const now = new Date().toISOString()
    const lesson = experience.learned?.trim() || experience.text.trim()
    const goal = {
      ...emptyGoal(experience.title),
      category: goalCategoryFromExperience(experience.category),
      reason: t("progress.createdFromExperience"),
      firstStep: lesson,
      steps: lesson ? [emptyStep(lesson)] : [],
      experienceIds: [experience.id],
      createdAt: now,
      updatedAt: now,
    }
    setGrowth({ goals: upsertById(growth.goals, goal) })
    onSave({ ...experience, goalId: goal.id, updatedAt: now })
    onClose()
    router.push(`/vorderingen/?goal=${goal.id}`)
  }

  if (savedExperience) {
    return (
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{t("progress.makeGoal")}</DialogTitle>
          <DialogDescription>{t("progress.emptyGoalsHint")}</DialogDescription>
        </DialogHeader>
        <p className="text-sm leading-relaxed text-muted-foreground">{savedExperience.title}</p>
        {isExperiencePhoto(savedExperience.photo) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={savedExperience.photo}
            alt=""
            className="h-36 w-full rounded-2xl object-cover"
          />
        ) : null}
        {savedExperience.learned ? (
          <p className="text-sm">{savedExperience.learned}</p>
        ) : null}
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {t(`progress.cat.${goalCategoryFromExperience(savedExperience.category)}`)}
        </p>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("progress.notNow")}
          </Button>
          <Button type="button" onClick={() => createGoalFromExperience(savedExperience)}>
            {t("progress.addAsGoal")}
          </Button>
        </DialogFooter>
      </DialogContent>
    )
  }

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
            photo: isExperiencePhoto(photo) ? photo : undefined,
            tags: [t(`exp.cat.${category}`).toLowerCase().replace(/\s+/g, "")],
            favorite: existing?.favorite ?? false,
            goalId: existing?.goalId,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
          }
          onSave(value)
          if (!value.goalId) {
            setSavedExperience(value)
            return
          }
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
        <ExperiencePhotoField photo={photo} onChange={setPhoto} t={t} />
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

function ExperiencePhotoField({
  photo,
  onChange,
  t,
}: {
  photo?: string
  onChange: (photo: string | undefined) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function onFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    try {
      onChange(await compressExperiencePhoto(file))
    } catch {
      toast.error(t("exp.photoError"))
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="grid gap-1.5">
      <Label>{t("exp.photo")}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => void onFile(event.target.files?.[0])}
      />
      {isExperiencePhoto(photo) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="h-40 w-full rounded-2xl object-cover" />
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground"
        >
          <ImagePlus className="size-5" />
          {busy ? t("common.loading") : t("exp.photoAdd")}
        </button>
      )}
      {isExperiencePhoto(photo) ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? t("common.loading") : t("exp.photoChange")}
          </Button>
          <Button type="button" variant="ghost" disabled={busy} onClick={() => onChange(undefined)}>
            {t("exp.photoRemove")}
          </Button>
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">{t("exp.photoHint")}</p>
    </div>
  )
}
