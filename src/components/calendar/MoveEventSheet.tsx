"use client"

import { useState } from "react"
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
import { addHoursToTime } from "@/lib/dates"
import { hoursFromMinutes } from "@/lib/format"
import { useT } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { useUiStore } from "@/lib/ui-store"
import type { CalendarEvent } from "@/types"

export function MoveEventSheet() {
  const t = useT()
  const moveEventId = useUiStore((s) => s.moveEventId)
  const close = useUiStore((s) => s.closeMove)
  const events = useAppStore((s) => s.events)
  const moveEvent = useAppStore((s) => s.moveEvent)
  const event = events.find((item) => item.id === moveEventId)

  return (
    <Sheet open={Boolean(moveEventId)} onOpenChange={(open) => !open && close()}>
      {event ? (
        <MoveForm key={event.id} event={event} t={t} onClose={close} onMove={moveEvent} />
      ) : null}
    </Sheet>
  )
}

function MoveForm({
  event,
  t,
  onClose,
  onMove,
}: {
  event: CalendarEvent
  t: (key: string) => string
  onClose: () => void
  onMove: (id: string, date: string, startTime?: string, endTime?: string) => void
}) {
  const [date, setDate] = useState(event.date)
  const [startTime, setStartTime] = useState(event.startTime)

  return (
    <SheetContent side="bottom" className="rounded-t-3xl">
      <SheetHeader>
        <SheetTitle className="font-heading text-2xl">{t("calendar.move")}</SheetTitle>
        <SheetDescription>{event.title}</SheetDescription>
      </SheetHeader>
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
      <SheetFooter>
        <Button variant="outline" onClick={onClose}>
          {t("activity.cancel")}
        </Button>
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
      </SheetFooter>
    </SheetContent>
  )
}
