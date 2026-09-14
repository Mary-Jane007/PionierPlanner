import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Manrope } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
})

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Pioniersplanner",
  description:
    "Plan je tijd. Houd je voortgang bij. Geniet van je dienst. Werkt offline. Een onafhankelijke planner voor pioniers.",
  applicationName: "Pioniersplanner",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Pioniersplanner",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192" },
      { url: "/icons/icon-512.png", sizes: "512x512" },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: "#29483F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nl"
      className={`${manrope.variable} ${cormorant.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
