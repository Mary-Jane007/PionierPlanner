"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isPlannerRefreshing, refreshPlanner, subscribeRefreshBusy } from "@/lib/planner-sync"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function RefreshButton({
  variant = "icon",
  onDone,
}: {
  variant?: "icon" | "row" | "sidebar"
  onDone?: () => void
}) {
  const t = useT()
  const [busy, setBusy] = useState(isPlannerRefreshing())

  useEffect(() => subscribeRefreshBusy(setBusy), [])

  async function onClick() {
    await refreshPlanner()
    onDone?.()
  }

  const icon = <RefreshCw className={cn("size-4", busy && "animate-spin")} />

  if (variant === "icon") {
    return (
      <Button
        size="icon"
        variant="outline"
        className="size-11 rounded-full"
        aria-label={t("nav.refresh")}
        disabled={busy}
        onClick={() => void onClick()}
      >
        {icon}
      </Button>
    )
  }

  if (variant === "sidebar") {
    return (
      <Button
        variant="outline"
        className="mb-2 h-11 w-full rounded-xl"
        disabled={busy}
        onClick={() => void onClick()}
      >
        {icon}
        {t("nav.refresh")}
      </Button>
    )
  }

  return (
    <button
      type="button"
      className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm text-foreground"
      disabled={busy}
      onClick={() => void onClick()}
    >
      {icon}
      {t("nav.refresh")}
    </button>
  )
}
