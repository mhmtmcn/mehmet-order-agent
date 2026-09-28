import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { config } from "./config.js";

// Chrome'u Playwright AÇMAZ: Playwright'ın kendi açtığı Chrome eklentileri devre dışı bırakır.
// Bunun yerine gerçek Chrome, ayrı profil + yerel hata ayıklama portuyla normal şekilde açılır;
// eklentiler (EasyCentral vb.) Web Store'dan kurulur ve profilde kalıcı olur. Program sonradan bağlanır.

const endpoint = () => `http://127.0.0.1:${config.cdpPort}`;

function findChrome(): string {
  const candidates = [
    config.chromePath,
    path.join(process.env["PROGRAMFILES"] ?? "C:\\Program Files", "Google\\Chrome\\Application\\chrome.exe"),
    path.join(process.env["PROGRAMFILES(X86)"] ?? "C:\\Program Files (x86)", "Google\\Chrome\\Application\\chrome.exe"),
    path.join(process.env["LOCALAPPDATA"] ?? "", "Google\\Chrome\\Application\\chrome.exe"),
  ].filter(Boolean);
  const found = candidates.find((c) => fs.existsSync(c));
  if (!found) throw new Error("Chrome bulunamadı. .env içine CHROME_PATH= ile chrome.exe yolunu yazın.");
  return found;
}

async function isUp(): Promise<boolean> {
  try {
    const res = await fetch(`${endpoint()}/json/version`);
    return res.ok;
  } catch {
    return false;
  }
}

// Otomasyon Chrome'u açık değilse açar. Chrome programdan bağımsız çalışır; program kapanınca kapanmaz.
export async function startChrome(url?: string): Promise<void> {
  if (await isUp()) return;
  const args = [
    `--remote-debugging-port=${config.cdpPort}`,
    `--user-data-dir=${config.profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
  ];
  if (url) args.push(url);
  spawn(findChrome(), args, { detached: true, stdio: "ignore" }).unref();
  for (let i = 0; i < 40; i++) {
    if (await isUp()) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(
    "Chrome açıldı ama bağlanılamadı. Aynı profille açık başka bir Chrome penceresi varsa kapatıp tekrar deneyin.",
  );
}

export async function openBrowser(): Promise<{ browser: Browser; ctx: BrowserContext }> {
  await startChrome(config.ecUrl || undefined);
  const browser = await chromium.connectOverCDP(endpoint());
  const ctx = browser.contexts()[0];
  if (!ctx) throw new Error("Chrome profiline bağlanılamadı");
  return { browser, ctx };
}

// Program bitince Chrome'u kapatmaz; sadece bağlantıyı bırakır.
export function waitForStop(browser: Browser): Promise<void> {
  return new Promise((resolve) => {
    browser.on("disconnected", () => resolve());
    process.once("SIGINT", () => resolve());
  });
}

// EasyCentral otomatik sipariş akışı Amazon'u yeni sekmede açabilir: en son web sekmesini takip et
// (eklenti sayfaları hariç).
export function activePage(ctx: BrowserContext): Page {
  const pages = ctx.pages().filter((p) => !p.isClosed() && /^https?:/.test(p.url()));
  const page = pages.at(-1);
  if (!page) throw new Error("Açık web sekmesi yok");
  return page;
}
