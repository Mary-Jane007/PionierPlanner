#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

bash scripts/build-apk.sh

cd android
chmod +x gradlew
./gradlew bundleRelease --no-daemon

aab_src="app/build/outputs/bundle/release/app-release.aab"
aab_dest="$ROOT/public/downloads/pioniersplanner.aab"
cp "$aab_src" "$aab_dest"
echo "Wrote Play Store bundle $aab_dest ($(du -h "$aab_dest" | cut -f1))"
