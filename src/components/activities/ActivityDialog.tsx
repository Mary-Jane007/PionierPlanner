"use client"

import { useMemo, useState } from "react"
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
import { activitySchema } from "@/lib/validation"
import { CATEGORY_ORDER } from "@/lib/constants"
import { isoDate, minutesBetween } from "@/lib/dates"
import { formatHoursShort } from "@/lib/format"
import { detectScheduleConflict } from "@/lib/calculations"
import { useT, useLang } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { useUiStore } from "@/lib/ui-store"
import type { ActivityCategory, ActivityStatus, CalendarEvent, FieldServiceType } from "@/types"

const serviceTypes: FieldServiceType[] = [
  "house_to_house",
  "informal",
  "public",
  "phone",
  "letters",
  "return_visit",
  "bible_study",
  "other",
]

export function ActivityDialog() {
  const t = useT()
  const lang = useLang()
  const open = useUiStore((s) => s.activityOpen)
  const close = useUiStore((s) => s.closeActivity)
  const editingId = useUiStore((s) => s.editingEventId)
  const prefill = useUiStore((s) => s.eventPrefill)
  const setConflict = useUiStore((s) => s.setConflict)
  const events = useAppStore((s) => s.events)
  const upsertEvent = useAppStore((s) => s.upsertEvent)
  const deleteEvent = useAppStore((s) => s.deleteEvent)
  const setEventStatus = useAppStore((s) => s.setEventStatus)
  const existing = events.find((event) => event.id === editingId)
  const source = existing ?? prefill
  const formKey = `${editingId ?? "new"}-${source?.date ?? ""}-${source?.startTime ?? ""}`

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      {open ? (
        <ActivityForm
          key={formKey}
          source={source}
          editingId={editingId}
          t={t}
          lang={lang}
          events={events}
          onClose={close}
          onConflict={setConflict}
          onSave={upsertEvent}
          onDelete={deleteEvent}
          onComplete={setEventStatus}
        />
      ) : null}
    </Dialog>
  )
}

function ActivityForm({
  source,
  editingId,
  t,
  lang,
  events,
  onClose,
  onConflict,
  onSave,
  onDelete,
  onComplete,
}: {
  source?: Partial<CalendarEvent> | null
  editingId: string | null
  t: (key: string, vars?: Record<string, string | number>) => string
  lang: "nl" | "en" | "es" | "pap"
  events: CalendarEvent[]
  onClose: () => void
  onConflict: (value: { pending: CalendarEvent; existing: CalendarEvent }) => void
  onSave: (event: CalendarEvent) => void
  onDelete: (id: string) => void
  onComplete: (id: string, status: CalendarEvent["status"]) => void
}) {
  const [title, setTitle] = useState(
    source?.title ?? (source?.category === "field_service" ? t("category.field_service") : "")
  )
  const [category, setCategory] = useState<ActivityCategory>(source?.category ?? "field_service")
  const [date, setDate] = useState(source?.date ?? isoDate(new Date()))
  const [startTime, setStartTime] = useState(source?.startTime ?? "09:00")
  const [endTime, setEndTime] = useState(source?.endTime ?? "11:00")
  const [companion, setCompanion] = useState(source?.companion ?? "")
  const [serviceType, setServiceType] = useState<FieldServiceType>(source?.serviceType ?? "house_to_house")
  const [location, setLocation] = useState(source?.location ?? "")
  const [notes, setNotes] = useState(source?.notes ?? "")
  const [status, setStatus] = useState<ActivityStatus>(source?.status ?? "planned")

  const duration = useMemo(() => {
    try {
      return minutesBetween(startTime, endTime)
    } catch {
      return 0
    }
  }, [startTime, endTime])

  function buildEvent(id: string): CalendarEvent | null {
    const parsed = activitySchema.safeParse({
      title: title.trim() || t(`category.${category}`),
      category,
      date,
      startTime,
      endTime,
      companion: companion.trim() || undefined,
      serviceType: category === "field_service" ? serviceType : undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      status,
    })
    if (!parsed.success) return null
    const now = new Date().toISOString()
    return {
      id,
      ...parsed.data,
      durationMinutes: minutesBetween(parsed.data.startTime, parsed.data.endTime),
      createdAt: source?.createdAt ?? now,
      updatedAt: now,
    }
  }

  function save(ignoreConflict = false) {
    const event = buildEvent(editingId ?? crypto.randomUUID())
    if (!event) {
      toast.error(t("activity.error"))
      return
    }
    const conflict = detectScheduleConflict(events, event)
    if (conflict && !ignoreConflict) {
      onConflict({ pending: event, existing: conflict })
      return
    }
    onSave(event)
    onClose()
  }

  return (
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            {editingId ? t("activity.edit") : t("activity.new")}
          </DialogTitle>
          <DialogDescription>{t("service.personalNote")}</DialogDescription>
        </DialogHeader>
        <form
          className="grid max-h-[65vh] gap-3 overflow-y-auto pr-1"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <Field label={t("activity.type")}>
            <Select value={category} onValueChange={(value) => setCategory(value as ActivityCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_ORDER.map((item) => (
                  <SelectItem key={item} value={item}>
                    {t(`category.${item}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("activity.title")}>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label={t("activity.date")}>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label={t("activity.start")}>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </Field>
            <Field label={t("activity.end")}>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </Field>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("activity.duration")}: {formatHoursShort(duration / 60, lang)}
          </p>
          {category === "field_service" ? (
            <>
              <Field label={t("activity.serviceType")}>
                <Select
                  value={serviceType}
                  onValueChange={(value) => setServiceType(value as FieldServiceType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((item) => (
                      <SelectItem key={item} value={item}>
                        {t(`service.${item}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("activity.companion")}>
                <Input value={companion} onChange={(e) => setCompanion(e.target.value)} />
              </Field>
              <Field label={t("activity.location")}>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} />
              </Field>
            </>
          ) : null}
          <Field label={t("activity.status")}>
            <Select value={status} onValueChange={(value) => setStatus(value as ActivityStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["planned", "completed", "cancelled"] as const).map((item) => (
                  <SelectItem key={item} value={item}>
                    {t(`status.${item}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("activity.notes")}>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </Field>
          <DialogFooter className="sticky bottom-0">
            {editingId ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onDelete(editingId)
                  onClose()
                }}
              >
                {t("activity.delete")}
              </Button>
            ) : null}
            {editingId && status !== "completed" ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  onComplete(editingId, "completed")
                  onClose()
                }}
              >
                {t("activity.complete")}
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={onClose}>
              {t("activity.cancel")}
            </Button>
            <Button type="submit">{t("activity.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <Label className="text-muted-foreground">{label}</Label>
      {children}
    </label>
  )
}
