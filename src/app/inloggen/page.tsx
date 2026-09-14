"use client"

import { Suspense } from "react"
import { LoginPage } from "@/components/auth/LoginPage"

export default function InloggenPage() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  )
}
