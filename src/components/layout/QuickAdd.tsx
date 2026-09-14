"use client"

import { BookOpen, CalendarPlus, NotebookPen, Sprout } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useT } from "@/lib/i18n"
import { isoDate } from "@/lib/dates"
import { useUiStore } from "@/lib/ui-store"

export function QuickAdd() {
  const t = useT()
  const open = useUiStore((state) => state.quickOpen)
  const setQuickOpen = useUiStore((state) => state.setQuickOpen)
  const openActivity = useUiStore((state) => state.openActivity)
  const openExperience = useUiStore((state) => state.openExperience)
  const today = isoDate(new Date())

  return (
    <DropdownMenu open={open} onOpenChange={setQuickOpen}>
      <DropdownMenuTrigger className="sr-only">+</DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="mb-2 w-56">
        <DropdownMenuItem
          onClick={() =>
            openActivity({
              category: "field_service",
              title: t("category.field_service"),
              date: today,
              status: "planned",
            })
          }
        >
          <Sprout className="size-4" />
          {t("quick.service")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            openActivity({
              category: "personal",
              title: "",
              date: today,
              status: "planned",
            })
          }
        >
          <CalendarPlus className="size-4" />
          {t("quick.event")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openExperience(null)}>
          <BookOpen className="size-4" />
          {t("quick.experience")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            openActivity({
              category: "personal",
              title: t("quick.note"),
              date: today,
              status: "planned",
              notes: "",
            })
          }
        >
          <NotebookPen className="size-4" />
          {t("quick.note")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
