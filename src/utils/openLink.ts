import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

// Opens a link from admin-provided data. Only web, mail and phone links are allowed.
export async function openLink(url: string) {
  const u = (url || '').trim();
  if (!/^(https?:|mailto:|tel:)/i.test(u)) return;

  if (/^(mailto:|tel:)/i.test(u)) {
    window.location.href = u;
    return;
  }
  if (Capacitor.isNativePlatform()) {
    try {
      await Browser.open({ url: u });
      return;
    } catch {
      // fall through
    }
  }
  window.open(u, '_blank', 'noopener,noreferrer');
}
