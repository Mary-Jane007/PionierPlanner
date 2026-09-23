"use client"

import { Suspense } from "react"
import { FollowUpsBoard } from "@/components/followups/FollowUpsBoard"
import { PageLoader } from "@/components/layout/PageLoader"

export default function NabezoekenPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <FollowUpsBoard />
    </Suspense>
  )
}
