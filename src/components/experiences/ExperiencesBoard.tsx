"use client"

import { useMemo, useState } from "react"
import { Heart, Search, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete"
import { Input } from "@/components/ui/input"
import { formatHumanDate, parseDate } from "@/lib/dates"
import { useT, useLang } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { useUiStore } from "@/lib/ui-store"
import type { ExperienceCategory } from "@/types"

const categories: ExperienceCategory[] = [
  "nice_response",
  "bible_study",
  "return_visit",
  "informal",
  "encouragement",
  "personal_lesson",
  "other",
]

export function ExperiencesBoard() {
  const t = useT()
  const lang = useLang()
  const experiences = useAppStore((s) => s.experiences)
  const toggleFavorite = useAppStore((s) => s.toggleFavorite)
  const deleteExperience = useAppStore((s) => s.deleteExperience)
  const openExperience = useUiStore((s) => s.openExperience)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<ExperienceCategory | "all">("all")
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const filtered = useMemo(() => {
    return experiences.filter((item) => {
      if (favoritesOnly && !item.favorite) return false
      if (category !== "all" && item.category !== category) return false
      if (query.trim()) {
        const hay = `${item.title} ${item.text} ${item.learned ?? ""}`.toLowerCase()
        if (!hay.includes(query.toLowerCase())) return false
      }
      return true
    })
  }, [experiences, query, category, favoritesOnly])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">{t("exp.title")}</p>
          <h1 className="font-heading text-4xl">{t("exp.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("exp.subtitle")}</p>
        </div>
        <Button className="h-11 rounded-xl" onClick={() => openExperience(null)}>
          {t("exp.new")}
        </Button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t("exp.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button
          variant={favoritesOnly ? "default" : "outline"}
          onClick={() => setFavoritesOnly((value) => !value)}
        >
          <Star className="size-4" />
          {t("exp.favorite")}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
          {t("calendar.filter.all")}
        </FilterChip>
        {categories.map((item) => (
          <FilterChip key={item} active={category === item} onClick={() => setCategory(item)}>
            {t(`exp.cat.${item}`)}
          </FilterChip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card-quiet rounded-3xl px-6 py-16 text-center">
          <h2 className="font-heading text-3xl">{t("exp.empty")}</h2>
          <Button className="mt-4" onClick={() => openExperience(null)}>
            {t("exp.new")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => (
            <article key={item.id} className="card-quiet rounded-3xl p-5">
              <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {formatHumanDate(parseDate(item.date), lang)}
              </p>
              <h2 className="font-heading mt-2 text-2xl">{item.title}</h2>
              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span key={tag} className="text-xs text-primary">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => toggleFavorite(item.id)}>
                  <Heart className={item.favorite ? "fill-current" : ""} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openExperience(item.id)}>
                  {t("activity.edit")}
                </Button>
                <ConfirmDeleteButton
                  title={t("activity.delete")}
                  description={t("exp.deleteConfirm")}
                  onConfirm={() => deleteExperience(item.id)}
                >
                  {t("activity.delete")}
                </ConfirmDeleteButton>
              </div>
            </article>
          ))}
        </div>
      )}
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
