"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useT } from "@/lib/i18n"
import { useAppStore, type CalendarClearScope } from "@/lib/store"

const SCOPE_LABEL: Record<CalendarClearScope, "calendar.clearPlanned" | "calendar.clearMonth" | "calendar.clearAll"> = {
  planned: "calendar.clearPlanned",
  month: "calendar.clearMonth",
  all: "calendar.clearAll",
}

export function StartOverDialog({
  monthDate = new Date(),
  variant = "outline",
}: {
  monthDate?: Date
  variant?: "outline" | "ghost"
}) {
  const t = useT()
  const clearCalendar = useAppStore((s) => s.clearCalendar)
  const [open, setOpen] = useState(false)
  const [scope, setScope] = useState<CalendarClearScope | null>(null)

  function resetDialog(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) setScope(null)
  }

  function confirm() {
    if (!scope) return
    clearCalendar(scope, monthDate)
    toast.success(t("calendar.cleared"))
    resetDialog(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={resetDialog}>
      <AlertDialogTrigger
        render={<Button type="button" variant={variant} className="h-11 w-full sm:w-auto" />}
      >
        {t("calendar.startOver")}
      </AlertDialogTrigger>
      <AlertDialogContent className="z-[80] max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("calendar.startOverTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {scope ? t("calendar.clearConfirmFinal") : t("calendar.clearConfirm")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {scope ? (
          <p className="text-sm font-medium">{t(SCOPE_LABEL[scope])}</p>
        ) : (
          <div className="grid gap-2">
            <Button type="button" variant="outline" onClick={() => setScope("planned")}>
              {t("calendar.clearPlanned")}
            </Button>
            <Button type="button" variant="outline" onClick={() => setScope("month")}>
              {t("calendar.clearMonth")}
            </Button>
            <Button type="button" variant="destructive" onClick={() => setScope("all")}>
              {t("calendar.clearAll")}
            </Button>
          </div>
        )}
        <AlertDialogFooter>
          {scope ? (
            <>
              <Button type="button" variant="outline" onClick={() => setScope(null)}>
                {t("setup.back")}
              </Button>
              <Button type="button" variant="destructive" onClick={confirm}>
                {t("calendar.startOverAction")}
              </Button>
            </>
          ) : (
            <AlertDialogCancel>{t("activity.cancel")}</AlertDialogCancel>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
