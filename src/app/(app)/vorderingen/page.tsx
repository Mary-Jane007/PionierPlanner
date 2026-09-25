"use client"

import { Suspense } from "react"
import { GrowthBoard } from "@/components/growth/GrowthBoard"
import { PageLoader } from "@/components/layout/PageLoader"

export default function VorderingenPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <GrowthBoard />
    </Suspense>
  )
}
