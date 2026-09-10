"use client"

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
import { useT } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { useUiStore } from "@/lib/ui-store"

export function ConflictDialog() {
  const t = useT()
  const conflict = useUiStore((s) => s.conflict)
  const setConflict = useUiStore((s) => s.setConflict)
  const closeActivity = useUiStore((s) => s.closeActivity)
  const upsertEvent = useAppStore((s) => s.upsertEvent)

  return (
    <AlertDialog open={Boolean(conflict)} onOpenChange={(open) => !open && setConflict(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading text-2xl">
            {t("conflict.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("conflict.text", { title: conflict?.existing.title ?? "" })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("conflict.changeTime")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (conflict) upsertEvent(conflict.pending)
              setConflict(null)
              closeActivity()
            }}
          >
            {t("conflict.saveAnyway")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
