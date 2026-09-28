import { openBrowser, activePage } from "../browser.js";
import { config } from "../config.js";
import { extractState } from "../extract.js";
import { getDecider } from "../decider/index.js";
import { RunLog } from "../report.js";

// GÖZLEM: ajan hiçbir şeye tıklamaz. Mehmet akışı elle yürütür; her sayfa değişiminde
// state + (varsa) Jev sınıflandırması + ekran görüntüsü kaydedilir → UI haritası.
const log = new RunLog("observe");
const decider = getDecider();
if (!decider) console.log("TYPESAFE_API_KEY yok: yalnızca sayfa durumu kaydedilecek.");

const ctx = await openBrowser();
const first = ctx.pages()[0] ?? (await ctx.newPage());
if (config.ecUrl) await first.goto(config.ecUrl);

let lastKey = "";
let busy = false;
const timer = setInterval(async () => {
  if (busy) return;
  busy = true;
  try {
    const page = activePage(ctx);
    const state = await extractState(page);
    const key = `${state.url}|${state.title}|${state.text.length}`;
    if (key !== lastKey) {
      lastKey = key;
      const decision = decider ? await decider.decide(state).catch((e: Error) => ({ error: e.message })) : null;
      await log.record(page, { state, decision });
      console.log(`Kaydedildi: ${state.title} ${decision && "page" in decision ? `→ ${decision.page.value} (${decision.page.confidence.toFixed(2)})` : ""}`);
    }
  } catch {
    // sayfa geçişi sırasında okunamadı; bir sonraki turda tekrar dene
  } finally {
    busy = false;
  }
}, 2_000);

console.log("Gözlem başladı. Akışı elle yürüt; bitince tarayıcıyı kapat.");
await new Promise<void>((resolve) => ctx.on("close", () => resolve()));
clearInterval(timer);
console.log(`Kayıtlar: ${log.finish("Gözlem turu — tıklama yapılmadı.")}`);
