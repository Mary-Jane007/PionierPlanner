const MAX_DATA_URL = 320_000
const HARD_MAX_DATA_URL = 500_000

type Drawable = CanvasImageSource & { width: number; height: number }

function drawJpeg(source: Drawable, maxEdge: number, quality: number) {
  const scale = Math.min(1, maxEdge / Math.max(source.width, source.height, 1))
  const width = Math.max(1, Math.round(source.width * scale))
  const height = Math.max(1, Math.round(source.height * scale))
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")
  if (!context) throw new Error("canvas")
  context.fillStyle = "#ffffff"
  context.fillRect(0, 0, width, height)
  context.drawImage(source, 0, 0, width, height)
  return canvas.toDataURL("image/jpeg", quality)
}

function loadViaImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("decode"))
    }
    image.src = url
  })
}

async function loadBitmap(file: File): Promise<Drawable & { close?: () => void }> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" })
  } catch {
    try {
      return await createImageBitmap(file)
    } catch {
      return loadViaImage(file)
    }
  }
}

export async function compressExperiencePhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("type")
  const bitmap = await loadBitmap(file)
  try {
    let maxEdge = 960
    let quality = 0.72
    let last = ""
    for (let attempt = 0; attempt < 6; attempt += 1) {
      last = drawJpeg(bitmap, maxEdge, quality)
      if (last.length <= MAX_DATA_URL) return last
      maxEdge = Math.round(maxEdge * 0.75)
      quality = Math.max(0.48, quality - 0.08)
    }
    if (last.length <= HARD_MAX_DATA_URL) return last
    throw new Error("too_large")
  } finally {
    bitmap.close?.()
  }
}

export function isExperiencePhoto(value: string | undefined): value is string {
  return Boolean(value && value.startsWith("data:image/"))
}
