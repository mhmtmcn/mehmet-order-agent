import { chromium, type BrowserContext, type Page } from "playwright";
import { config } from "./config.js";

// Gerçek Chrome + ayrı kalıcı otomasyon profili. Mehmet bu profilde elle login olur.
export async function openBrowser(): Promise<BrowserContext> {
  return chromium.launchPersistentContext(config.profileDir, {
    channel: "chrome",
    headless: false,
    viewport: null,
  });
}

// EasyCentral otomatik sipariş akışı Amazon'u yeni sekmede açabilir: en son sekmeyi takip et.
export function activePage(ctx: BrowserContext): Page {
  const pages = ctx.pages().filter((p) => !p.isClosed());
  const page = pages.at(-1);
  if (!page) throw new Error("Açık sekme yok");
  return page;
}
