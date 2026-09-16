"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"

export function ImportBackupButton({
  variant = "outline",
  className,
  onImported,
}: {
  variant?: "outline" | "ghost" | "default"
  className?: string
  onImported?: (signedIn: boolean) => void
}) {
  const t = useT()
  const importBackup = useAppStore((s) => s.importBackup)
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState(false)

  async function onFile(file: File | undefined) {
    if (!file) return
    setPending(true)
    try {
      const text = await file.text()
      const result = importBackup(text)
      if ("error" in result) {
        toast.error(t("settings.importInvalid"))
        return
      }
      toast.success(t("settings.importOk"))
      onImported?.(result.signedIn)
    } catch {
      toast.error(t("settings.importInvalid"))
    } finally {
      setPending(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={(event) => void onFile(event.target.files?.[0])}
      />
      <Button
        type="button"
        variant={variant}
        className={className}
        disabled={pending}
        onClick={() => inputRef.current?.click()}
      >
        {pending ? t("common.loading") : t("settings.import")}
      </Button>
    </>
  )
}
