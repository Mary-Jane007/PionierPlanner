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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { emptyFollowUp } from "@/lib/followups"
import { isoDate } from "@/lib/dates"
import { useT } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import type { FollowUpContactType } from "@/types"

export function FollowUpDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (id: string) => void
}) {
  const t = useT()
  const upsert = useAppStore((s) => s.upsertFollowUp)
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [firstTalkDate, setFirstTalkDate] = useState("")
  const [firstTalkTime, setFirstTalkTime] = useState("")
  const [contactType, setContactType] = useState<FollowUpContactType>("first_conversation")
  const [family, setFamily] = useState("")
  const [background, setBackground] = useState("")
  const [interests, setInterests] = useState("")
  const [concerns, setConcerns] = useState("")

  useEffect(() => {
    if (!open) return
    setName("")
    setAddress("")
    setPhone("")
    setFirstTalkDate(isoDate(new Date()))
    setFirstTalkTime("")
    setContactType("first_conversation")
    setFamily("")
    setBackground("")
    setInterests("")
    setConcerns("")
  }, [open])

  function submit() {
    const trimmed = name.trim()
    if (!trimmed) return
    const kind = contactType === "bible_study" ? "bible_study" : "return_visit"
    const item = emptyFollowUp(kind, trimmed)
    upsert({
      ...item,
      contactType,
      address: address.trim() || undefined,
      phone: phone.trim() || undefined,
      firstTalkDate: firstTalkDate || undefined,
      firstTalkTime: firstTalkTime || undefined,
      family: family.trim() || undefined,
      background: background.trim() || undefined,
      interests: interests.trim() || undefined,
      concerns: concerns.trim() || undefined,
      status: contactType === "bible_study" ? "bible_study" : "new",
    })
    onCreated(item.id)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{t("follow.newTitle")}</DialogTitle>
          <DialogDescription>{t("follow.nameHint")}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{t("follow.basics")}</p>
          <label className="grid gap-1.5">
            <Label>{t("follow.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </label>
          <label className="grid gap-1.5">
            <Label>{t("follow.address")}</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <label className="grid gap-1.5">
            <Label>{t("follow.phone")}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <Label>{t("follow.firstTalk")}</Label>
              <Input type="date" value={firstTalkDate} onChange={(e) => setFirstTalkDate(e.target.value)} />
            </label>
            <label className="grid gap-1.5">
              <Label>{t("follow.time")}</Label>
              <Input type="time" value={firstTalkTime} onChange={(e) => setFirstTalkTime(e.target.value)} />
            </label>
          </div>
          <label className="grid gap-1.5">
            <Label>{t("follow.contact")}</Label>
            <Select value={contactType} onValueChange={(value) => setContactType(value as FollowUpContactType)}>
              <SelectTrigger className="w-full">
                <SelectValue>{t(`follow.contact.${contactType}`)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first_conversation">{t("follow.contact.first_conversation")}</SelectItem>
                <SelectItem value="return_visit">{t("follow.contact.return_visit")}</SelectItem>
                <SelectItem value="bible_study">{t("follow.contact.bible_study")}</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{t("follow.backgroundTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("follow.backgroundHint")}</p>
            <label className="grid gap-1.5">
              <Label>{t("follow.family")}</Label>
              <Input value={family} onChange={(e) => setFamily(e.target.value)} />
            </label>
            <label className="grid gap-1.5">
              <Label>{t("follow.belief")}</Label>
              <Input value={background} onChange={(e) => setBackground(e.target.value)} />
            </label>
            <label className="grid gap-1.5">
              <Label>{t("follow.interests")}</Label>
              <Input value={interests} onChange={(e) => setInterests(e.target.value)} />
            </label>
            <label className="grid gap-1.5">
              <Label>{t("follow.concerns")}</Label>
              <Textarea className="min-h-20" value={concerns} onChange={(e) => setConcerns(e.target.value)} />
            </label>
          </div>

          <p className="text-xs text-muted-foreground">{t("follow.privacyCare")}</p>
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
