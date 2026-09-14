"use client"

import { Fragment, useMemo, useState } from "react"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CATEGORY_ORDER } from "@/lib/constants"
import {
  addHoursToTime,
  calendarGrid,
  formatMonthTitle,
  formatWeekdayShort,
  isoDate,
  isSameMonthDate,
  isToday,
  weekDays,
} from "@/lib/dates"
import { formatHoursShort, hoursFromMinutes } from "@/lib/format"
import { calculateHoursForDay } from "@/lib/calculations"
import { useT, useLang } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { useUiStore } from "@/lib/ui-store"
import { cn } from "@/lib/utils"
import { DayDroppable, EventChip, SlotDroppable } from "@/components/calendar/EventChip"
import { StartOverDialog } from "@/components/calendar/StartOverDialog"
import type { CalendarEvent } from "@/types"

export function CalendarBoard() {
  const t = useT()
  const lang = useLang()
  const events = useAppStore((s) => s.events)
  const hidden = useAppStore((s) => s.hiddenCategories)
  const toggleCategory = useAppStore((s) => s.toggleCategory)
  const moveEvent = useAppStore((s) => s.moveEvent)
  const openActivity = useUiStore((s) => s.openActivity)
  const openMove = useUiStore((s) => s.openMove)
  const [cursor, setCursor] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const visibleEvents = events.filter((event) => !hidden.includes(event.category))

  function onDragEnd(event: DragEndEvent) {
    const over = event.over
    const dragged = event.active.data.current?.event as CalendarEvent | undefined
    if (!over || !dragged) return
    const overId = String(over.id)
    if (overId.startsWith("day-")) {
      const date = overId.replace("day-", "")
      moveEvent(dragged.id, date)
    }
    if (overId.startsWith("slot-") || overId.startsWith("slot|")) {
      const parts = overId.split("|")
      const date = parts[1]
      const time = parts[2]
      if (!date || !time) return
      const hours = hoursFromMinutes(dragged.durationMinutes)
      moveEvent(dragged.id, date, time, addHoursToTime(time, hours))
    }
  }

  function addAt(date: string, startTime = "09:00") {
    openActivity({
      date,
      category: "field_service",
      title: t("category.field_service"),
      startTime,
      endTime: addHoursToTime(startTime, 2),
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            {t("calendar.title")}
          </p>
          <h1 className="font-heading text-4xl capitalize">
            {formatMonthTitle(cursor, lang)}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCursor((d) => subMonths(d, 1))} aria-label="Vorige">
            <ChevronLeft />
          </Button>
          <Button variant="outline" onClick={() => setCursor(new Date())}>
            {t("calendar.todayMark")}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCursor((d) => addMonths(d, 1))} aria-label="Volgende">
            <ChevronRight />
          </Button>
          <StartOverDialog monthDate={cursor} />
          <Tabs value={view} onValueChange={(value) => setView(value as typeof view)}>
            <TabsList>
              <TabsTrigger value="month">{t("calendar.month")}</TabsTrigger>
              <TabsTrigger value="week">{t("calendar.week")}</TabsTrigger>
              <TabsTrigger value="day">{t("calendar.day")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORY_ORDER.map((category) => {
          const active = !hidden.includes(category)
          return (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                active
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              )}
            >
              {t(`category.${category}`)}
            </button>
          )
        })}
      </div>

      {visibleEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("calendar.emptyHint")}</p>
      ) : null}

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        {view === "month" ? (
          <MonthGrid
            cursor={cursor}
            events={visibleEvents}
            onAdd={addAt}
            onMove={openMove}
          />
        ) : null}
        {view === "week" ? <WeekGrid cursor={cursor} events={visibleEvents} onAdd={addAt} /> : null}
        {view === "day" ? <DayGrid cursor={cursor} events={visibleEvents} onAdd={addAt} /> : null}
      </DndContext>
    </div>
  )
}

