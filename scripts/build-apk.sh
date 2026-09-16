#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export ANDROID_HOME="${ANDROID_HOME:-$HOME/android-sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-21-openjdk-amd64}"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$JAVA_HOME/bin:$PATH"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://pionierplanner.onrender.com}"

mkdir -p public/downloads public/icons resources

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

set +o pipefail
yes | sdkmanager --licenses >/dev/null
set -o pipefail
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"

if [[ ! -f public/icons/icon-1024.png ]]; then
  npm run icons
fi

props="$ROOT/android/keystore.properties"
store="$ROOT/android/release.keystore"

if [[ -f "$store" && ! -f "$props" ]]; then
  echo "android/release.keystore exists, but android/keystore.properties is missing."
  echo "Copy android/keystore.properties.example to android/keystore.properties and fill in the passwords for this keystore."
  exit 1
fi

if [[ -f "$props" && ! -f "$store" ]]; then
  echo "android/keystore.properties exists, but android/release.keystore is missing."
  echo "Restore the keystore backup or delete the properties file so a new keystore can be created."
  exit 1
fi

if [[ ! -f "$store" && ! -f "$props" ]]; then
  echo "Creating a local Android release keystore (keep a backup of android/release.keystore and android/keystore.properties)."
  pass="$(openssl rand -base64 32 | tr -d '\n/=+')"
  keytool -genkeypair \
    -keystore "$store" \
    -alias pioniersplanner \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "$pass" \
    -keypass "$pass" \
    -dname "CN=Pioniersplanner, OU=Mobile, O=Pioniersplanner, L=Unknown, ST=Unknown, C=NL"
  umask 077
  cat > "$props" <<PROPS
storeFile=release.keystore
storePassword=${pass}
keyAlias=pioniersplanner
keyPassword=${pass}
PROPS
  echo "Wrote gitignored android/keystore.properties. Play Store updates need this same keystore."
fi

npm run build
npx cap sync android

rm -rf android/app/src/main/assets/public/downloads

cd android
chmod +x gradlew
./gradlew assembleRelease --no-daemon

apk_src="app/build/outputs/apk/release/app-release.apk"
apk_dest="$ROOT/public/downloads/pioniersplanner.apk"
cp "$apk_src" "$apk_dest"

if command -v zip >/dev/null; then
  (
    cd "$ROOT/public/downloads"
    zip -q -j pioniersplanner-android.zip pioniersplanner.apk
  )
fi

echo "Wrote signed release APK $apk_dest ($(du -h "$apk_dest" | cut -f1))"
