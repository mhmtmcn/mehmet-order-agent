import type { Page } from "playwright";
import type { Action } from "./decider/types.js";

// İzinli eylemler (whitelist). Seçiciler gözlem turunda Mehmet'le birlikte çıkarılıp onaylanacak.
// Boş olan eylem çalıştırılmaz → dur. "place_order" burada ASLA yer almaz.
export const actionSelectors: Partial<Record<Exclude<Action, "place_order" | "stop" | "wait">, string>> = {};

export async function runAction(page: Page, action: Exclude<Action, "place_order" | "stop">): Promise<boolean> {
  if (action === "wait") {
    await page.waitForTimeout(3_000);
    return true;
  }
  const sel = actionSelectors[action];
  if (!sel) return false;
  await page.waitForTimeout(800 + Math.random() * 1200); // insan hızı
  await page.locator(sel).first().click();
  await page.waitForLoadState("domcontentloaded");
  return true;
}
