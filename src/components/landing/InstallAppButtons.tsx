"use client"

import { useEffect, useState, type MouseEvent } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { withBase } from "@/lib/base-path"
import { isAndroidDevice, isIosDevice, isIosSafari, isStandaloneApp } from "@/lib/device"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const APK_PATH = withBase("/downloads/pioniersplanner.apk")
const ZIP_PATH = withBase("/downloads/pioniersplanner-android.zip")
const APK_NAME = "pioniersplanner.apk"

export function InstallAppButtons({ className }: { className?: string }) {
  const t = useT()
  const [android, setAndroid] = useState(false)
  const [ios, setIos] = useState(false)
  const [standalone, setStandalone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [androidOpen, setAndroidOpen] = useState(false)
  const [iosOpen, setIosOpen] = useState(false)

  useEffect(() => {
    setAndroid(isAndroidDevice())
    setIos(isIosDevice())
    setStandalone(isStandaloneApp())
  }, [])

  if (standalone) return null

  async function saveApkFile() {
    setBusy(true)
    try {
      const response = await fetch(APK_PATH, { cache: "no-store" })
      if (!response.ok) throw new Error("download")
      const buffer = await response.arrayBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.android.package-archive" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = APK_NAME
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 15_000)
    } catch {
      window.location.assign(APK_PATH)
    } finally {
      setBusy(false)
      setAndroidOpen(true)
    }
  }

  function onAndroidClick(event: MouseEvent<HTMLAnchorElement>) {
    if (android) {
      setAndroidOpen(true)
      return
    }
    event.preventDefault()
    void saveApkFile()
  }

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <a
        href={APK_PATH}
        download={android ? undefined : APK_NAME}
        className={cn(buttonVariants({ variant: "secondary" }), "h-12 rounded-xl px-6")}
        onClick={onAndroidClick}
      >
        {busy ? t("landing.downloadBusy") : t("landing.installAndroid")}
      </a>
      <Button
        type="button"
        variant={ios ? "secondary" : "outline"}
        className="h-12 rounded-xl px-6"
        onClick={() => setIosOpen(true)}
      >
        {t("landing.installIos")}
      </Button>

      <AlertDialog open={androidOpen} onOpenChange={setAndroidOpen}>
        <AlertDialogContent className="z-[80] max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("landing.install")}</AlertDialogTitle>
            <AlertDialogDescription>{t("landing.installAndroidNext")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.close")}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={iosOpen} onOpenChange={setIosOpen}>
        <AlertDialogContent className="z-[80] max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("landing.install")}</AlertDialogTitle>
            <AlertDialogDescription>
              {ios && !isIosSafari() ? t("landing.installIosSafari") : t("landing.installIosNext")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>{t("landing.installIosStep1")}</li>
            <li>{t("landing.installIosStep2")}</li>
            <li>{t("landing.installIosStep3")}</li>
          </ol>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.close")}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function DownloadZipLink({ className }: { className?: string }) {
  const t = useT()

  return (
    <a
      href={ZIP_PATH}
      download="pioniersplanner-android.zip"
      className={cn(buttonVariants({ variant: "outline" }), "h-12 rounded-xl px-6", className)}
    >
      {t("landing.downloadZip")}
    </a>
  )
}
