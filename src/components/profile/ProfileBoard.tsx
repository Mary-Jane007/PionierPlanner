"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ANNUAL_REFERENCE_HOURS, DEFAULT_AUXILIARY_HOURS, DEFAULT_REGULAR_HOURS, JW_ORG_PIONEERS } from "@/lib/constants"
import { useT } from "@/lib/i18n"
import { useAppStore, useCurrentTarget } from "@/lib/store"
import { deleteStoredAccount } from "@/lib/auth"
import type { LocaleCode, ThemeMode } from "@/types"
import { StartOverDialog } from "@/components/calendar/StartOverDialog"
import { AccountSettings } from "@/components/profile/AccountSettings"

export function ProfileBoard() {
  const t = useT()
  const user = useAppStore((s) => s.user)
  const pioneerType = useAppStore((s) => s.pioneerType)
  const customHours = useAppStore((s) => s.customMonthlyHours)
  const setPioneerGoal = useAppStore((s) => s.setPioneerGoal)
  const settings = useAppStore((s) => s.settings)
  const setSettings = useAppStore((s) => s.setSettings)
  const logout = useAppStore((s) => s.logout)
  const exportData = useAppStore((s) => s.exportData)
  const deleteAccountLocal = useAppStore((s) => s.deleteAccountLocal)
  const target = useCurrentTarget()

  function exportFile() {
    const blob = new Blob([exportData()], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "pioniersplanner-gegevens.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">{t("profile.title")}</p>
        <h1 className="font-heading text-4xl">{user?.name}</h1>
      </header>

      <AccountSettings />

      <section className="card-quiet space-y-4 rounded-3xl p-6">
        <h2 className="font-heading text-2xl">{t("settings.goal")}</h2>
        <p className="text-sm">
          {t(`pioneer.${pioneerType}`)} · {t("pioneer.hoursMonth", { n: target })}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("pioneer.hoursYear", { n: ANNUAL_REFERENCE_HOURS })}
        </p>
        <div className="grid gap-2">
          <GoalButton
            active={pioneerType === "regular"}
            title={t("pioneer.regular")}
            text={t("pioneer.hoursMonth", { n: DEFAULT_REGULAR_HOURS })}
            onClick={() => setPioneerGoal("regular", DEFAULT_REGULAR_HOURS)}
          />
          <GoalButton
            active={pioneerType === "auxiliary"}
            title={t("pioneer.auxiliary")}
            text={t("pioneer.hoursMonth", { n: DEFAULT_AUXILIARY_HOURS })}
            onClick={() => setPioneerGoal("auxiliary", DEFAULT_AUXILIARY_HOURS)}
          />
          <div className={`rounded-2xl border p-4 ${pioneerType === "custom" ? "border-primary bg-primary/8" : "border-border"}`}>
            <p className="font-medium">{t("pioneer.custom")}</p>
            <Input
              type="number"
              className="mt-2"
              value={customHours}
              onChange={(e) => setPioneerGoal("custom", Number(e.target.value))}
            />
          </div>
        </div>
        <a href={JW_ORG_PIONEERS} className="text-sm text-primary underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
          {t("pioneer.source")} — {t("pioneer.readOfficial")}
        </a>
      </section>

      <section className="card-quiet space-y-4 rounded-3xl p-6">
        <h2 className="font-heading text-2xl">{t("settings.planning")}</h2>
        <label className="grid gap-1.5">
          <Label>{t("planner.step.style")}</Label>
          <Select
            value={settings.planningStyle}
            onValueChange={(value) => setSettings({ planningStyle: value as typeof settings.planningStyle })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="even">{t("style.even")}</SelectItem>
              <SelectItem value="weekend">{t("style.weekend")}</SelectItem>
              <SelectItem value="weekdays">{t("style.weekdays")}</SelectItem>
              <SelectItem value="flexible">{t("style.flexible")}</SelectItem>
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
      </section>

      <section className="card-quiet space-y-4 rounded-3xl p-6">
        <h2 className="font-heading text-2xl">{t("settings.notifications")}</h2>
        {(
          [
            ["tomorrowReminder", "notify.tomorrow"],
            ["todayHours", "notify.today"],
            ["monthlyRemaining", "notify.remaining"],
            ["planningUpdate", "notify.update"],
          ] as const
        ).map(([key, sample]) => (
          <label key={key} className="flex items-center justify-between gap-3">
            <span className="text-sm">{t(sample, { time: "09:00", n: 8 })}</span>
            <Switch
              checked={settings.notifications[key]}
              onCheckedChange={(checked) =>
                setSettings({
                  notifications: { ...settings.notifications, [key]: Boolean(checked) },
                })
              }
            />
          </label>
        ))}
      </section>

      <section className="card-quiet space-y-4 rounded-3xl p-6">
        <h2 className="font-heading text-2xl">{t("settings.language")}</h2>
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
      </section>

      <section className="card-quiet space-y-4 rounded-3xl p-6">
        <h2 className="font-heading text-2xl">{t("settings.theme")}</h2>
        <Select
          value={settings.theme}
          onValueChange={(value) => setSettings({ theme: value as ThemeMode })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">{t("settings.theme.light")}</SelectItem>
            <SelectItem value="dark">{t("settings.theme.dark")}</SelectItem>
            <SelectItem value="system">{t("settings.theme.system")}</SelectItem>
          </SelectContent>
        </Select>
        <label className="flex items-center justify-between">
          <span>{t("settings.highContrast")}</span>
          <Switch
            checked={settings.highContrast}
            onCheckedChange={(checked) => setSettings({ highContrast: Boolean(checked) })}
          />
        </label>
      </section>

      <section className="card-quiet space-y-4 rounded-3xl p-6">
        <h2 className="font-heading text-2xl">{t("settings.privacy")}</h2>
        <p className="text-sm text-muted-foreground">{t("exp.visibilityHint")}</p>
        <p className="text-sm text-muted-foreground">{t("auth.localNote")}</p>
        <p className="text-sm text-muted-foreground">{t("auth.staySignedIn")}</p>
      </section>

      <section className="card-quiet space-y-3 rounded-3xl p-6">
        <h2 className="font-heading text-2xl">{t("settings.data")}</h2>
        <StartOverDialog />
        <p className="text-xs text-muted-foreground">{t("calendar.clearConfirm")}</p>
        <Button variant="outline" onClick={exportFile}>
          {t("settings.export")}
        </Button>
        <Button variant="outline" onClick={() => logout()}>
          {t("settings.logout")}
        </Button>
        <ConfirmDeleteButton
          variant="destructive"
          size="default"
          title={t("settings.deleteTitle")}
          description={t("settings.deleteConfirm")}
          confirmLabel={t("settings.delete")}
          onConfirm={() => {
            if (user) deleteStoredAccount(user.id)
            deleteAccountLocal()
          }}
        >
          {t("settings.delete")}
        </ConfirmDeleteButton>
        <p className="text-xs text-muted-foreground">{t("settings.deleteConfirm")}</p>
      </section>
    </div>
  )
}

function GoalButton({
  active,
  title,
  text,
  onClick,
}: {
  active: boolean
  title: string
  text: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left ${active ? "border-primary bg-primary/8" : "border-border"}`}
    >
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{text}</p>
    </button>
  )
}
