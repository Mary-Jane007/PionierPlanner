"use client"

import { useDraggable, useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { formatHoursShort } from "@/lib/format"
import { useT, useLang } from "@/lib/i18n"
import { useUiStore } from "@/lib/ui-store"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/types"

export function EventChip({
  event,
  compact = false,
}: {
  event: CalendarEvent
  compact?: boolean
}) {
  const t = useT()
  const lang = useLang()
  const openActivity = useUiStore((s) => s.openActivity)
  const openMove = useUiStore((s) => s.openMove)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `event-${event.id}`,
    data: { event },
  })
  const hours = event.durationMinutes / 60

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      type="button"
      onClick={() => openActivity(event, event.id)}
      onContextMenu={(e) => {
        e.preventDefault()
        openMove(event.id)
      }}
      className={cn(
        "cat-" + event.category,
        "w-full rounded-md px-1.5 py-1 text-left text-[11px] leading-tight transition-opacity",
        isDragging && "opacity-40",
        event.status === "cancelled" && "line-through opacity-60",
        event.status === "completed" && "opacity-80"
      )}
      style={{ transform: CSS.Translate.toString(transform) }}
    >
      <span className="block truncate font-medium">
        {compact ? formatHoursShort(hours, lang) : `${event.startTime} ${event.title}`}
      </span>
      {!compact ? (
        <span className="block text-[10px] opacity-80">
          {event.category === "field_service" ? formatHoursShort(hours, lang) : t(`category.${event.category}`)}
        </span>
      ) : null}
    </button>
  )
}

export function DayDroppable({
  date,
  children,
  className,
}: {
  date: string
  children: React.ReactNode
  className?: string
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-${date}`, data: { date } })
  return (
    <div
      ref={setNodeRef}
      className={cn(className, isOver && "ring-2 ring-primary/30")}
    >
      {children}
    </div>
  )
}
