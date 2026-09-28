import { TypeSafeClient, choice } from "@typesafe-ai/sdk";
import type { PageState } from "../extract.js";
import { ACTIONS, OBSTACLES, PAGE_TYPES, type Decider, type Decision } from "./types.js";

function options<T extends string>(values: readonly T[]): Record<T, null> {
  return Object.fromEntries(values.map((v) => [v, null])) as Record<T, null>;
}

export function jevDecider(): Decider {
  const client = new TypeSafeClient(); // TYPESAFE_API_KEY env'den okunur
  return {
    name: "jev",
    async decide(state: PageState): Promise<Decision> {
      const res = await client.systemOne({
        state: {
          url: state.url,
          title: state.title,
          buttons: state.buttons.join(" | "),
          keyFields: JSON.stringify(state.keyFields),
          pageText: state.text,
        },
        questions: {
          page: choice(
            "Which page of the EasyCentral → Amazon order flow is this? ec_ = EasyCentral, amz_ = Amazon.",
            options(PAGE_TYPES),
          ),
          obstacle: choice(
            "Is there an obstacle that should stop purchasing this order?",
            options(OBSTACLES),
          ),
          nextAction: choice(
            "What is the next step in the order flow on this page?",
            options(ACTIONS),
          ),
        },
      });
      const a = res.answers;
      return {
        page: { value: a.page.choice, confidence: a.page.confidence },
        obstacle: { value: a.obstacle.choice, confidence: a.obstacle.confidence },
        nextAction: { value: a.nextAction.choice, confidence: a.nextAction.confidence },
      };
    },
  };
}
