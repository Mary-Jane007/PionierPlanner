"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/brand/Logo"
import { InstallAppButtons } from "@/components/landing/InstallAppButtons"
import { PageLoader } from "@/components/layout/PageLoader"
import { buttonVariants } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import { isNativeApp } from "@/lib/native"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const features = [
  "plan",
  "calendar",
  "stats",
  "journal",
  "tips",
  "offline",
] as const

export function LandingPage() {
  const t = useT()
  const router = useRouter()
  const user = useAppStore((s) => s.user)
  const onboarded = useAppStore((s) => s.onboarded)
  const hydrated = useAppStore((s) => s.hydrated)
  const [native, setNative] = useState(false)

  useEffect(() => {
    setNative(isNativeApp())
  }, [])

  useEffect(() => {
    if (hydrated && user && onboarded) router.replace("/vandaag")
  }, [hydrated, user, onboarded, router])

  if (!hydrated || (user && onboarded)) {
    return <PageLoader />
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <Logo />
        <div className="flex gap-2">
          <Link href="/inloggen" className={cn(buttonVariants({ variant: "ghost" }), "min-h-11 px-3")}>
            {t("landing.login")}
          </Link>
          <Link href="/inloggen?mode=start" className={cn(buttonVariants(), "min-h-11 px-3")}>
            {t("landing.cta")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <section className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-xs tracking-[0.2em] text-accent uppercase">{t("app.name")}</p>
            <h1 className="font-heading mt-4 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              {t("landing.heroTitle")}
              <br />
              {t("landing.heroSubtitle")}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t("landing.description")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/inloggen?mode=start" className={cn(buttonVariants(), "h-12 rounded-xl px-6")}>
                {t("landing.openApp")}
              </Link>
              <Link href="/inloggen" className={cn(buttonVariants({ variant: "outline" }), "h-12 rounded-xl px-6")}>
                {t("landing.login")}
              </Link>
            </div>
            {native ? null : (
              <>
                <InstallAppButtons className="mt-3" />
                <p className="mt-3 max-w-xl text-xs text-muted-foreground">{t("landing.installHint")}</p>
                <p className="mt-2">
                  <Link href="/download" className="text-xs text-muted-foreground underline">
                    {t("landing.installHelp")}
                  </Link>
                </p>
              </>
            )}
            <p className="mt-2 max-w-xl text-xs text-muted-foreground">{t("landing.offlineHint")}</p>
          </div>
          <PreviewCard />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item, index) => (
            <article
              key={item}
              className={cn(
                "rounded-3xl p-6",
                ["surface-primary", "surface-sage", "surface-warm", "surface-accent", "surface-sage", "surface-primary"][
                  index
                ]
              )}
            >
              <h2 className="font-heading text-2xl">{t(`landing.feature.${item}.title`)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`landing.feature.${item}.text`)}
              </p>
            </article>
          ))}
        </section>

        <p className="mx-auto mt-16 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
          {t("app.disclaimer")}
        </p>
      </main>
    </div>
  )
}

function PreviewCard() {
  return (
    <div className="surface-sage rounded-[2rem] p-6 sm:p-8">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Gewone pionier</p>
      <p className="font-heading mt-3 text-5xl">32 / 50 uur</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary/15">
        <div className="h-full w-[64%] rounded-full bg-primary" />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">Nog 18 uur · Deze week 8 uur</p>
      <div className="mt-6 space-y-3">
        <div className="cat-field_service rounded-2xl px-4 py-3">
          <p className="text-xs opacity-80">Morgen — 09:00</p>
          <p className="font-medium">Velddienst · 2u</p>
        </div>
        <div className="cat-meeting rounded-2xl px-4 py-3">
          <p className="text-xs opacity-80">Zaterdag — 09:00</p>
          <p className="font-medium">Weekendvergadering · 2u</p>
        </div>
      </div>
    </div>
  )
}
