"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Logo } from "@/components/brand/Logo"
import { buttonVariants } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  demoProfile,
  registerAccount,
  signInAccount,
} from "@/lib/auth"
import { useT } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function LoginPage() {
  const t = useT()
  const router = useRouter()
  const params = useSearchParams()
  const start = params.get("mode") === "start"
  const [mode, setMode] = useState<"signin" | "signup">(start ? "signup" : "signin")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const login = useAppStore((s) => s.login)

  function goToApp(onboarded: boolean) {
    router.replace(onboarded ? "/vandaag" : "/setup")
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (pending) return
    setError("")
    setPending(true)
    try {
      const result =
        mode === "signup"
          ? await registerAccount(name, email, password)
          : await signInAccount(email, password)
      if ("error" in result) {
        setError(
          result.error === "exists" ? t("auth.exists") : t("auth.error")
        )
        return
      }
      login(result, { fresh: mode === "signup" })
      goToApp(useAppStore.getState().onboarded)
    } catch {
      setError(t("activity.error"))
    } finally {
      setPending(false)
    }
  }

  function openDemo() {
    setError("")
    login(demoProfile(), { demo: true })
    goToApp(true)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="px-6 py-6">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-16">
        <h1 className="font-heading text-4xl">{t("auth.welcome")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("auth.localNote")}</p>

        <button
          className={cn(buttonVariants(), "mt-8 h-11 rounded-xl")}
          onClick={openDemo}
          disabled={pending}
          type="button"
        >
          {t("auth.demo")}
        </button>

        <div className="relative my-8 text-center text-xs tracking-[0.16em] text-muted-foreground uppercase">
          <span className="bg-background px-3">{mode === "signup" ? t("auth.signup") : t("auth.signin")}</span>
          <span className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
        </div>

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
              autoComplete="email"
              required
            />
          </label>
          <label className="grid gap-1.5">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <input
              id="password"
              type="password"
              className={fieldClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={6}
            />
          </label>
          {error ? (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {mode === "signin"
                ? t("auth.signinHint")
                : t("auth.localNote")}
            </p>
          )}
          <button
            className={cn(buttonVariants(), "h-11 rounded-xl")}
            type="submit"
            disabled={pending}
          >
            {pending ? t("common.loading") : mode === "signup" ? t("auth.signup") : t("auth.signin")}
          </button>
        </form>

        <button
          className={cn(
            buttonVariants({ variant: "outline" }),
            "mt-3 h-11 rounded-xl"
          )}
          type="button"
          onClick={openDemo}
          disabled={pending}
        >
          {t("auth.google")}
        </button>
        <p className="mt-2 text-xs text-muted-foreground">{t("auth.googleHint")}</p>

        <button
          type="button"
          className="mt-6 text-sm text-primary underline-offset-4 hover:underline"
          onClick={() => {
            setError("")
            setMode(mode === "signup" ? "signin" : "signup")
          }}
        >
          {mode === "signup" ? t("auth.signin") : t("auth.signup")}
        </button>
      </main>
    </div>
  )
}

const fieldClass =
  "h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
