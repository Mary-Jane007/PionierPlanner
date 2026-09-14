"use client"

import { formatHoursShort } from "@/lib/format"
import { formatHumanDate, parseDate } from "@/lib/dates"
import { useT, useLang } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { useUiStore } from "@/lib/ui-store"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StartTimerButton } from "@/components/activities/ServiceTimer"

export function ActivitiesBoard() {
  const t = useT()
  const lang = useLang()
  const events = useAppStore((s) => s.events)
  const setEventStatus = useAppStore((s) => s.setEventStatus)
  const openActivity = useUiStore((s) => s.openActivity)
  const sorted = [...events].sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`))

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-4xl">{t("nav.activities")}</h1>
        </div>
        <div className="flex gap-2">
          <StartTimerButton />
          <Button onClick={() => openActivity({ category: "field_service" })}>
            {t("nav.addActivity")}
          </Button>
        </div>
      </header>
      {sorted.length === 0 ? (
        <div className="card-quiet rounded-3xl px-6 py-16 text-center">
          <h2 className="font-heading text-2xl">{t("empty.month")}</h2>
          <p className="mt-2 text-muted-foreground">{t("empty.monthText")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((event) => (
            <article key={event.id} className="card-quiet flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
              <button type="button" className="flex-1 text-left" onClick={() => openActivity(event, event.id)}>
                <p className="text-xs text-muted-foreground">
                  {formatHumanDate(parseDate(event.date), lang)} · {event.startTime}–{event.endTime}
                </p>
                <p className="font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {t(`category.${event.category}`)} · {formatHoursShort(event.durationMinutes / 60, lang)} · {t(`status.${event.status}`)}
                </p>
              </button>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openActivity(event, event.id)}
                >
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
        </div>
      )}
    </div>
  )
}
