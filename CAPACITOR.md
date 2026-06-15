# Bubble Town — iOS app (Capacitor)

The same web game, wrapped with [Capacitor](https://capacitorjs.com) as a native
iOS app that runs on **iPhone and iPad** (universal). No code fork: the iOS app
loads the exact `dist/` build the web/PWA uses, so the web app and the GitHub
Pages deploy are unaffected.

## What's wired up

- **`capacitor.config.json`** — appId `com.bubbletown.app`, appName `Bubble Town`,
  `webDir: dist`, brand background `#211A40`, splash config.
- **Durable saves** — `src/lib/storage.js` uses `@capacitor/preferences` (native,
  eviction-proof) on device and `localStorage` on the web. Same API either way.
- **Native polish** — `src/lib/native.js` (loaded only on device) keeps the
  WebView below the status bar (nothing under the notch), sets light status-bar
  text, and hides the splash once React mounts. Audio already unlocks on first
  tap.
- **Portrait lock** — iPhone + iPad, in `ios/App/App/Info.plist`.
- **Icons + splash** — generated into the Xcode asset catalog from `assets/`.

## Prerequisites (one-time, on a Mac)

- macOS with **Xcode** (from the App Store).
- Node 20+ and `npm install` in this repo.
- For running on a physical device or shipping: a (free works for your own
  device) **Apple Developer** account; $99/yr to publish to the App Store.

> Capacitor 8 uses Swift Package Manager for plugins — **no CocoaPods needed**.

## Build & run

```bash
npm run ios          # builds web → syncs into iOS → opens Xcode
```
Then in Xcode:
1. Select the **App** target ▸ **Signing & Capabilities** ▸ pick your **Team**
   (and change the Bundle Identifier if `com.bubbletown.app` is taken).
2. Choose a simulator (e.g. *iPhone 15*, *iPad Pro*) or a plugged-in device.
3. Press **▶ Run**.

After any web change, re-sync:
```bash
npm run ios:sync     # build + cap sync ios   (or just `npm run ios` to reopen Xcode)
```

## App identity / assets

- **Bundle ID / name:** edit `appId` / `appName` in `capacitor.config.json`, then
  `npx cap sync ios`. Set the matching Bundle Identifier in Xcode signing.
- **Icons / splash:** replace `assets/icon-only.png` (1024×1024) and
  `assets/splash.png` / `assets/splash-dark.png` (2732×2732), then
  `npm run ios:assets`. (Current ones are derived from the PWA icon — swap in a
  hi-res source when you have one.)

## iPad

The app is universal and **portrait-locked**, so it runs on iPad as a clean
portrait app today. If you later want a tailored landscape/large-screen iPad
layout, add the landscape orientations back in `Info.plist` and adapt the UI —
the layout already uses `%`/`dvh` so it mostly flexes.

## App Store

In Xcode: **Product ▸ Archive** → distribute to **App Store Connect**. Because
the app is universal you'll provide both iPhone and iPad screenshots.

## The web app is untouched

`npm run build`, `npm run preview`, and the GitHub Pages workflow all behave
exactly as before — Capacitor is purely additive.
