"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Logo } from "@/components/brand/Logo"
import { PageLoader } from "@/components/layout/PageLoader"
import { buttonVariants } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  demoProfile,
  rememberEmail,
  rememberedEmail,
  registerAccount,
  resetAccountPassword,
  signInAccount,
  storedAccountCount,
} from "@/lib/auth"
import { cloudAvailable } from "@/lib/cloud"
import { useT } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { ImportBackupButton } from "@/components/profile/ImportBackupButton"

type AuthMode = "signin" | "signup" | "reset"

export function LoginPage() {
  const t = useT()
  const router = useRouter()
  const params = useSearchParams()
  const start = params.get("mode") === "start"
  const [mode, setMode] = useState<AuthMode>(start ? "signup" : "signin")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [pending, setPending] = useState(false)
  const [cloudOn, setCloudOn] = useState(true)
  const login = useAppStore((s) => s.login)
  const user = useAppStore((s) => s.user)
  const onboarded = useAppStore((s) => s.onboarded)
  const hydrated = useAppStore((s) => s.hydrated)

  useEffect(() => {
    const stored = rememberedEmail()
    if (!stored) return
    // localStorage is not available during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill after mount
    setEmail(stored)
  }, [])

  useEffect(() => {
    void cloudAvailable().then(setCloudOn)
  }, [])

  useEffect(() => {
    if (hydrated && user && onboarded) router.replace("/vandaag")
  }, [hydrated, user, onboarded, router])

  function goToApp(nextOnboarded: boolean) {
    router.replace(nextOnboarded ? "/vandaag" : "/setup")
  }

  function switchMode(next: AuthMode) {
    setMode(next)
    setError("")
    setNotice("")
    setPassword("")
    setConfirmPassword("")
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (pending) return
    setError("")
    setNotice("")
    setPending(true)
    try {
      if (mode === "reset") {
        if (password !== confirmPassword) {
          setError(t("auth.passwordMismatch"))
          return
        }
        const result = await resetAccountPassword(email, password)
        if ("error" in result) {
          setError(
            result.error === "weak"
              ? t("auth.passwordWeak")
              : result.error === "cloud"
                ? t("auth.resetCloud")
                : t("auth.resetMissing")
          )
          return
        }
        setPassword("")
        setConfirmPassword("")
        setMode("signin")
        setNotice(t("auth.resetSuccess"))
        return
      }
      const result =
        mode === "signup"
          ? await registerAccount(name, email, password)
          : await signInAccount(email, password)
      if ("error" in result) {
        if (result.error === "offline") {
          setError(t("auth.offline"))
          return
        }
        if (mode !== "signup" && result.error === "missing") {
          setError(cloudOn ? t("auth.unknownEmail") : t("auth.notOnThisDevice"))
          return
        }
        setError(result.error === "exists" ? t("auth.exists") : t("auth.error"))
        return
      }
      const profile = result.profile
      rememberEmail(profile.email)
      login(profile, { fresh: mode === "signup", snapshot: result.snapshot ?? null })
      goToApp(useAppStore.getState().onboarded)
    } catch {
      setError(t("auth.offline"))
    } finally {
      setPending(false)
    }
  }

  function openDemo() {
    setError("")
    setNotice("")
    const profile = demoProfile()
    rememberEmail(profile.email)
    login(profile, { demo: true })
    goToApp(true)
  }

  if (!hydrated || (user && onboarded)) {
    return <PageLoader />
  }

  const heading =
    mode === "reset" ? t("auth.reset") : mode === "signup" ? t("auth.signup") : t("auth.welcome")

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="px-6 py-6">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-16">
        <h1 className="font-heading text-4xl">{heading}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "reset"
            ? cloudOn
              ? t("auth.resetCloud")
              : t("auth.resetHint")
            : cloudOn
              ? t("auth.cloudNote")
              : t("auth.localNote")}
        </p>
        {mode !== "reset" ? (
          <p className="mt-2 text-sm text-muted-foreground">{t("auth.staySignedIn")}</p>
        ) : null}
        {mode === "signin" && cloudOn === false ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {storedAccountCount() === 0
              ? t("auth.noLocalAccounts")
              : t("auth.localAccounts", { n: storedAccountCount() })}
          </p>
        ) : null}

        {mode !== "reset" ? (
          <button
            className={cn(buttonVariants(), "mt-8 h-11 rounded-xl")}
            onClick={openDemo}
            disabled={pending}
            type="button"
          >
            {t("auth.demo")}
          </button>
        ) : null}

        <div className="relative my-8 text-center text-xs tracking-[0.16em] text-muted-foreground uppercase">
          <span className="bg-background px-3">
            {mode === "signup" ? t("auth.signup") : mode === "reset" ? t("auth.reset") : t("auth.signin")}
          </span>
          <span className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
        </div>

        {mode === "reset" && cloudOn ? (
          <p className="mt-8 rounded-xl bg-primary/10 px-3 py-2 text-sm" role="status">
            {t("auth.resetCloud")}
          </p>
        ) : (
        <form className="grid gap-4" onSubmit={submit}>
          {mode === "signup" ? (
            <label className="grid gap-1.5">
              <Label htmlFor="name">{t("auth.name")}</Label>
              <input
                id="name"
                className={fieldClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required={mode === "signup"}
              />
            </label>
          ) : null}
          <label className="grid gap-1.5">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <input
              id="email"
              type="email"
              className={fieldClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="grid gap-1.5">
            <Label htmlFor="password">{mode === "signin" ? t("auth.password") : t("auth.newPassword")}</Label>
            <input
              id="password"
              type="password"
              className={fieldClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
            />
          </label>
          {mode === "reset" ? (
            <label className="grid gap-1.5">
              <Label htmlFor="confirm-password">{t("auth.confirmPassword")}</Label>
              <input
                id="confirm-password"
                type="password"
                className={fieldClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </label>
          ) : null}
          {error ? (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : notice ? (
            <p className="rounded-xl bg-primary/10 px-3 py-2 text-sm" role="status">
              {notice}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {mode === "signin"
                ? cloudOn
                  ? t("auth.signinHintCloud")
                  : t("auth.signinHint")
                : mode === "reset"
                  ? t("auth.passwordHint")
                  : cloudOn
                    ? t("auth.cloudNote")
                    : t("auth.localNote")}
            </p>
          )}
          <button
            className={cn(buttonVariants(), "h-11 rounded-xl")}
            type="submit"
            disabled={pending}
          >
            {pending
              ? t("common.loading")
              : mode === "signup"
                ? t("auth.signup")
                : mode === "reset"
                  ? t("auth.reset")
                  : t("auth.signin")}
          </button>
        </form>
        )}

        {mode === "signin" ? (
          <button
            type="button"
            className="mt-3 text-sm text-primary underline-offset-4 hover:underline"
            onClick={() => switchMode("reset")}
          >
            {t("auth.forgot")}
          </button>
        ) : null}

        {mode !== "reset" ? (
          <ImportBackupButton
            variant="outline"
            className="mt-3 h-11 w-full rounded-xl"
            onImported={(signedIn) => {
              if (signedIn) goToApp(useAppStore.getState().onboarded)
            }}
          />
        ) : null}

        {mode !== "reset" ? (
          <>
            <button
              className={cn(buttonVariants({ variant: "outline" }), "mt-3 h-11 rounded-xl")}
              type="button"
              onClick={openDemo}
              disabled={pending}
            >
              {t("auth.google")}
            </button>
            <p className="mt-2 text-xs text-muted-foreground">{t("auth.googleHint")}</p>
          </>
        ) : null}

        <button
          type="button"
          className="mt-6 text-sm text-primary underline-offset-4 hover:underline"
          onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "reset" ? t("auth.backToSignin") : mode === "signup" ? t("auth.signin") : t("auth.signup")}
        </button>
      </main>
    </div>
  )
}

const fieldClass =
  "h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
