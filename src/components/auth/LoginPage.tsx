"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Logo } from "@/components/brand/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { demoProfile, registerAccount, signInAccount } from "@/lib/auth"
import { useT } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"

export function LoginPage() {
  const t = useT()
  const router = useRouter()
  const params = useSearchParams()
  const start = params.get("mode") === "start"
  const [mode, setMode] = useState<"signin" | "signup">(start ? "signup" : "signin")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const login = useAppStore((s) => s.login)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === "signup") {
      const result = await registerAccount(name, email, password)
      if ("error" in result) {
        toast.error(t("auth.exists"))
        return
      }
      login(result, { fresh: true })
      router.push("/setup")
      return
    }
    const result = await signInAccount(email, password)
    if ("error" in result) {
      toast.error(t("auth.error"))
      return
    }
    login(result)
    const onboarded = useAppStore.getState().onboarded
    router.push(onboarded ? "/vandaag" : "/setup")
  }

  function openDemo() {
    login(demoProfile(), { demo: true })
    router.push("/vandaag")
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
        <form className="mt-8 grid gap-4" onSubmit={submit}>
          {mode === "signup" ? (
            <label className="grid gap-1.5">
              <Label>{t("auth.name")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
          ) : null}
          <label className="grid gap-1.5">
            <Label>{t("auth.email")}</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="grid gap-1.5">
            <Label>{t("auth.password")}</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </label>
          <Button className="h-11 rounded-xl" type="submit">
            {mode === "signup" ? t("auth.signup") : t("auth.signin")}
          </Button>
        </form>
        <Button variant="outline" className="mt-3 h-11 rounded-xl" onClick={openDemo}>
          {t("auth.google")}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">{t("auth.googleHint")}</p>
        <Button variant="secondary" className="mt-4 h-11 rounded-xl" onClick={openDemo}>
          {t("auth.demo")}
        </Button>
        <button
          type="button"
          className="mt-6 text-sm text-primary underline-offset-4 hover:underline"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
        >
          {mode === "signup" ? t("auth.signin") : t("auth.signup")}
        </button>
      </main>
    </div>
  )
}
