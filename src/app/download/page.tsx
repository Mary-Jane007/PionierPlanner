"use client"

import { DownloadApkButton, DownloadZipLink } from "@/components/landing/DownloadApkButton"
import { Logo } from "@/components/brand/Logo"
import { useT } from "@/lib/i18n"

export default function DownloadPage() {
  const t = useT()

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-3xl items-center px-6 py-6">
        <a href="/">
          <Logo />
        </a>
      </header>
      <main className="mx-auto max-w-3xl px-6 pb-20">
        <p className="text-xs tracking-[0.2em] text-accent uppercase">{t("app.name")}</p>
        <h1 className="font-heading mt-4 text-4xl">{t("download.title")}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("download.intro")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <DownloadApkButton />
          <DownloadZipLink />
        </div>
        <ol className="mt-10 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>{t("download.step1")}</li>
          <li>{t("download.step2")}</li>
          <li>{t("download.step3")}</li>
          <li>{t("download.step4")}</li>
        </ol>
      </main>
    </div>
  )
}
