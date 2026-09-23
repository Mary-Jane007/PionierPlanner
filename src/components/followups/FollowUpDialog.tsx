"use client"

import { useEffect, useState } from "react"
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
import { Label } from "@/components/ui/label"
import { emptyFollowUp } from "@/lib/followups"
import { useT } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import type { FollowUpKind } from "@/types"

export function FollowUpDialog({
  open,
  kind,
  onClose,
  onCreated,
}: {
  open: boolean
  kind: FollowUpKind
  onClose: () => void
  onCreated: (id: string) => void
}) {
  const t = useT()
  const upsert = useAppStore((s) => s.upsertFollowUp)
  const [name, setName] = useState("")
  const [nextDate, setNextDate] = useState("")

  useEffect(() => {
    if (!open) return
    setName("")
    setNextDate("")
  }, [open, kind])

  function submit() {
    const trimmed = name.trim()
    if (!trimmed) return
    const item = {
      ...emptyFollowUp(kind, trimmed),
      nextDate: nextDate || undefined,
    }
    upsert(item)
    setName("")
    setNextDate("")
    onCreated(item.id)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{t("follow.newTitle")}</DialogTitle>
          <DialogDescription>{t("follow.nameHint")}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <p className="text-sm text-muted-foreground">{t(`follow.kind.${kind}`)}</p>
          <label className="grid gap-1.5">
            <Label>{t("follow.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </label>
          <label className="grid gap-1.5">
            <Label>{t("follow.next")}</Label>
            <Input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("activity.cancel")}
            </Button>
            <Button type="submit">{t("activity.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
