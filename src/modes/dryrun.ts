import { openBrowser, activePage } from "../browser.js";
import { config } from "../config.js";
import { extractState } from "../extract.js";
import { getDecider } from "../decider/index.js";
import { applyGuards, checkProfit } from "../guards.js";
import { actionSelectors, runAction } from "../actions.js";
import { RunLog } from "../report.js";

// DRY RUN: Mehmet başında. Akış Place order'dan ÖNCE durur; Mehmet tamamlar.
const decider = getDecider();
if (!decider) throw new Error("Dry run için TYPESAFE_API_KEY gerekli.");
if (Object.keys(actionSelectors).length === 0) {
  throw new Error("Eylem seçicileri tanımlı değil. Önce gözlem turu yapılıp UI haritası onaylanmalı.");
}

const log = new RunLog("dryrun");
const ctx = await openBrowser();
const first = ctx.pages()[0] ?? (await ctx.newPage());
if (config.ecUrl) await first.goto(config.ecUrl);

const MAX_STEPS = 40;
let outcome = "Adım limiti doldu";
for (let i = 0; i < MAX_STEPS; i++) {
  const page = activePage(ctx);
  await page.waitForLoadState("domcontentloaded");
  const state = await extractState(page);
  const decision = await decider.decide(state);
  const verdict = applyGuards({ decision, minConfidence: config.minConfidence, allowPlaceOrder: config.allowPlaceOrder });
  const orderId = state.keyFields.orderId;

  let profit;
  if (decision.page.value === "ec_order_detail") {
    profit = checkProfit(state.keyFields.profit, config.minProfit);
  }
  await log.record(page, { state, decision, verdict, profit });

  if (profit && profit.kind === "loss") {
    log.problem(`Zarar: ${profit.profit}`, orderId);
    outcome = "Zararlı sipariş — Mehmet'e bırakıldı";
    break;
  }
  if (profit && profit.kind === "unknown") {
    log.problem(`Kâr alanı okunamadı (${profit.raw ?? "boş"})`, orderId);
    outcome = "Kâr okunamadı — durduruldu";
    break;
  }
  if (verdict.kind !== "act") {
    if (verdict.kind !== "boundary") log.problem(verdict.reason, orderId);
    outcome = verdict.reason;
    break;
  }
  if (!(await runAction(page, verdict.action))) {
    log.problem(`Eylem için onaylı seçici yok: ${verdict.action}`, orderId);
    outcome = `Durduruldu: ${verdict.action} seçicisi yok`;
    break;
  }
}

console.log(`Sonuç: ${outcome}`);
console.log(`Rapor: ${log.finish(outcome)}`);
console.log("Tarayıcı açık bırakıldı. Mehmet kontrol edip tamamlar.");
