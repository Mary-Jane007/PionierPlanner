"use client"

import { useDraggable, useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
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
    <div
      ref={setNodeRef}
      className={cn(
        "cat-" + event.category,
        "flex w-full items-stretch overflow-hidden rounded-md text-left text-[11px] leading-tight transition-opacity",
        isDragging && "opacity-40",
        event.status === "cancelled" && "line-through opacity-60",
        event.status === "completed" && "opacity-80"
      )}
      style={{ transform: CSS.Translate.toString(transform) }}
    >
      <button
        type="button"
        className="flex shrink-0 items-center px-0.5 opacity-70 hover:opacity-100"
        aria-label={t("calendar.drag")}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => {
          e.preventDefault()
          e.stopPropagation()
          openMove(event.id)
        }}
        {...listeners}
        {...attributes}
      >
        <GripVertical className="size-3" />
      </button>
      <button
        type="button"
        className="min-w-0 flex-1 px-1 py-1 text-left"
        onClick={(e) => {
          e.stopPropagation()
          openActivity(event, event.id)
        }}
        onContextMenu={(e) => {
          e.preventDefault()
          e.stopPropagation()
          openMove(event.id)
        }}
      >
        <span className="block truncate font-medium">
          {compact ? formatHoursShort(hours, lang) : `${event.startTime} ${event.title}`}
        </span>
        {!compact ? (
          <span className="block text-[10px] opacity-80">
            {event.category === "field_service"
              ? formatHoursShort(hours, lang)
              : t(`category.${event.category}`)}
          </span>
        ) : null}
      </button>
    </div>
  )
}

export function DayDroppable({
  date,
  children,
  className,
  onClick,
}: {
  date: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-${date}`, data: { date } })
  return (
    <div
      ref={setNodeRef}
      className={cn(className, isOver && "ring-2 ring-primary/30")}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function SlotDroppable({
  date,
  time,
  children,
  className,
  onClick,
}: {
  date: string
  time: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot|${date}|${time}`,
    data: { date, time },
  })
  return (
    <div
      ref={setNodeRef}
      className={cn(className, isOver && "ring-2 ring-primary/30")}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
