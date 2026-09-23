"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete"
import { Input } from "@/components/ui/input"
import { FollowUpDetail } from "@/components/followups/FollowUpDetail"
import { FollowUpDialog } from "@/components/followups/FollowUpDialog"
import { dueSoon, isOverdue, sortFollowUps, unansweredCount } from "@/lib/followups"
import { formatHumanDate, parseDate } from "@/lib/dates"
import { useT, useLang } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import type { FollowUpKind } from "@/types"

type Filter = "all" | FollowUpKind | "due" | "done"

export function FollowUpsBoard() {
  const t = useT()
  const lang = useLang()
  const router = useRouter()
  const params = useSearchParams()
  const selectedId = params.get("id")
  const followUps = useAppStore((s) => s.followUps)
  const deleteFollowUp = useAppStore((s) => s.deleteFollowUp)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [createKind, setCreateKind] = useState<FollowUpKind | null>(null)

  const filtered = useMemo(() => {
    return sortFollowUps(followUps).filter((item) => {
      if (filter === "done" && item.status !== "done") return false
      if (filter === "due" && !dueSoon(item) && !isOverdue(item)) return false
      if (filter === "return_visit" && item.kind !== "return_visit") return false
      if (filter === "bible_study" && item.kind !== "bible_study") return false
      if (query.trim()) {
        const hay = `${item.name} ${item.notes} ${item.publication ?? ""} ${item.address ?? ""}`.toLowerCase()
        if (!hay.includes(query.toLowerCase())) return false
      }
      return true
    })
  }, [followUps, filter, query])

  function openItem(id: string) {
    router.push(`/nabezoeken/?id=${id}`)
  }

  if (selectedId) {
    return <FollowUpDetail id={selectedId} onBack={() => router.push("/nabezoeken/")} />
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">{t("follow.title")}</p>
          <h1 className="font-heading text-4xl">{t("follow.title")}</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">{t("follow.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="h-11 rounded-xl" onClick={() => setCreateKind("return_visit")}>
            {t("follow.newVisit")}
          </Button>
          <Button variant="outline" className="h-11 rounded-xl" onClick={() => setCreateKind("bible_study")}>
            {t("follow.newStudy")}
          </Button>
        </div>
      </header>

      <div className="relative max-w-xl">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={t("exp.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "follow.filter.all"],
            ["return_visit", "follow.kind.return_visit"],
            ["bible_study", "follow.kind.bible_study"],
            ["due", "follow.due"],
            ["done", "follow.status.done"],
          ] as const
        ).map(([value, key]) => (
          <FilterChip key={value} active={filter === value} onClick={() => setFilter(value)}>
            {t(key)}
          </FilterChip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card-quiet rounded-3xl px-6 py-16 text-center">
          <h2 className="font-heading text-3xl">{t("follow.empty")}</h2>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button onClick={() => setCreateKind("return_visit")}>{t("follow.newVisit")}</Button>
            <Button variant="outline" onClick={() => setCreateKind("bible_study")}>
              {t("follow.newStudy")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => {
            const open = unansweredCount(item)
            const overdue = isOverdue(item)
            return (
              <article key={item.id} className="card-quiet flex flex-col rounded-3xl p-5">
                <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                  {t(`follow.kind.${item.kind}`)}
                  {item.status !== "active" ? ` · ${t(`follow.status.${item.status}`)}` : ""}
                </p>
                <h2 className="font-heading mt-2 text-2xl">{item.name}</h2>
                {item.nextDate ? (
                  <p className={`mt-2 text-sm ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                    {overdue ? t("follow.overdue") : t("follow.next")}:{" "}
                    {formatHumanDate(parseDate(item.nextDate), lang)}
                  </p>
                ) : null}
                {item.publication ? (
                  <p className="mt-1 text-sm text-muted-foreground">{item.publication}</p>
                ) : null}
                {item.notes ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.notes}</p>
                ) : null}
                {open > 0 ? (
                  <p className="mt-3 text-xs text-primary">{t("follow.openQuestions", { n: open })}</p>
                ) : null}
                <div className="mt-4 flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openItem(item.id)}>
                    {t("activity.edit")}
                  </Button>
                  <ConfirmDeleteButton
                    title={t("activity.delete")}
                    description={t("follow.deleteConfirm")}
                    onConfirm={() => deleteFollowUp(item.id)}
                  >
                    {t("activity.delete")}
                  </ConfirmDeleteButton>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <FollowUpDialog
        open={createKind !== null}
        kind={createKind ?? "return_visit"}
        onClose={() => setCreateKind(null)}
        onCreated={openItem}
      />
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
