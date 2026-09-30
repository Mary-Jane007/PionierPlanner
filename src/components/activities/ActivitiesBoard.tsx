"use client"

import { useMemo, useState } from "react"
import { addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import { formatHoursShort } from "@/lib/format"
import { formatHumanDate, formatMonthTitle, isoDate, isSameMonthDate, parseDate } from "@/lib/dates"
import { useT, useLang } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { useUiStore } from "@/lib/ui-store"
import { Button } from "@/components/ui/button"
import { StartTimerButton } from "@/components/activities/ServiceTimer"
import { surfaceClass } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/types"

function defaultDateForMonth(cursor: Date): string {
  const now = new Date()
  if (isSameMonthDate(cursor, now)) return isoDate(now)
  return isoDate(new Date(cursor.getFullYear(), cursor.getMonth(), 1))
}

function groupByDate(events: CalendarEvent[]) {
  const groups: { date: string; items: CalendarEvent[] }[] = []
  for (const event of events) {
    const last = groups[groups.length - 1]
    if (last?.date === event.date) last.items.push(event)
    else groups.push({ date: event.date, items: [event] })
  }
  return groups
}

export function ActivitiesBoard() {
  const t = useT()
  const lang = useLang()
  const events = useAppStore((s) => s.events)
  const setEventStatus = useAppStore((s) => s.setEventStatus)
  const openActivity = useUiStore((s) => s.openActivity)
  const [cursor, setCursor] = useState(() => new Date())
  const monthTitle = formatMonthTitle(cursor, lang)

  const monthEvents = useMemo(
    () =>
      events
        .filter((event) => isSameMonthDate(parseDate(event.date), cursor))
        .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`)),
    [events, cursor]
  )
  const grouped = useMemo(() => groupByDate(monthEvents), [monthEvents])

  function addInMonth() {
    openActivity({
      category: "field_service",
      date: defaultDateForMonth(cursor),
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            {t("nav.activities")}
          </p>
          <h1 className="font-heading text-4xl capitalize">{monthTitle}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCursor((value) => subMonths(value, 1))}
            aria-label={t("activity.prevMonth")}
          >
            <ChevronLeft />
          </Button>
          <Button variant="outline" onClick={() => setCursor(new Date())}>
            {t("calendar.todayMark")}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCursor((value) => addMonths(value, 1))}
            aria-label={t("activity.nextMonth")}
          >
            <ChevronRight />
          </Button>
          <StartTimerButton />
          <Button onClick={addInMonth}>{t("nav.addActivity")}</Button>
        </div>
      </header>
      {monthEvents.length === 0 ? (
        <div className="surface-sage rounded-3xl px-6 py-16 text-center">
          <h2 className="font-heading text-2xl">
            {t("empty.activitiesMonth", { month: monthTitle })}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("empty.activitiesMonthText")}</p>
          <Button className="mt-6" onClick={addInMonth}>
            {t("empty.planFirst")}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <section key={group.date} className="space-y-2">
              <h2 className="px-1 text-sm font-medium text-muted-foreground">
                {formatHumanDate(parseDate(group.date), lang)}
              </h2>
              {group.items.map((event, index) => (
                <article
                  key={event.id}
                  className={cn(
                    surfaceClass(index),
                    "flex items-center justify-between gap-3 rounded-2xl px-4 py-3",
                    `stripe-${event.category}`
                  )}
                >
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => openActivity(event, event.id)}
                  >
                    <p className="text-xs text-muted-foreground">
                      {event.startTime}–{event.endTime}
                    </p>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t(`category.${event.category}`)} · {formatHoursShort(event.durationMinutes / 60, lang)} ·{" "}
                      {t(`status.${event.status}`)}
                    </p>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openActivity(event, event.id)}>
                      <Pencil />
                      {t("activity.edit")}
                    </Button>
                    {event.status === "planned" ? (
                      <Button variant="secondary" size="sm" onClick={() => setEventStatus(event.id, "completed")}>
                        {t("activity.complete")}
                      </Button>
                    ) : null}
                  </div>
                </article>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
