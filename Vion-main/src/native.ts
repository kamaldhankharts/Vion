import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';

// Only runs inside the installed Android app, not in the browser.
export function initNative() {
  if (!Capacitor.isNativePlatform()) return;

  // Fullscreen: hide the status bar (network, battery, time...)
  const hideStatusBar = () => {
    StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
    StatusBar.hide().catch(() => {});
  };
  hideStatusBar();
  App.addListener('resume', hideStatusBar);

  // Android back button: go back in history, exit app when at the start.
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });
}
