"use client"

import { useState } from "react"
import { addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  addHoursToTime,
  calendarGrid,
  formatMonthTitle,
  formatWeekdayShort,
  isoDate,
  isSameMonthDate,
  isToday,
  parseDate,
} from "@/lib/dates"
import { hoursFromMinutes } from "@/lib/format"
import { useT, useLang } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { useUiStore } from "@/lib/ui-store"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/types"

export function MoveEventSheet() {
  const t = useT()
  const moveEventId = useUiStore((s) => s.moveEventId)
  const close = useUiStore((s) => s.closeMove)
  const events = useAppStore((s) => s.events)
  const moveEvent = useAppStore((s) => s.moveEvent)
  const copyEventToDates = useAppStore((s) => s.copyEventToDates)
  const event = events.find((item) => item.id === moveEventId)

  return (
    <Sheet open={Boolean(moveEventId)} onOpenChange={(open) => !open && close()}>
      {event ? (
        <EventActionForm
          key={event.id}
          event={event}
          t={t}
          onClose={close}
          onMove={moveEvent}
          onCopy={copyEventToDates}
        />
      ) : null}
    </Sheet>
  )
}

function EventActionForm({
  event,
  t,
  onClose,
  onMove,
  onCopy,
}: {
  event: CalendarEvent
  t: (key: string, vars?: Record<string, string | number>) => string
  onClose: () => void
  onMove: (id: string, date: string, startTime?: string, endTime?: string) => void
  onCopy: (id: string, dates: string[]) => { copied: number; skipped: number }
}) {
  const lang = useLang()
  const [mode, setMode] = useState<"move" | "copy">("copy")
  const [date, setDate] = useState(event.date)
  const [startTime, setStartTime] = useState(event.startTime)
  const [cursor, setCursor] = useState(() => parseDate(event.date))
  const [selected, setSelected] = useState<string[]>([])

  const days = calendarGrid(cursor.getFullYear(), cursor.getMonth())
  const labels = days.slice(0, 7)

  function toggleDate(next: string) {
    if (next === event.date) return
    setSelected((current) =>
      current.includes(next) ? current.filter((item) => item !== next) : [...current, next]
    )
  }

  function copySelected() {
    if (selected.length === 0) {
      toast.info(t("calendar.copyNone"))
      return
    }
    const result = onCopy(event.id, selected)
    if (result.copied > 0) toast.success(t("calendar.copied", { n: result.copied }))
    if (result.skipped > 0) toast.info(t("activity.repeatSkipped", { n: result.skipped }))
    onClose()
  }

  return (
    <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-3xl">
      <SheetHeader>
        <SheetTitle className="font-heading text-2xl">{t("calendar.moveOrCopy")}</SheetTitle>
        <SheetDescription>{event.title}</SheetDescription>
      </SheetHeader>
      <div className="grid grid-cols-2 gap-2 px-4">
        <Button
          type="button"
          variant={mode === "copy" ? "default" : "outline"}
          aria-pressed={mode === "copy"}
          onClick={() => setMode("copy")}
        >
          {t("calendar.copyToDates")}
        </Button>
        <Button
          type="button"
          variant={mode === "move" ? "default" : "outline"}
          aria-pressed={mode === "move"}
          onClick={() => setMode("move")}
        >
          {t("calendar.move")}
        </Button>
      </div>

      {mode === "copy" ? (
        <div className="space-y-3 px-4">
          <p className="text-sm text-muted-foreground">{t("calendar.copyHint")}</p>
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t("calendar.month")}
              onClick={() => setCursor((value) => subMonths(value, 1))}
            >
              <ChevronLeft />
            </Button>
            <p className="font-heading text-xl capitalize">{formatMonthTitle(cursor, lang)}</p>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t("calendar.month")}
              onClick={() => setCursor((value) => addMonths(value, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
          <div className="grid grid-cols-7 text-center text-[11px] tracking-wide text-muted-foreground uppercase">
            {labels.map((day) => (
              <div key={day.toISOString()} className="py-1">
                {formatWeekdayShort(day, lang)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const value = isoDate(day)
              const outside = !isSameMonthDate(day, cursor)
              const original = value === event.date
              const active = selected.includes(value)
              return (
                <button
                  key={value}
                  type="button"
                  disabled={original}
                  onClick={() => toggleDate(value)}
                  className={cn(
                    "flex min-h-11 flex-col items-center justify-center rounded-xl text-sm",
                    outside && "text-muted-foreground/50",
                    isToday(day) && !active && "cal-today",
                    original && "border border-border bg-muted text-muted-foreground",
                    active && "bg-primary text-primary-foreground"
                  )}
                >
                  {day.getDate()}
                  {original ? (
                    <span className="text-[9px] leading-none">{t("calendar.originalDay")}</span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-3 px-4">
          <label className="grid gap-1.5">
            <Label>{t("activity.date")}</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="grid gap-1.5">
            <Label>{t("activity.start")}</Label>
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </label>
        </div>
      )}

      <SheetFooter>
        <Button variant="outline" onClick={onClose}>
          {t("activity.cancel")}
        </Button>
        {mode === "copy" ? (
          <Button onClick={copySelected} disabled={selected.length === 0}>
            {selected.length > 0
              ? t("calendar.copyActionN", { n: selected.length })
              : t("calendar.copyAction")}
          </Button>
        ) : (
          <Button
            onClick={() => {
              const hours = hoursFromMinutes(event.durationMinutes)
              const endTime = addHoursToTime(startTime, hours)
              onMove(event.id, date, startTime, endTime)
              onClose()
            }}
          >
            {t("common.save")}
          </Button>
        )}
      </SheetFooter>
    </SheetContent>
  )
}
