#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export ANDROID_HOME="${ANDROID_HOME:-$HOME/android-sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-21-openjdk-amd64}"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$JAVA_HOME/bin:$PATH"

mkdir -p public/downloads public/icons

if [[ ! -x "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]]; then
  echo "Installing Android command-line tools…"
  mkdir -p "$ANDROID_HOME/cmdline-tools"
  tmp="$(mktemp -d)"
  curl -fsSL "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" -o "$tmp/cmdtools.zip"
  unzip -q "$tmp/cmdtools.zip" -d "$tmp"
  rm -rf "$ANDROID_HOME/cmdline-tools/latest"
  mv "$tmp/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
  rm -rf "$tmp"
fi

# `yes` can SIGPIPE once sdkmanager finishes accepting licenses.
set +o pipefail
yes | sdkmanager --licenses >/dev/null
set -o pipefail
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"

if [[ ! -f public/icons/icon-512.png ]]; then
  npm run icons
fi

npm run build
npx cap sync android

# Do not ship the APK inside the Android web assets.
rm -rf android/app/src/main/assets/public/downloads

cd android
chmod +x gradlew
./gradlew assembleDebug --no-daemon

apk_src="app/build/outputs/apk/debug/app-debug.apk"
apk_dest="$ROOT/public/downloads/pioniersplanner.apk"
cp "$apk_src" "$apk_dest"
echo "Wrote $apk_dest ($(du -h "$apk_dest" | cut -f1))"
