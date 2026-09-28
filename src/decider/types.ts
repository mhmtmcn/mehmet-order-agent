import type { PageState } from "../extract.js";

export const PAGE_TYPES = [
  "ec_order_list",
  "ec_order_detail",
  "ec_auto_order_running",
  "amz_cart",
  "amz_checkout",
  "amz_order_placed",
  "login_required",
  "captcha",
  "error",
  "unknown",
] as const;
export type PageType = (typeof PAGE_TYPES)[number];

export const OBSTACLES = [
  "none",
  "out_of_stock",
  "price_changed",
  "address_mismatch",
  "payment_issue",
  "qty_mismatch",
  "other",
] as const;
export type Obstacle = (typeof OBSTACLES)[number];

export const ACTIONS = [
  "open_next_order",
  "open_order_detail",
  "start_auto_order",
  "wait",
  "proceed_to_checkout",
  "place_order",
  "stop",
] as const;
export type Action = (typeof ACTIONS)[number];

export interface Answer<T extends string> {
  value: T;
  confidence: number;
}

export interface Decision {
  page: Answer<PageType>;
  obstacle: Answer<Obstacle>;
  nextAction: Answer<Action>;
}

export interface Decider {
  name: string;
  decide(state: PageState): Promise<Decision>;
}
