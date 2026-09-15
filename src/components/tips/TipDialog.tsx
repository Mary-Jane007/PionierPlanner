"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { tipSchema } from "@/lib/validation"
import { useT, useLang } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { TIP_CATEGORIES, pickCopy, type PioneerTip, type TipCategory } from "@/lib/tips"

export function TipDialog({
  open,
  onOpenChange,
  existing,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  existing?: PioneerTip | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <TipForm
          key={existing?.id ?? "new"}
          existing={existing}
          onClose={() => onOpenChange(false)}
        />
      ) : null}
    </Dialog>
  )
}

function TipForm({
  existing,
  onClose,
}: {
  existing?: PioneerTip | null
  onClose: () => void
}) {
  const t = useT()
  const lang = useLang()
  const upsert = useAppStore((s) => s.upsertCustomTip)
  const [title, setTitle] = useState(existing ? pickCopy(existing.title, lang) : "")
  const [text, setText] = useState(existing ? pickCopy(existing.text, lang) : "")
  const [scriptureReference, setScriptureReference] = useState(existing?.scriptureReference ?? "")
  const [reflection, setReflection] = useState(existing ? pickCopy(existing.reflection, lang) : "")
  const [category, setCategory] = useState<TipCategory>(existing?.category ?? "pioneering")

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="font-heading text-2xl">
          {existing ? t("tips.editTitle") : t("tips.newTitle")}
        </DialogTitle>
        <DialogDescription>{t("tips.formHint")}</DialogDescription>
      </DialogHeader>
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          const parsed = tipSchema.safeParse({
            title,
            text,
            scriptureReference,
            reflection,
            category,
          })
          if (!parsed.success) return
          const now = new Date().toISOString()
          upsert({
            id: existing?.id ?? crypto.randomUUID(),
            category: parsed.data.category,
            scriptureReference: parsed.data.scriptureReference,
            title: parsed.data.title,
            text: parsed.data.text,
            reflection: parsed.data.reflection,
            ownerAdded: true,
            createdAt: existing?.createdAt ?? now,
          })
          onClose()
        }}
      >
        <label className="grid gap-1.5">
          <Label>{t("activity.title")}</Label>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5">
            <Label>{t("tips.scripture")}</Label>
            <Input
              value={scriptureReference}
              onChange={(event) => setScriptureReference(event.target.value)}
              placeholder="Filippenzen 4:6"
              required
            />
          </label>
          <label className="grid gap-1.5">
            <Label>{t("activity.type")}</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as TipCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIP_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {t(`tips.cat.${item}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
        <label className="grid gap-1.5">
          <Label>{t("home.tip")}</Label>
          <Textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} required />
        </label>
        <label className="grid gap-1.5">
          <Label>{t("tips.reflection")}</Label>
          <Textarea
            value={reflection}
            onChange={(event) => setReflection(event.target.value)}
            rows={3}
            required
          />
        </label>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("activity.cancel")}
          </Button>
          <Button type="submit">{t("common.save")}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
