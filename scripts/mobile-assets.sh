#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

npm run icons

manifest="$ROOT/public/manifest.webmanifest"
backup="$(mktemp)"
cp "$manifest" "$backup"

npx capacitor-assets generate \
  --iconBackgroundColor '#29483F' \
  --iconBackgroundColorDark '#29483F' \
  --splashBackgroundColor '#29483F' \
  --splashBackgroundColorDark '#29483F' \
  --logoSplashScale 0.28

# capacitor-assets rewrites the PWA manifest with broken paths; keep ours.
cp "$backup" "$manifest"
rm -f "$backup"
rm -rf "$ROOT/icons"
