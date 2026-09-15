"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BookOpen,
  CalendarDays,
  Compass,
  Ellipsis,
  LayoutGrid,
  Plus,
  Sparkles,
  UserRound,
  BarChart3,
  ListTodo,
} from "lucide-react"
import { Logo } from "@/components/brand/Logo"
import { Button } from "@/components/ui/button"
import { isoDate } from "@/lib/dates"
import { useT } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { useUiStore } from "@/lib/ui-store"
import { cn } from "@/lib/utils"
import { ServiceTimer } from "@/components/activities/ServiceTimer"
import { PageLoader } from "@/components/layout/PageLoader"
import { ActivityDialog } from "@/components/activities/ActivityDialog"
import { ExperienceDialog } from "@/components/experiences/ExperienceDialog"
import { MoveEventSheet } from "@/components/calendar/MoveEventSheet"
import { ConflictDialog } from "@/components/activities/ConflictDialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const desktopNav = [
  { href: "/vandaag", key: "nav.today", icon: Sparkles },
  { href: "/planner", key: "nav.planner", icon: Compass },
  { href: "/kalender", key: "nav.calendar", icon: CalendarDays },
  { href: "/activiteiten", key: "nav.activities", icon: ListTodo },
  { href: "/statistieken", key: "nav.statistics", icon: BarChart3 },
  { href: "/ervaringen", key: "nav.experiences", icon: BookOpen },
  { href: "/tips", key: "nav.tips", icon: LayoutGrid },
  { href: "/profiel", key: "nav.profile", icon: UserRound },
]

const moreNav = [
  { href: "/activiteiten", key: "nav.activities", icon: ListTodo },
  { href: "/statistieken", key: "nav.statistics", icon: BarChart3 },
  { href: "/tips", key: "nav.tips", icon: LayoutGrid },
]

const mobileNav = [
  { href: "/vandaag", key: "nav.today", icon: Sparkles },
  { href: "/planner", key: "nav.planner", icon: Compass },
  { href: "/kalender", key: "nav.calendar", icon: CalendarDays },
  { href: "/ervaringen", key: "nav.experiences", icon: BookOpen },
  { href: "/profiel", key: "nav.profile", icon: UserRound },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const t = useT()
  const user = useAppStore((state) => state.user)
  const openActivity = useUiStore((state) => state.openActivity)
  const [moreOpen, setMoreOpen] = useState(false)

  function openNewActivity() {
    openActivity({
      category: "field_service",
      title: t("category.field_service"),
      date: isoDate(new Date()),
      status: "planned",
    })
  }

  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#inhoud"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
      >
        Skip
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <Link href="/vandaag" className="px-2">
          <Logo />
        </Link>
        <p className="mt-3 px-2 text-xs leading-relaxed text-muted-foreground">
          {t("app.tagline")}
        </p>
        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Hoofdmenu">
          {desktopNav.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {t(item.key)}
              </Link>
            )
          })}
        </nav>
        <Button
          className="h-11 w-full rounded-xl"
          onClick={openNewActivity}
        >
          <Plus className="size-4" />
          {t("nav.addActivity")}
        </Button>
        {user ? (
          <p className="mt-4 px-1 text-xs text-muted-foreground">{user.name}</p>
        ) : null}
        <p className="mt-3 px-1 text-[10px] leading-relaxed text-muted-foreground/80">
          {t("app.disclaimer")}
        </p>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border/80 bg-background/85 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md lg:hidden">
          <Logo mark={false} className="[&>span]:text-lg" />
          <div className="flex items-center gap-2">
            <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
              <SheetTrigger
                render={
                  <Button size="icon" variant="outline" className="size-11 rounded-full" />
                }
              >
                <Ellipsis className="size-4" />
                <span className="sr-only">{t("nav.more")}</span>
              </SheetTrigger>
              <SheetContent side="bottom" className="pb-[max(1rem,env(safe-area-inset-bottom))]">
                <SheetHeader>
                  <SheetTitle>{t("nav.more")}</SheetTitle>
                </SheetHeader>
                <nav className="grid gap-1 px-4 pb-4" aria-label={t("nav.more")}>
                  {moreNav.map((item) => {
                    const Icon = item.icon
                    const active = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          "flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm",
                          active ? "bg-primary/12 text-primary" : "text-foreground"
                        )}
                      >
                        <Icon className="size-4" />
                        {t(item.key)}
                      </Link>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
            <Button
              size="icon"
              className="size-11 rounded-full"
              aria-label={t("nav.addActivity")}
              onClick={openNewActivity}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </header>
        <main
          id="inhoud"
          className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 lg:px-8 lg:pb-12 lg:pt-8"
        >
          {children}
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden"
        aria-label="Mobiel menu"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {mobileNav.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-0.5 text-[11px] leading-tight",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="max-w-full truncate">{t(item.key)}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <button
        type="button"
        className="fixed right-4 bottom-24 z-30 hidden size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-card)] lg:flex"
        aria-label={t("nav.addActivity")}
        onClick={openNewActivity}
      >
        <Plus className="size-6" />
      </button>

      <ActivityDialog />
      <ExperienceDialog />
      <MoveEventSheet />
      <ConflictDialog />
      <ServiceTimer />
    </div>
  )
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const hydrated = useAppStore((state) => state.hydrated)
  const user = useAppStore((state) => state.user)
  const onboarded = useAppStore((state) => state.onboarded)

  useEffect(() => {
    if (!hydrated) return
    if (!user) router.replace("/")
    else if (!onboarded) router.replace("/setup")
  }, [hydrated, user, onboarded, router])

  if (!hydrated) {
    return <PageLoader />
  }
  if (!user || !onboarded) return null
  return <AppShell>{children}</AppShell>
}
