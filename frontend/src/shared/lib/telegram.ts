interface TelegramWebApp {
  initData: string;
  initDataUnsafe: Record<string, unknown>;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  ready: () => void;
  expand: () => void;
  close: () => void;
  onEvent: (event: string, callback: () => void) => void;
  offEvent: (event: string, callback: () => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp ?? null : null;
}

/** The raw initData string to send to POST /api/auth/telegram, or null if not opened via Telegram. */
export function getTelegramInitData(): string | null {
  const webApp = getTelegramWebApp();
  return webApp && webApp.initData ? webApp.initData : null;
}

/** Call once on app startup: signals readiness to Telegram and expands the Mini App to full height. */
export function initTelegramWebApp(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  webApp.ready();
  webApp.expand();
}
