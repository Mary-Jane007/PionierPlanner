import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { Resvg } from "@resvg/resvg-js"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const svg = readFileSync(join(root, "src/app/icon.svg"), "utf8")
const outDir = join(root, "public/icons")
mkdirSync(outDir, { recursive: true })

function pngFromSvg(source, size) {
  return new Resvg(source, {
    fitTo: { mode: "width", value: size },
  })
    .render()
    .asPng()
}

function maskableSvg(size) {
  const pad = Math.round(size * 0.12)
  const inner = size - pad * 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#29483F"/>
  <g transform="translate(${pad} ${pad}) scale(${inner / 40})">
    <path d="M13 28V12h8.2a5.6 5.6 0 0 1 0 11.2H13" fill="none" stroke="#F7F5EF" stroke-width="2.3" stroke-linecap="round"/>
    <circle cx="28.2" cy="13.4" r="2.15" fill="#C68F68"/>
  </g>
</svg>`
}

writeFileSync(join(outDir, "icon-192.png"), pngFromSvg(svg, 192))
writeFileSync(join(outDir, "icon-512.png"), pngFromSvg(svg, 512))
writeFileSync(join(outDir, "icon-1024.png"), pngFromSvg(svg, 1024))
writeFileSync(join(outDir, "icon-maskable-512.png"), pngFromSvg(maskableSvg(512), 512))
writeFileSync(join(outDir, "apple-touch-icon.png"), pngFromSvg(svg, 180))

const resourcesDir = join(root, "resources")
mkdirSync(resourcesDir, { recursive: true })
writeFileSync(join(resourcesDir, "icon.png"), pngFromSvg(svg, 1024))
writeFileSync(join(resourcesDir, "icon-only.png"), pngFromSvg(svg, 1024))
writeFileSync(
  join(resourcesDir, "splash.png"),
  pngFromSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732">
  <rect width="2732" height="2732" fill="#29483F"/>
  <g transform="translate(966 966) scale(20)">
    <path d="M13 28V12h8.2a5.6 5.6 0 0 1 0 11.2H13" fill="none" stroke="#F7F5EF" stroke-width="2.3" stroke-linecap="round"/>
    <circle cx="28.2" cy="13.4" r="2.15" fill="#C68F68"/>
  </g>
</svg>`,
    2732
  )
)
console.log("Wrote PWA icons to public/icons and native assets to resources/")
