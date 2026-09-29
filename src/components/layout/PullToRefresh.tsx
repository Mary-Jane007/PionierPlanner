"use client"

import { useEffect, useRef, useState } from "react"
import { RefreshCw } from "lucide-react"
import { isPlannerRefreshing, refreshPlanner, subscribeRefreshBusy } from "@/lib/planner-sync"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const THRESHOLD = 64
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
  return Math.min(MAX_PULL, distance * 0.55)
}

function clientPoint(event: TouchEvent | PointerEvent | MouseEvent) {
  if ("touches" in event) {
    const touch = event.touches[0] ?? event.changedTouches[0]
    if (!touch) return null
    return { x: touch.clientX, y: touch.clientY }
  }
  return { x: event.clientX, y: event.clientY }
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

  function stopTracking() {
    tracking.current = false
    pulling.current = false
    pullRef.current = 0
    document.documentElement.classList.remove("ptr-tracking")
  }

  useEffect(() => {
    if (disabled) {
      stopTracking()
      setPull(0)
    }
  }, [disabled])

  useEffect(() => {
    function begin(event: TouchEvent | PointerEvent | MouseEvent) {
      if (disabled || busy || overlayOpen() || tracking.current) return
      if ("button" in event && event.button !== undefined && event.button > 0) return
      const target = event.target
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) {
        return
      }
      if (!pageAtTop() || nestedScrollNotAtTop(event.target)) return
      const point = clientPoint(event)
      if (!point) return
      startY.current = point.y
      startX.current = point.x
      tracking.current = true
      pulling.current = false
      document.documentElement.classList.add("ptr-tracking")
    }

    function move(event: TouchEvent | PointerEvent | MouseEvent) {
      if (!tracking.current || disabled || busy) return
      const point = clientPoint(event)
      if (!point) return
      const dy = point.y - startY.current
      const dx = point.x - startX.current
      if (!pulling.current) {
        if (dy < 8 || Math.abs(dx) > dy) {
          if (Math.abs(dx) > 12 || dy < -8) stopTracking()
          return
        }
        if (!pageAtTop() || nestedScrollNotAtTop(event.target) || overlayOpen()) {
          stopTracking()
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

    function end() {
      if (!tracking.current) return
      const distance = pullRef.current
      stopTracking()
      if (distance >= THRESHOLD && !busy && !disabled) {
        setPull(THRESHOLD)
        void refreshPlanner().finally(() => setPull(0))
        return
      }
      setPull(0)
    }

    const opts = { capture: true, passive: false } as const
    window.addEventListener("touchstart", begin, opts)
    window.addEventListener("touchmove", move, opts)
    window.addEventListener("touchend", end, true)
    window.addEventListener("touchcancel", end, true)
    window.addEventListener("pointerdown", begin, opts)
    window.addEventListener("pointermove", move, opts)
    window.addEventListener("pointerup", end, true)
    window.addEventListener("pointercancel", end, true)
    return () => {
      document.documentElement.classList.remove("ptr-tracking")
      window.removeEventListener("touchstart", begin, true)
      window.removeEventListener("touchmove", move, true)
      window.removeEventListener("touchend", end, true)
      window.removeEventListener("touchcancel", end, true)
      window.removeEventListener("pointerdown", begin, true)
      window.removeEventListener("pointermove", move, true)
      window.removeEventListener("pointerup", end, true)
      window.removeEventListener("pointercancel", end, true)
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
