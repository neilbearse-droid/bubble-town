// Native (Capacitor / iOS) niceties. Loaded only when running inside the app
// shell — never bundled into the web entry path's hot code (dynamic import in
// main.jsx). Everything is best-effort and guarded so a missing plugin or web
// context can never crash the game.
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export async function initNative() {
  // Keep the WebView below the status bar so nothing hides under the notch, and
  // use light status-bar text to read against the dark app background.
  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Dark });
  } catch { /* status bar unavailable — ignore */ }

  // Reveal the app once React has mounted (avoids a white flash).
  try { await SplashScreen.hide({ fadeOutDuration: 200 }); } catch { /* ignore */ }
}
