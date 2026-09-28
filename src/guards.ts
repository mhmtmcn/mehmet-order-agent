import type { Action, Decision } from "./decider/types.js";

export type Verdict =
  | { kind: "act"; action: Exclude<Action, "place_order" | "stop"> }
  | { kind: "boundary"; reason: string } // Place order sınırı: Mehmet tamamlar
  | { kind: "skip"; reason: string } // bu siparişi atla, rapora yaz
  | { kind: "stop"; reason: string }; // tüm turu durdur, escalate

const STOP_PAGES = new Set(["login_required", "captcha", "error", "unknown"]);

export interface GuardInput {
  decision: Decision;
  minConfidence: number;
  allowPlaceOrder: boolean;
}

// Kritik sınırlar burada, kodda. Model bu kararları veremez.
export function applyGuards({ decision, minConfidence, allowPlaceOrder }: GuardInput): Verdict {
  const { page, obstacle, nextAction } = decision;
  for (const [name, a] of Object.entries(decision)) {
    if (a.confidence < minConfidence) {
      return { kind: "stop", reason: `Düşük güven: ${name}=${a.value} (${a.confidence.toFixed(2)})` };
    }
  }
  if (STOP_PAGES.has(page.value)) return { kind: "stop", reason: `Beklenmeyen sayfa: ${page.value}` };
  if (obstacle.value !== "none") return { kind: "skip", reason: `Engel: ${obstacle.value}` };
  if (nextAction.value === "stop") return { kind: "stop", reason: "Karar verici durmayı önerdi" };
  if (nextAction.value === "place_order") {
    if (!allowPlaceOrder) return { kind: "boundary", reason: "Place order kilitli — Mehmet tamamlar" };
    return { kind: "stop", reason: "Place order kilidi açık ama otomatik tamamlama henüz uygulanmadı" };
  }
  return { kind: "act", action: nextAction.value };
}

export type ProfitResult =
  | { kind: "ok"; profit: number }
  | { kind: "loss"; profit: number }
  | { kind: "below_target"; profit: number; target: number }
  | { kind: "unknown"; raw: string | undefined };

// Kâr/zarar deterministik hesaplanır; Jev'e bırakılmaz.
export function checkProfit(raw: string | undefined, minProfit: number | null): ProfitResult {
  if (!raw) return { kind: "unknown", raw };
  const cleaned = raw.replace(/[^\d,.\-]/g, "");
  const normalized = /,\d{1,2}$/.test(cleaned) ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned.replace(/,/g, "");
  const profit = Number(normalized);
  if (normalized === "" || Number.isNaN(profit)) return { kind: "unknown", raw };
  if (profit < 0) return { kind: "loss", profit };
  if (minProfit !== null && profit < minProfit) return { kind: "below_target", profit, target: minProfit };
  return { kind: "ok", profit };
}
