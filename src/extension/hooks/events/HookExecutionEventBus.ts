import type { G9AgentHookEvent } from "../protocol/events.js";

export type G9AgentHookExecutionEvent =
  | {
      type: "started";
      hookName: string;
      hookEvent: G9AgentHookEvent;
    }
  | {
      type: "response";
      hookName: string;
      hookEvent: G9AgentHookEvent;
      stdout: string;
      stderr: string;
      exitCode?: number;
      outcome: "success" | "blocking" | "non_blocking_error" | "cancelled" | "timeout";
    };

export type G9AgentHookExecutionEventHandler = (event: G9AgentHookExecutionEvent) => void;

export class HookExecutionEventBus {
  private handlers = new Set<G9AgentHookExecutionEventHandler>();

  subscribe(handler: G9AgentHookExecutionEventHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  emit(event: G9AgentHookExecutionEvent): void {
    for (const handler of this.handlers) {
      handler(event);
    }
  }
}
