"use client"

import { AuthGate } from "@/components/layout/AppShell"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>
}
