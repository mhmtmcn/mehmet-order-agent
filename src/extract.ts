import type { Page } from "playwright";

export interface PageState {
  url: string;
  title: string;
  text: string;
  buttons: string[];
  keyFields: Record<string, string>;
}

const MAX_TEXT = 6000;

// Jev yalnızca metin alır: DOM'dan görünür metin + buton etiketleri çıkarılır.
// keyFields (sipariş no, kâr, adet, adres...) seçicileri gözlem turundan sonra doldurulacak.
export const fieldSelectors: Record<string, string> = {};

export async function extractState(page: Page): Promise<PageState> {
  const text = (await page.locator("body").innerText({ timeout: 10_000 }).catch(() => ""))
    .replace(/\s+\n/g, "\n")
    .slice(0, MAX_TEXT);
  const buttons = await page
    .locator("button:visible, [role=button]:visible, input[type=submit]:visible, a.button:visible")
    .evaluateAll((els) =>
      els
        .map((e) => (e.textContent || (e as HTMLInputElement).value || e.getAttribute("aria-label") || "").trim())
        .filter(Boolean)
        .slice(0, 60),
    )
    .catch(() => [] as string[]);
  const keyFields: Record<string, string> = {};
  for (const [name, sel] of Object.entries(fieldSelectors)) {
    const v = await page.locator(sel).first().innerText({ timeout: 2_000 }).catch(() => null);
    if (v) keyFields[name] = v.trim();
  }
  return { url: page.url(), title: await page.title(), text, buttons, keyFields };
}
