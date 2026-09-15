# Mobile build guide — Pioniersplanner

One Next.js codebase. Capacitor wraps it as a native Android and iOS app. The website keeps working.

```text
Website  →  Desktop / mobile browser
Android  →  APK (sideload) or AAB (Play Store)
iOS      →  Xcode → TestFlight / App Store
```

Secrets such as `DATABASE_URL` and `AUTH_SECRET` stay on the server. Mobile builds only bake **public** values (`NEXT_PUBLIC_API_URL`).

---

## What works offline vs online

**Works offline** (after the first load, with data already on the device):

- Navigation, planner, calendar, activities, statistics, experiences, tips already on the device
- Settings and locally saved planner information
- Staying signed in on this device

**Needs internet:**

- Creating an account / signing in on a new device
- Cloud sync of hours and calendar to other devices
- JW.org daily text and other external pages

When you are offline the app shows:

> Geen internetverbinding. Je kunt de planner nog steeds gebruiken. Je gegevens worden gesynchroniseerd zodra je weer online bent.

---

## Shared requirements (all platforms)

1. Node.js 22
2. `npm install`
3. `cp .env.example .env` (web/API only; do not put `DATABASE_URL` in the mobile app)
4. Optional: `NEXT_PUBLIC_API_URL=https://pionierplanner.onrender.com` so the packaged app can reach cloud login

```bash
npm run icons
npm run mobile:assets
npm run build
npx cap sync
```

`npx cap sync` copies `out/` into `android/` and `ios/`.

---

## Android APK (Linux, Windows, or macOS)

Installable file: `public/downloads/pioniersplanner.apk` (**signed release**, not a debug build).

### 1. Requirements

- JDK 21 (`JAVA_HOME`)
- Android SDK (`ANDROID_HOME`), or let `scripts/build-apk.sh` install command-line tools on Linux

Windows: install Android Studio, then run the Gradle steps below from `android/`.

### 2. One command

```bash
npm run android:apk
```

This:

1. Builds the website into `out/`
2. Syncs Capacitor Android
3. Creates `android/release.keystore` and gitignored `android/keystore.properties` if they do not exist (keep a backup of both)
4. Builds a **release** APK
5. Copies it to `public/downloads/pioniersplanner.apk`

Signing passwords are never stored in git. They live in `android/keystore.properties` (gitignored). If a keystore already exists on this machine, the script reuses it and does not overwrite the properties file.

### 3. Install on a phone

1. Send `pioniersplanner.apk` to the phone (Download page, Drive, USB, or cable).
2. Open the file on Android.
3. Allow install from this source when Android asks.
4. Open **Pioniersplanner** from the home screen.

A website cannot silently install an APK. Android always shows its confirmation.

### 4. Open the native project

```bash
npm run android
# then
npx cap open android
```

Needs Android Studio.

---

## Android AAB (Google Play)

Linux/macOS/Windows with Android SDK:

```bash
npm run android:aab
```

Output: `public/downloads/pioniersplanner.aab`

Upload that file in Play Console. Use the **same** `android/release.keystore` for every update. If you lose it, you cannot update the Play listing with a new signing key unless you use Play App Signing.

For Play Console, create your own keystore and keep the passwords only in gitignored `android/keystore.properties`:

```bash
keytool -genkeypair -v -keystore android/release.keystore -alias pioniersplanner \
  -keyalg RSA -keysize 2048 -validity 10000
```

Copy `android/keystore.properties.example` to `android/keystore.properties` and fill in the passwords. Do not commit that file.

---

## iOS / iPhone / iPad (macOS only)

Apple does not install APKs. You need a Mac, Xcode, and an [Apple Developer](https://developer.apple.com/) account.

### 1. Requirements (macOS)

- Xcode (latest stable)
- CocoaPods (`sudo gem install cocoapods`)
- Xcode command-line tools

Linux and Windows can **prepare** the `ios/` project, but they cannot compile an IPA.

### 2. Sync native files

On any OS:

```bash
npm run ios
```

On a Mac, also:

```bash
cd ios/App && pod install && cd ../..
npm run ios:open
```

Or open `ios/App/App.xcworkspace` in Xcode (**workspace**, not the `.xcodeproj`, after CocoaPods).

### 3. Configure signing

In Xcode:

1. Select the **App** target
2. Signing & Capabilities → Team (your Apple Developer team)
3. Bundle Identifier: `app.pioniersplanner`
4. Device family is already iPhone + iPad

### 4. Run on a device

Select an iPhone or iPad, press Run. First time: trust the developer certificate on the device.

### 5. TestFlight

1. Product → Archive
2. Distribute App → App Store Connect → Upload
3. In [App Store Connect](https://appstoreconnect.apple.com/) open TestFlight
4. Add internal or external testers
5. Testers install TestFlight, accept the invite, tap Install

### 6. App Store

1. Same Archive upload as TestFlight
2. Create a new iOS version, attach the build
3. Fill privacy, screenshots, age rating
4. Submit for review
5. After approval, users tap **Get**, confirm with Face ID / Touch ID / Apple ID, and the app installs

`ITSAppUsesNonExemptEncryption` is set to `false` in `ios/App/App/Info.plist` (no custom encryption beyond HTTPS).

---

## App ID

| Platform | Value |
| --- | --- |
| Android applicationId | `app.pioniersplanner` |
| iOS bundle id | `app.pioniersplanner` |
| Display name | Pioniersplanner |

---

## Troubleshooting

- **Cloud login in the APK fails:** rebuild with `NEXT_PUBLIC_API_URL` pointing at the live site. `DATABASE_URL` must never go into the APK.
- **Stale web UI in the app:** run `npm run mobile:sync` (or `npx cap sync`) after `npm run build`.
- **CocoaPods missing:** iOS compile on Mac only; `pod install` inside `ios/App`.
- **Lost Android keystore:** you can still sideload a new APK signed with a new key, but Play Store updates require the original upload key (or Play App Signing).
