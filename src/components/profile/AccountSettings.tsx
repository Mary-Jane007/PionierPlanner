"use client"

import { useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { dateLocale } from "@/lib/dates"
import { useT, useLang } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import {
  changeAccountPassword,
  hasStoredAccount,
  saveAccountCredentials,
  updateAccountEmail,
} from "@/lib/auth"

export function AccountSettings() {
  const t = useT()
  const lang = useLang()
  const user = useAppStore((s) => s.user)
  const updateProfile = useAppStore((s) => s.updateProfile)
  const stored = user ? hasStoredAccount(user.id) : false
  const [email, setEmail] = useState(user?.email ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [pendingEmail, setPendingEmail] = useState(false)
  const [pendingPassword, setPendingPassword] = useState(false)

  if (!user) return null

  async function saveEmail() {
    if (!user) return
    setEmailError("")
    setPendingEmail(true)
    try {
      if (!stored) {
        setEmailError(t("settings.setPasswordFirst"))
        return
      }
      const result = await updateAccountEmail(user.id, email)
      if ("error" in result) {
        setEmailError(
          result.error === "exists"
            ? t("auth.exists")
            : result.error === "invalid"
              ? t("auth.emailInvalid")
              : t("settings.noStoredAccount")
        )
        return
      }
      updateProfile({ email: result.email })
      toast.success(t("settings.emailSaved"))
    } finally {
      setPendingEmail(false)
    }
  }

  async function savePassword() {
    if (!user) return
    setPasswordError("")
    if (newPassword !== confirmPassword) {
      setPasswordError(t("auth.passwordMismatch"))
      return
    }
    setPendingPassword(true)
    try {
      if (!stored) {
        const result = await saveAccountCredentials(user, email, newPassword)
        if ("error" in result) {
          setPasswordError(
            result.error === "exists"
              ? t("auth.exists")
              : result.error === "weak"
                ? t("auth.passwordWeak")
                : t("auth.emailInvalid")
          )
          return
        }
        updateProfile({ email: result.email })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        toast.success(t("settings.accountSaved"))
        return
      }
      const result = await changeAccountPassword(user.id, currentPassword, newPassword)
      if ("error" in result) {
        setPasswordError(
          result.error === "invalid"
            ? t("auth.currentInvalid")
            : result.error === "weak"
              ? t("auth.passwordWeak")
              : t("settings.noStoredAccount")
        )
        return
      }
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success(t("settings.passwordChanged"))
    } finally {
      setPendingPassword(false)
    }
  }

  return (
    <section className="card-quiet space-y-4 rounded-3xl p-6">
      <h2 className="font-heading text-2xl">{t("settings.account")}</h2>
      <p className="text-sm text-muted-foreground">{t("settings.accountHint")}</p>
      <label className="grid gap-1.5">
        <Label htmlFor="account-name">{t("auth.name")}</Label>
        <Input
          id="account-name"
          value={user.name}
          onChange={(event) => updateProfile({ name: event.target.value })}
          autoComplete="name"
        />
      </label>
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          void saveEmail()
        }}
      >
        <label className="grid gap-1.5">
          <Label htmlFor="account-email">{t("auth.email")}</Label>
          <Input
            id="account-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />
        </label>
        {emailError ? (
          <p className="text-sm text-destructive" role="alert">
            {emailError}
          </p>
        ) : null}
        <Button type="submit" variant="outline" className="h-11 w-fit rounded-xl" disabled={pendingEmail || !stored}>
          {pendingEmail ? t("common.loading") : t("settings.saveEmail")}
        </Button>
        {!stored ? (
          <p className="text-xs text-muted-foreground">{t("settings.setPasswordFirst")}</p>
        ) : null}
      </form>
      <form
        className="grid gap-3 border-t border-border pt-4"
        onSubmit={(event) => {
          event.preventDefault()
          void savePassword()
        }}
      >
        <h3 className="font-medium">{stored ? t("settings.changePassword") : t("settings.setPassword")}</h3>
        {stored ? (
          <label className="grid gap-1.5">
            <Label htmlFor="current-password">{t("auth.currentPassword")}</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
        ) : null}
        <label className="grid gap-1.5">
          <Label htmlFor="new-password">{t("auth.newPassword")}</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </label>
        <label className="grid gap-1.5">
          <Label htmlFor="confirm-password">{t("auth.confirmPassword")}</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </label>
        {passwordError ? (
          <p className="text-sm text-destructive" role="alert">
            {passwordError}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">{t("auth.passwordHint")}</p>
        )}
        <Button type="submit" className="h-11 w-fit rounded-xl" disabled={pendingPassword}>
          {pendingPassword ? t("common.loading") : stored ? t("settings.changePassword") : t("settings.setPassword")}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        {t("settings.created")}: {format(new Date(user.createdAt), "d MMMM yyyy", { locale: dateLocale(lang) })}
      </p>
    </section>
  )
}
