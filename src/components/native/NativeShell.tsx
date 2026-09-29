"use client"

import { useEffect } from "react"
import { App } from "@capacitor/app"
import { Keyboard, KeyboardResize } from "@capacitor/keyboard"
import { StatusBar, Style } from "@capacitor/status-bar"
import { SplashScreen } from "@capacitor/splash-screen"
import { COLOR_THEME_META } from "@/lib/constants"
import { flushDurableStorage } from "@/lib/durable-storage"
import { isNativeApp } from "@/lib/native"
import { useAppStore } from "@/lib/store"

export function NativeShell() {
  const colorTheme = useAppStore((state) => state.settings.colorTheme ?? "earth")

  useEffect(() => {
    if (!isNativeApp()) return
    let cancelled = false
    const themeColor = COLOR_THEME_META[colorTheme]

    async function setup() {
      try {
        await StatusBar.setStyle({ style: Style.Light })
        await StatusBar.setOverlaysWebView({ overlay: true })
        await StatusBar.setBackgroundColor({ color: themeColor })
      } catch {
        // Some platforms reject overlay/style calls.
      }
      try {
        await Keyboard.setResizeMode({ mode: KeyboardResize.Body })
        await Keyboard.setScroll({ isDisabled: false })
      } catch {
        // Keyboard plugin is a no-op in the browser.
      }
      try {
        await SplashScreen.hide()
      } catch {
        // Splash already hidden.
      }
    }

    void setup()

    const back = App.addListener("backButton", ({ canGoBack }) => {
      if (cancelled) return
      const openLayer = document.querySelector(
        "[data-slot='sheet-content'], [data-slot='alert-dialog-content'], [data-slot='dialog-content']"
      )
      if (openLayer) {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
        return
      }
      if (canGoBack) {
        window.history.back()
        return
      }
      void App.exitApp()
    })

    const keyboardShow = Keyboard.addListener("keyboardDidShow", () => {
      const el = document.activeElement
      if (el instanceof HTMLElement) {
        window.setTimeout(() => {
          el.scrollIntoView({ block: "center", behavior: "smooth" })
        }, 50)
      }
    })

    const pause = App.addListener("pause", () => {
      void flushDurableStorage()
    })
    const resume = App.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) void flushDurableStorage()
    })

    return () => {
      cancelled = true
      void back.then((handle) => handle.remove())
      void keyboardShow.then((handle) => handle.remove())
      void pause.then((handle) => handle.remove())
      void resume.then((handle) => handle.remove())
    }
  }, [colorTheme])

  return null
}
