"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { TipDialog } from "@/components/tips/TipDialog"
import { isAppOwner } from "@/lib/auth"
import { useT, useLang } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import {
  TIP_CATEGORIES,
  getDailyTip,
  localizeTip,
  mergeTips,
  type PioneerTip,
  type TipCategory,
} from "@/lib/tips"

export function TipsBoard() {
  const t = useT()
  const lang = useLang()
  const user = useAppStore((s) => s.user)
  const customTips = useAppStore((s) => s.customTips)
  const deleteCustomTip = useAppStore((s) => s.deleteCustomTip)
  const owner = isAppOwner(user)
  const [category, setCategory] = useState<TipCategory | "all">("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PioneerTip | null>(null)
  const todayTip = getDailyTip(lang, new Date(), customTips)
  const tips = useMemo(
    () => mergeTips(customTips).map((tip) => localizeTip(tip, lang)),
    [customTips, lang]
  )
  const filtered = category === "all" ? tips : tips.filter((item) => item.category === category)

  function openNew() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(tip: PioneerTip) {
    setEditing(tip)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">{t("tips.title")}</p>
          <h1 className="font-heading text-4xl">{t("tips.title")}</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">{t("tips.subtitle")}</p>
        </div>
        {owner ? (
          <Button className="h-11 rounded-xl" onClick={openNew}>
            {t("tips.add")}
          </Button>
        ) : null}
      </header>

      <article className="card-quiet rounded-3xl p-6">
        <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{t("home.tip")}</p>
        <h2 className="font-heading mt-2 text-3xl">{todayTip.title}</h2>
        {todayTip.scriptureReference ? (
          <p className="mt-3 text-sm text-primary">{todayTip.scriptureReference}</p>
        ) : null}
        <p className="mt-3 max-w-2xl text-muted-foreground">{todayTip.text}</p>
        {todayTip.reflection ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {todayTip.reflection}
          </p>
        ) : null}
        <p className="mt-4 text-xs">{t("home.originalTip")}</p>
      </article>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
          {t("tips.all")}
        </FilterChip>
        {TIP_CATEGORIES.map((item) => (
          <FilterChip key={item} active={category === item} onClick={() => setCategory(item)}>
            {t(`tips.cat.${item}`)}
          </FilterChip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card-quiet rounded-3xl px-6 py-16 text-center">
          <h2 className="font-heading text-3xl">{t("tips.empty")}</h2>
          {owner ? (
            <Button className="mt-4" onClick={openNew}>
              {t("tips.add")}
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => (
            <article key={item.id} className="card-quiet rounded-3xl p-5">
              <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {t(`tips.cat.${item.category}`)}
                {item.ownerAdded ? ` · ${t("tips.ownerAdded")}` : ""}
              </p>
              <h2 className="font-heading mt-2 text-2xl">{item.title}</h2>
              {item.scriptureReference ? (
                <p className="mt-3 text-sm text-primary">{item.scriptureReference}</p>
              ) : null}
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              {item.reflection ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.reflection}</p>
              ) : null}
              {owner && item.ownerAdded ? (
                <div className="mt-4 flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                    {t("tips.editTitle")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteCustomTip(item.id)}>
                    {t("activity.delete")}
                  </Button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {owner ? (
        <TipDialog open={dialogOpen} onOpenChange={setDialogOpen} existing={editing} />
      ) : null}
    </div>
  )
}

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs ${active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
    >
      {children}
    </button>
  )
}
