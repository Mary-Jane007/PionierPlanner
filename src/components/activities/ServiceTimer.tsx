"use client"

import { useEffect, useState } from "react"
import { Pause, Play, Square } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { formatHoursLong } from "@/lib/format"
import { isoDateInZone, formatTimeInZone } from "@/lib/timezones"
import { addHoursToTime, minutesBetween } from "@/lib/dates"
import { useT, useLang } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { useUiStore } from "@/lib/ui-store"

function formatClock(ms: number): string {
  const total = Math.floor(ms / 1000)
  const h = String(Math.floor(total / 3600)).padStart(2, "0")
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0")
  const s = String(total % 60).padStart(2, "0")
  return `${h}:${m}:${s}`
}

export function ServiceTimer() {
  const t = useT()
  const lang = useLang()
  const timer = useAppStore((s) => s.timer)
  const pauseTimer = useAppStore((s) => s.pauseTimer)
  const stopTimer = useAppStore((s) => s.stopTimer)
  const upsertEvent = useAppStore((s) => s.upsertEvent)
  const timezone = useAppStore((s) => s.settings.timezone)
  const promptMs = useUiStore((s) => s.timerPromptMs)
  const setTimerPrompt = useUiStore((s) => s.setTimerPrompt)
  const [now, setNow] = useState(0)

  useEffect(() => {
    if (!timer.running || timer.paused) return
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [timer.running, timer.paused])

  const live =
    timer.elapsedMs +
    (timer.running && !timer.paused && timer.startedAt
      ? now - new Date(timer.startedAt).getTime()
      : 0)

  if (!timer.running && promptMs === null) return null

  return (
    <>
      {timer.running ? (
        <div className="fixed bottom-24 left-1/2 z-40 w-[min(92vw,360px)] -translate-x-1/2 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] lg:bottom-6">
          <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
            {t("category.field_service")}
          </p>
          <p className="font-heading mt-1 text-4xl tabular-nums">{formatClock(live)}</p>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={pauseTimer}>
              {timer.paused ? <Play className="size-4" /> : <Pause className="size-4" />}
              {timer.paused ? t("timer.resume") : t("timer.pause")}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                const { elapsedMs } = stopTimer()
                setTimerPrompt(elapsedMs)
              }}
            >
              <Square className="size-4" />
              {t("timer.stop")}
            </Button>
          </div>
        </div>
      ) : null}

      <AlertDialog open={promptMs !== null} onOpenChange={(open) => !open && setTimerPrompt(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-2xl">
              {promptMs !== null ? formatHoursLong(promptMs / 3_600_000, lang) : ""}
            </AlertDialogTitle>
            <AlertDialogDescription>{t("timer.addPrompt")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("activity.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (promptMs === null || promptMs < 60_000) {
                  setTimerPrompt(null)
                  return
                }
                const hours = promptMs / 3_600_000
                const start = new Date()
                start.setTime(start.getTime() - Math.round(hours * 60) * 60_000)
                const startTime = formatTimeInZone(timezone, lang, start)
                const endTime = addHoursToTime(startTime, hours)
                const date = isoDateInZone(new Date(), timezone)
                upsertEvent({
                  id: crypto.randomUUID(),
                  title: t("category.field_service"),
                  category: "field_service",
                  date,
                  startTime,
                  endTime,
                  durationMinutes: minutesBetween(startTime, endTime),
                  status: "completed",
                  serviceType: "other",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                })
                setTimerPrompt(null)
              }}
            >
              {t("timer.add")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function StartTimerButton() {
  const t = useT()
  const startTimer = useAppStore((s) => s.startTimer)
  const running = useAppStore((s) => s.timer.running)
  if (running) return null
  return (
    <Button variant="outline" className="h-11 rounded-xl" onClick={startTimer}>
      {t("timer.start")}
    </Button>
  )
}