function MonthGrid({
  cursor,
  events,
  onAdd,
  onMove,
}: {
  cursor: Date
  events: CalendarEvent[]
  onAdd: (date: string) => void
  onMove: (id: string) => void
}) {
  const lang = useLang()
  const days = useMemo(
    () => calendarGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor]
  )
  const labels = weekDays(cursor)

  return (
    <div className="card-quiet overflow-hidden rounded-2xl">
      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {labels.map((day) => (
          <div
            key={day.toISOString()}
            className="px-2 py-3 text-center text-[11px] tracking-[0.14em] text-muted-foreground uppercase"
          >
            {formatWeekdayShort(day, lang)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const date = isoDate(day)
          const dayEvents = events.filter((event) => event.date === date)
          const hours = calculateHoursForDay(events, date)
          const outside = !isSameMonthDate(day, cursor)
          return (
            <DayDroppable
              key={date}
              date={date}
              onClick={() => onAdd(date)}
              className={cn(
                "min-h-[108px] cursor-pointer border-r border-b border-border p-2 sm:min-h-[128px]",
                outside && "bg-muted/30 text-muted-foreground",
                isToday(day) && "bg-primary/6 ring-inset ring-1 ring-primary/25"
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm">{day.getDate()}</span>
                {hours > 0 ? (
                  <span className="text-[10px] text-primary">
                    {formatHoursShort(hours, lang)}
                  </span>
                ) : null}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onPointerDown={(pointer) => {
                      if (pointer.pointerType === "touch") {
                        const handle = window.setTimeout(() => onMove(event.id), 500)
                        const clear = () => window.clearTimeout(handle)
                        window.addEventListener("pointerup", clear, { once: true })
                      }
                    }}
                  >
                    <EventChip event={event} compact={dayEvents.length > 2} />
                  </div>
                ))}
                {dayEvents.length > 3 ? (
                  <p className="text-[10px] text-muted-foreground">+{dayEvents.length - 3}</p>
                ) : null}
              </div>
            </DayDroppable>
          )
        })}
      </div>
    </div>
  )
}

function WeekGrid({
  cursor,
  events,
  onAdd,
}: {
  cursor: Date
  events: CalendarEvent[]
  onAdd: (date: string, startTime?: string) => void
}) {
  const lang = useLang()
  const days = weekDays(cursor)
  const hours = Array.from({ length: 14 }, (_, i) => i + 7)

  return (
    <div className="card-quiet overflow-x-auto rounded-2xl">
      <div className="grid min-w-[720px] grid-cols-8">
        <div className="border-b border-r border-border" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "border-b border-r border-border px-2 py-3 text-center",
              isToday(day) && "bg-primary/6"
            )}
          >
            <p className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              {formatWeekdayShort(day, lang)}
            </p>
            <p className="font-heading text-xl">{day.getDate()}</p>
          </div>
        ))}
        {hours.map((hour) => (
          <Fragment key={hour}>
            <div className="border-r border-b border-border px-2 py-6 text-xs text-muted-foreground">
              {String(hour).padStart(2, "0")}:00
            </div>
            {days.map((day) => {
              const date = isoDate(day)
              const time = `${String(hour).padStart(2, "0")}:00`
              const slotEvents = events.filter(
                (event) =>
                  event.date === date &&
                  Number(event.startTime.slice(0, 2)) === hour
              )
              return (
                <SlotDroppable
                  key={`${date}-${hour}`}
                  date={date}
                  time={time}
                  onClick={() => onAdd(date, time)}
                  className="min-h-[64px] cursor-pointer border-r border-b border-border p-1"
                >
                  {slotEvents.map((event) => (
                    <EventChip key={event.id} event={event} />
                  ))}
                </SlotDroppable>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

function DayGrid({
  cursor,
  events,
  onAdd,
}: {
  cursor: Date
  events: CalendarEvent[]
  onAdd: (date: string, startTime?: string) => void
}) {
  const date = isoDate(cursor)
  const hours = Array.from({ length: 14 }, (_, i) => i + 7)

  return (
    <div className="card-quiet overflow-hidden rounded-2xl">
      {hours.map((hour) => {
        const time = `${String(hour).padStart(2, "0")}:00`
        const slotEvents = events.filter(
          (event) =>
            event.date === date && Number(event.startTime.slice(0, 2)) === hour
        )
        return (
          <SlotDroppable
            key={time}
            date={date}
            time={time}
            onClick={() => onAdd(date, time)}
            className="flex min-h-[64px] cursor-pointer gap-3 border-b border-border px-3 py-2"
          >
            <p className="w-14 shrink-0 pt-1 text-xs text-muted-foreground">{time}</p>
            <div className="min-w-0 flex-1 space-y-1">
              {slotEvents.map((event) => (
                <TimelineItem key={event.id} event={event} />
              ))}
            </div>
          </SlotDroppable>
        )
      })}
    </div>
  )
}

export function TimelineItem({ event }: { event: CalendarEvent }) {
  const t = useT()
  const lang = useLang()
  const openActivity = useUiStore((s) => s.openActivity)
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        openActivity(event, event.id)
      }}
      className={cn(
        "cat-" + event.category,
        "flex w-full gap-4 rounded-2xl p-4 text-left"
      )}
    >
      <div className="w-16 shrink-0 text-sm tabular-nums text-muted-foreground">
        <p>{event.startTime}</p>
        <div className="my-1 ml-2 h-8 w-px bg-border" />
        <p>{event.endTime}</p>
      </div>
      <div className="flex-1">
        <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
          {t(`category.${event.category}`)}
        </p>
        <h3 className="font-heading text-2xl">{event.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatHoursShort(event.durationMinutes / 60, lang)}
          {event.companion ? ` · ${t("activity.companion")}: ${event.companion}` : ""}
        </p>
      </div>
    </button>
  )
}
