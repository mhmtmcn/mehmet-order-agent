import type { Decider } from "./types.js";
import { jevDecider } from "./jev.js";

// Karar verici adaptörü. Jev anahtarı yoksa null döner: gözlem modu yalnızca state kaydeder.
// Claude yedek adaptörü gerekirse buraya eklenecek (Mehmet kararı: Jev birincil).
export function getDecider(): Decider | null {
  if (!process.env.TYPESAFE_API_KEY) return null;
  return jevDecider();
}
