"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DEFAULT_AUXILIARY_HOURS, DEFAULT_REGULAR_HOURS, JW_ORG_PIONEERS } from "@/lib/constants"
import { defaultAvailability } from "@/lib/seed"
import { useT } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import type { LocaleCode, PioneerTypeId } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"

export function SetupPage() {
  const t = useT()
  const router = useRouter()
  const user = useAppStore((s) => s.user)
  const updateProfile = useAppStore((s) => s.updateProfile)
  const setPioneerGoal = useAppStore((s) => s.setPioneerGoal)
  const setAvailability = useAppStore((s) => s.setAvailability)
  const setSettings = useAppStore((s) => s.setSettings)
  const completeOnboarding = useAppStore((s) => s.completeOnboarding)
  const settings = useAppStore((s) => s.settings)
  const [step, setStep] = useState(1)
  const [name, setName] = useState(user?.name ?? "")
  const [type, setType] = useState<PioneerTypeId>("regular")
  const [hours, setHours] = useState(DEFAULT_REGULAR_HOURS)
  const [availability, setLocalAvailability] = useState(defaultAvailability())

  function finish() {
    if (!useAppStore.getState().user) {
      useAppStore.getState().login(
        {
          id: crypto.randomUUID(),
          email: "lokaal@pioniersplanner.app",
          name: name || "Pionier",
          createdAt: new Date().toISOString(),
        },
        { fresh: true }
      )
    }
    updateProfile({ name })
    setPioneerGoal(
      type,
      type === "regular" ? DEFAULT_REGULAR_HOURS : type === "auxiliary" ? DEFAULT_AUXILIARY_HOURS : hours
    )
    setAvailability(availability)
    completeOnboarding()
    router.replace("/vandaag")
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-12">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
        {t("auth.welcome")}
      </p>
      <h1 className="font-heading mt-2 text-4xl">{t("setup.title")}</h1>

      {step === 1 ? (
        <div className="mt-8 grid gap-4">
          <label className="grid gap-1.5">
            <Label>{t("auth.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <button
            type="button"
            className={`rounded-2xl border p-4 text-left ${type === "regular" ? "border-primary bg-primary/8" : "border-border"}`}
            onClick={() => setType("regular")}
          >
            <p className="font-medium">{t("pioneer.regular")}</p>
            <p className="text-sm text-muted-foreground">{t("pioneer.hoursMonth", { n: DEFAULT_REGULAR_HOURS })}</p>
          </button>
          <button
            type="button"
            className={`rounded-2xl border p-4 text-left ${type === "auxiliary" ? "border-primary bg-primary/8" : "border-border"}`}
            onClick={() => setType("auxiliary")}
          >
            <p className="font-medium">{t("pioneer.auxiliary")}</p>
            <p className="text-sm text-muted-foreground">{t("pioneer.hoursMonth", { n: DEFAULT_AUXILIARY_HOURS })}</p>
          </button>
          <button
            type="button"
            className={`rounded-2xl border p-4 text-left ${type === "custom" ? "border-primary bg-primary/8" : "border-border"}`}
            onClick={() => setType("custom")}
          >
            <p className="font-medium">{t("pioneer.custom")}</p>
            <Input type="number" className="mt-2" value={hours} onChange={(e) => setHours(Number(e.target.value))} />
          </button>
          <a href={JW_ORG_PIONEERS} className="text-sm text-primary underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
            {t("pioneer.readOfficial")}
          </a>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-8 space-y-3">
          <h2 className="font-heading text-2xl">{t("planner.step.availability")}</h2>
          {[1, 2, 3, 4, 5, 6, 7].map((weekday) => {
            const slot = availability.find((item) => item.weekday === weekday) ?? { weekday, parts: [] }
            return (
              <div key={weekday} className="flex flex-wrap items-center gap-2">
                <span className="w-24 text-sm">{t(`weekday.${weekday}`)}</span>
                {(["morning", "afternoon", "evening"] as const).map((part) => (
                  <label key={part} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={slot.parts.includes(part)}
                      onCheckedChange={(checked) => {
                        const parts = checked
                          ? [...slot.parts, part]
                          : slot.parts.filter((item) => item !== part)
                        setLocalAvailability([
                          ...availability.filter((item) => item.weekday !== weekday),
                          { weekday, parts },
                        ])
                      }}
                    />
                    {t(`day.${part}`)}
                  </label>
                ))}
              </div>
            )
          })}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-8 grid gap-4">
          <label className="grid gap-1.5">
            <Label>{t("settings.language")}</Label>
            <Select
              value={settings.language}
              onValueChange={(value) => setSettings({ language: value as LocaleCode })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nl">Nederlands</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="pap">Papiamentu</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-1.5">
            <Label>{t("settings.timezone")}</Label>
            <Input
              value={settings.timezone}
              onChange={(e) => setSettings({ timezone: e.target.value })}
            />
          </label>
        </div>
      ) : null}

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))}>
          {t("setup.back")}
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)}>{t("setup.next")}</Button>
        ) : (
          <Button onClick={finish}>{t("setup.finish")}</Button>
        )}
      </div>
    </div>
  )
}
