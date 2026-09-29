import { cn } from "@/lib/utils"

export function Logo({ className, mark = false }: { className?: string; mark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 40 40"
        className="size-9 shrink-0"
        aria-hidden
      >
        <rect width="40" height="40" rx="11" fill="var(--moss)" />
        <path
          d="M13 28V12h8.2a5.6 5.6 0 0 1 0 11.2H13"
          fill="none"
          stroke="var(--eggshell)"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="28.2" cy="13.4" r="2.15" fill="var(--mahogany)" />
      </svg>
      {!mark ? (
        <span className="font-heading text-xl leading-none tracking-tight text-foreground">
          Pioniersplanner
        </span>
      ) : null}
    </span>
  )
}
