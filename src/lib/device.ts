export function isAndroidDevice() {
  if (typeof navigator === "undefined") return false
  return /android/i.test(navigator.userAgent)
}

export function isIosDevice() {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  const iphone = /iphone|ipad|ipod/i.test(ua)
  const ipadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1
  return iphone || ipadOs
}

export function isStandaloneApp() {
  if (typeof window === "undefined") return false
  const media = window.matchMedia("(display-mode: standalone)").matches
  const safari = "standalone" in navigator && Boolean((navigator as { standalone?: boolean }).standalone)
  return media || safari
}

export function isIosSafari() {
  if (!isIosDevice()) return false
  const ua = navigator.userAgent
  const isChrome = /crios/i.test(ua)
  const isFirefox = /fxios/i.test(ua)
  const isEdg = /edgios/i.test(ua)
  return !isChrome && !isFirefox && !isEdg
}
