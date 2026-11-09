import type { CanonicalMessage } from "../../model/index.js";
import type { G9AgentHookEvent } from "../../extension/hooks/protocol/events.js";
import type { G9AgentHookBaseInput } from "../../extension/hooks/protocol/input.js";
import type { G9AgentHookEffect, G9AgentLifecycleError } from "./effects.js";

export type LifecycleDispatchInput = {
  event: G9AgentHookEvent;
  baseInput: G9AgentHookBaseInput;
  payload?: Record<string, unknown>;
  matchQuery?: string;
  signal?: AbortSignal;
  env?: NodeJS.ProcessEnv;
};

export type LifecycleDispatchResult = {
  effects: G9AgentHookEffect[];
  messages: CanonicalMessage[];
  events: unknown[];
  blockingErrors: G9AgentLifecycleError[];
  nonBlockingErrors: G9AgentLifecycleError[];
};

export function emptyLifecycleDispatchResult(): LifecycleDispatchResult {
  return {
    effects: [],
    messages: [],
    events: [],
    blockingErrors: [],
    nonBlockingErrors: [],
  };
}
