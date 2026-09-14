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

  function clear(scope: CalendarClearScope) {
    clearCalendar(scope, monthDate)
    toast.success(t("calendar.cleared"))
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant={variant} />}>
        {t("calendar.startOver")}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("calendar.startOver")}</AlertDialogTitle>
          <AlertDialogDescription>{t("calendar.clearConfirm")}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2">
          <Button variant="outline" onClick={() => clear("planned")}>
            {t("calendar.clearPlanned")}
          </Button>
          <Button variant="outline" onClick={() => clear("month")}>
            {t("calendar.clearMonth")}
          </Button>
          <Button variant="destructive" onClick={() => clear("all")}>
            {t("calendar.clearAll")}
          </Button>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("activity.cancel")}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
