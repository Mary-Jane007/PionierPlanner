"use client"

import { useState } from "react"
import { toast } from "sonner"
import { buttonVariants } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const APK_PATH = "/downloads/pioniersplanner.apk"
const ZIP_PATH = "/downloads/pioniersplanner-android.zip"
const APK_NAME = "pioniersplanner.apk"

async function saveBlob(path: string, filename: string, mime: string) {
  const response = await fetch(path, { cache: "no-store" })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const buffer = await response.arrayBuffer()
  const blob = new Blob([buffer], { type: mime })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = objectUrl
  link.download = filename
  link.rel = "noopener"
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000)
}

export function DownloadApkButton({ className }: { className?: string }) {
  const t = useT()
  const [busy, setBusy] = useState(false)

  async function onDownload() {
    setBusy(true)
    try {
      await saveBlob(APK_PATH, APK_NAME, "application/octet-stream")
      toast.success(t("landing.downloadStarted"))
    } catch {
      try {
        await saveBlob(ZIP_PATH, "pioniersplanner-android.zip", "application/zip")
        toast.success(t("landing.downloadZipStarted"))
      } catch {
        window.location.assign(ZIP_PATH)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onDownload()}
      disabled={busy}
      className={cn(buttonVariants({ variant: "secondary" }), "h-12 rounded-xl px-6", className)}
    >
      {busy ? t("landing.downloadBusy") : t("landing.downloadAndroid")}
    </button>
  )
}

export function DownloadZipLink({ className }: { className?: string }) {
  const t = useT()
  const [busy, setBusy] = useState(false)

  async function onDownload() {
    setBusy(true)
    try {
      await saveBlob(ZIP_PATH, "pioniersplanner-android.zip", "application/zip")
      toast.success(t("landing.downloadZipStarted"))
    } catch {
      toast.error(t("landing.downloadFailed"))
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onDownload()}
      disabled={busy}
      className={cn(buttonVariants({ variant: "outline" }), "h-12 rounded-xl px-6", className)}
    >
      {t("landing.downloadZip")}
    </button>
  )
}
