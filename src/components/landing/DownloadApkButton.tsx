"use client"

import { useEffect, useState } from "react"
import { buttonVariants } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const APK_PATH = "/downloads/pioniersplanner.apk"
const ZIP_PATH = "/downloads/pioniersplanner-android.zip"

function isAndroidDevice() {
  if (typeof navigator === "undefined") return false
  return /android/i.test(navigator.userAgent)
}

export function DownloadApkButton({ className }: { className?: string }) {
  const t = useT()
  const [android, setAndroid] = useState(false)

  useEffect(() => {
    setAndroid(isAndroidDevice())
  }, [])

  return (
    <a
      href={android ? APK_PATH : ZIP_PATH}
      className={cn(buttonVariants({ variant: "secondary" }), "h-12 rounded-xl px-6", className)}
    >
      {android ? t("landing.downloadAndroid") : t("landing.downloadZip")}
    </a>
  )
}

export function DownloadZipLink({ className }: { className?: string }) {
  const t = useT()

  return (
    <a
      href={ZIP_PATH}
      className={cn(buttonVariants({ variant: "outline" }), "h-12 rounded-xl px-6", className)}
    >
      {t("landing.downloadZip")}
    </a>
  )
}
