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
  runsDir: path.resolve("runs"),
  minConfidence: num(process.env.MIN_CONFIDENCE) ?? 0.9,
  // null = eşik henüz tanımlanmadı (order-placement-authorization draft)
  minProfit: num(process.env.MIN_PROFIT),
  // Kodda kilitli. Açılması order-placement-authorization kuralının aktivasyonuna bağlı.
  allowPlaceOrder: false as const,
};
