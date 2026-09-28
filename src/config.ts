import "dotenv/config";
import path from "node:path";

function num(v: string | undefined): number | null {
  if (v === undefined || v.trim() === "") return null;
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error(`Sayı bekleniyordu: ${v}`);
  return n;
}

export const config = {
  storeId: process.env.STORE_ID ?? "store-01",
  ecUrl: process.env.EC_URL ?? "",
  profileDir: path.resolve("profile"),
  // Boşsa Windows'taki standart Chrome yolları denenir.
  chromePath: process.env.CHROME_PATH ?? "",
  // Chrome yalnızca bu makineden (127.0.0.1) erişilebilir hata ayıklama portuyla açılır.
  cdpPort: num(process.env.CDP_PORT) ?? 9222,
  runsDir: path.resolve("runs"),
  minConfidence: num(process.env.MIN_CONFIDENCE) ?? 0.9,
  // null = eşik henüz tanımlanmadı (order-placement-authorization draft)
  minProfit: num(process.env.MIN_PROFIT),
  // Kodda kilitli. Açılması order-placement-authorization kuralının aktivasyonuna bağlı.
  allowPlaceOrder: false as const,
};
