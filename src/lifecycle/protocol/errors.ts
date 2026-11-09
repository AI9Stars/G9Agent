export class G9AgentLifecycleRuntimeError extends Error {
  readonly name = "G9AgentLifecycleRuntimeError";

  constructor(
    readonly code: "hook_blocked" | "hook_failed",
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
  }
}
