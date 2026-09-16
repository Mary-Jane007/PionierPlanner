"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DownloadApkButton, DownloadZipLink } from "@/components/landing/DownloadApkButton"
import { Logo } from "@/components/brand/Logo"
import { buttonVariants } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import { isNativeApp } from "@/lib/native"
import { cn } from "@/lib/utils"

export default function DownloadPage() {
  const t = useT()
  const [native, setNative] = useState(false)

  useEffect(() => {
    setNative(isNativeApp())
  }, [])

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-3xl items-center px-6 py-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-6 pb-20">
        <p className="text-xs tracking-[0.2em] text-accent uppercase">{t("app.name")}</p>
        <h1 className="font-heading mt-4 text-4xl">{t("download.title")}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("download.intro")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/inloggen?mode=start" className={cn(buttonVariants(), "h-12 rounded-xl px-6")}>
            {t("landing.openApp")}
          </Link>
          {native ? null : (
            <>
              <DownloadApkButton />
              <DownloadZipLink />
            </>
          )}
        </div>
        {native ? null : (
          <>
            <ol className="mt-10 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>{t("download.step1")}</li>
              <li>{t("download.step2")}</li>
              <li>{t("download.step3")}</li>
              <li>{t("download.step4")}</li>
            </ol>
            <p className="mt-4 text-xs text-muted-foreground">{t("landing.apkWontOpenHere")}</p>
          </>
        )}
        <section className="mt-14">
          <h2 className="font-heading text-3xl">{t("download.iosTitle")}</h2>
          <p className="mt-3 text-muted-foreground">{t("download.iosText")}</p>
          <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>{t("download.iosStep1")}</li>
            <li>{t("download.iosStep2")}</li>
            <li>{t("download.iosStep3")}</li>
            <li>{t("download.iosStep4")}</li>
          </ol>
        </section>
        <section className="mt-14">
          <h2 className="font-heading text-3xl">{t("download.pwaTitle")}</h2>
          <p className="mt-3 text-muted-foreground">{t("download.pwaText")}</p>
          <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>{t("download.pwaStep1")}</li>
            <li>{t("download.pwaStep2")}</li>
            <li>{t("download.pwaStep3")}</li>
          </ol>
        </section>
      </main>
    </div>
  )
}
