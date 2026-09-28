import { test } from "node:test";
import assert from "node:assert/strict";
import { applyGuards, checkProfit } from "../src/guards.js";
import type { Decision } from "../src/decider/types.js";

const d = (over: Partial<Decision> = {}): Decision => ({
  page: { value: "amz_checkout", confidence: 0.99 },
  obstacle: { value: "none", confidence: 0.99 },
  nextAction: { value: "proceed_to_checkout", confidence: 0.99 },
  ...over,
});
const g = (decision: Decision) => applyGuards({ decision, minConfidence: 0.9, allowPlaceOrder: false });

test("düşük güven → dur", () => {
  assert.equal(g(d({ page: { value: "amz_checkout", confidence: 0.5 } })).kind, "stop");
});
test("captcha / login / unknown → dur", () => {
  for (const v of ["captcha", "login_required", "unknown", "error"] as const) {
    assert.equal(g(d({ page: { value: v, confidence: 0.99 } })).kind, "stop");
  }
});
test("engel → atla", () => {
  assert.equal(g(d({ obstacle: { value: "out_of_stock", confidence: 0.99 } })).kind, "skip");
});
test("place_order kilitliyken asla act dönmez", () => {
  const v = g(d({ nextAction: { value: "place_order", confidence: 1 } }));
  assert.equal(v.kind, "boundary");
});
test("place_order kilit açık olsa bile henüz tıklanmaz", () => {
  const v = applyGuards({ decision: d({ nextAction: { value: "place_order", confidence: 1 } }), minConfidence: 0.9, allowPlaceOrder: true });
  assert.notEqual(v.kind, "act");
});
test("normal eylem → act", () => {
  assert.deepEqual(g(d()), { kind: "act", action: "proceed_to_checkout" });
});
test("kâr ayrıştırma", () => {
  assert.equal(checkProfit("$12.50", null).kind, "ok");
  assert.deepEqual(checkProfit("-3,20 $", null), { kind: "loss", profit: -3.2 });
  assert.deepEqual(checkProfit("1.234,50", 2000), { kind: "below_target", profit: 1234.5, target: 2000 });
  assert.equal(checkProfit(undefined, null).kind, "unknown");
  assert.equal(checkProfit("—", null).kind, "unknown");
});
