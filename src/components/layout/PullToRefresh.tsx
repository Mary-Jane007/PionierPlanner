"use client"

import { useEffect, useRef, useState } from "react"
import { RefreshCw } from "lucide-react"
import { isPlannerRefreshing, refreshPlanner, subscribeRefreshBusy } from "@/lib/planner-sync"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const THRESHOLD = 72
const MAX_PULL = 128

function overlayOpen() {
  return Boolean(
    document.querySelector(
      "[data-slot='sheet-content'], [data-slot='alert-dialog-content'], [data-slot='dialog-content']"
    )
  )
}

function nestedScrollNotAtTop(target: EventTarget | null) {
  let el = target instanceof Element ? target : null
  while (el && el !== document.body && el !== document.documentElement) {
    const oy = window.getComputedStyle(el).overflowY
    const canScroll =
      (oy === "auto" || oy === "scroll" || oy === "overlay") && el.scrollHeight > el.clientHeight + 4
    if (canScroll && el.scrollTop > 2) return true
    el = el.parentElement
  }
  return false
}

function pageAtTop() {
  const top = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
  return top <= 2
}

function dampen(distance: number) {
  return Math.min(MAX_PULL, distance * 0.45)
}

function allowPointer(event: PointerEvent) {
  if (event.pointerType === "touch" || event.pointerType === "pen") return true
  return event.pointerType === "mouse" && window.matchMedia("(max-width: 1023px)").matches
}

export function PullToRefresh({
  children,
  disabled = false,
}: {
  children: React.ReactNode
  disabled?: boolean
}) {
  const t = useT()
  const [pull, setPull] = useState(0)
  const [busy, setBusy] = useState(isPlannerRefreshing())
  const startY = useRef(0)
  const startX = useRef(0)
  const tracking = useRef(false)
  const pulling = useRef(false)
  const pullRef = useRef(0)

  useEffect(() => subscribeRefreshBusy(setBusy), [])

  useEffect(() => {
    if (disabled) {
      tracking.current = false
      pulling.current = false
      pullRef.current = 0
      setPull(0)
    }
  }, [disabled])

  useEffect(() => {
    function onStart(event: PointerEvent) {
      if (disabled || busy || overlayOpen() || !allowPointer(event)) return
      if (event.button !== 0 && event.pointerType === "mouse") return
      const target = event.target
      if (target instanceof HTMLElement) {
        const tag = target.closest("input, textarea, select, [contenteditable='true']")
        if (tag) return
      }
      if (!pageAtTop() || nestedScrollNotAtTop(event.target)) return
      startY.current = event.clientY
      startX.current = event.clientX
      tracking.current = true
      pulling.current = false
    }

    function onMove(event: PointerEvent) {
      if (!tracking.current || disabled || busy) return
      const dy = event.clientY - startY.current
      const dx = event.clientX - startX.current
      if (!pulling.current) {
        if (dy < 10 || Math.abs(dx) > dy) {
          if (Math.abs(dx) > 12 || dy < -8) tracking.current = false
          return
        }
        if (!pageAtTop() || nestedScrollNotAtTop(event.target) || overlayOpen()) {
          tracking.current = false
          return
        }
        pulling.current = true
      }
      if (dy <= 0) {
        pullRef.current = 0
        setPull(0)
        return
      }
      if (event.cancelable) event.preventDefault()
      const next = dampen(dy)
      pullRef.current = next
      setPull(next)
    }

    function onEnd() {
      if (!tracking.current) return
      tracking.current = false
      const distance = pullRef.current
      pulling.current = false
      pullRef.current = 0
      if (distance >= THRESHOLD && !busy && !disabled) {
        setPull(THRESHOLD)
        void refreshPlanner().finally(() => setPull(0))
        return
      }
      setPull(0)
    }

    window.addEventListener("pointerdown", onStart)
    window.addEventListener("pointermove", onMove, { passive: false })
    window.addEventListener("pointerup", onEnd)
    window.addEventListener("pointercancel", onEnd)
    return () => {
      window.removeEventListener("pointerdown", onStart)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onEnd)
      window.removeEventListener("pointercancel", onEnd)
    }
  }, [busy, disabled])

  const visible = busy || pull > 4
  const ready = pull >= THRESHOLD || busy

  return (
    <div className="relative">
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 z-40 flex justify-center transition-opacity",
          visible ? "opacity-100" : "opacity-0"
        )}
        style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}
        aria-hidden={!visible}
      >
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-full border border-border bg-card text-primary shadow-[var(--shadow-card)]",
            ready ? "scale-100" : "scale-90"
          )}
          style={{
            transform: `translateY(${Math.max(0, (busy ? THRESHOLD : pull) - 16)}px) scale(${ready ? 1 : 0.85 + pull / 400})`,
          }}
        >
          <RefreshCw
            className={cn("size-5", busy && "animate-spin")}
            style={busy ? undefined : { transform: `rotate(${pull * 2}deg)` }}
            aria-hidden
          />
          <span className="sr-only">{busy ? t("refresh.busy") : t("nav.refresh")}</span>
        </div>
      </div>
      {children}
    </div>
  )
}
