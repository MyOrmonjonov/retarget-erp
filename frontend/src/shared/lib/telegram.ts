interface TelegramWebApp {
  initData: string;
  initDataUnsafe: Record<string, unknown>;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  version?: string;
  ready: () => void;
  expand: () => void;
  close: () => void;
  onEvent: (event: string, callback: () => void) => void;
  offEvent: (event: string, callback: () => void) => void;
  isVersionAtLeast?: (version: string) => boolean;
  showAlert?: (message: string, callback?: () => void) => void;
  /** Opens Telegram's native chat picker (Bot API 7.x+, client version 9.6+). `selected` is
   * truthy when the user picked a chat - the actual link happens server-side via the bot's
   * `chat_shared` update, so the caller just needs to poll for the new group afterwards. */
  requestChat?: (preparedButtonId: string, callback: (selected: boolean) => void) => void;
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
