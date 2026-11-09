import type { RouterDecision, RouterDecisionInput } from "../protocol/decision.js";

export type CustomRouterContext = {
  sessionId: string;
  isMainAgent: boolean;
  scenarios: ReadonlyArray<string>;
};

export type CustomRouterDecideInput = RouterDecisionInput & {
  context: CustomRouterContext;
};

export type G9AgentCustomRouter = {
  id: string;
  decide(input: CustomRouterDecideInput): Promise<Partial<RouterDecision> | undefined>;
};

export type CustomRouterRegistry = {
  lookupRouter(extensionId: string): G9AgentCustomRouter | undefined;
};

export const noopCustomRouterRegistry: CustomRouterRegistry = {
  lookupRouter: () => undefined,
};
