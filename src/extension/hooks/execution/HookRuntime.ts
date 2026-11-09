import type { G9AgentHookEffect, G9AgentLifecycleError } from "../../../lifecycle/protocol/effects.js";
import { matchHookMatcher } from "../config/matchHook.js";
import { matchHookCondition } from "../config/matchHookCondition.js";
import type { G9AgentHookEvent } from "../protocol/events.js";
import type { G9AgentHookInput } from "../protocol/input.js";
import type { G9AgentHookOutput, G9AgentHookSyncOutput } from "../protocol/output.js";
import type { G9AgentHookCommand, G9AgentHooksSettings } from "../protocol/settings.js";
import { CommandHookExecutor, G9AGENT_SESSION_END_HOOK_TIMEOUT_MS } from "./CommandHookExecutor.js";
import { PromptHookExecutor } from "./PromptHookExecutor.js";
import { HttpHookExecutor } from "./HttpHookExecutor.js";
import { AgentHookExecutor } from "./AgentHookExecutor.js";
import { AsyncHookRegistry } from "./AsyncHookRegistry.js";
import { CallbackHookExecutor } from "./CallbackHookExecutor.js";
import { HookExecutionEventBus, type G9AgentHookExecutionEvent } from "../events/HookExecutionEventBus.js";

export type HookRuntimeRunInput = {
  event: G9AgentHookEvent;
  hookInput: G9AgentHookInput;
  matchQuery?: string;
  cwd: string;
  env?: NodeJS.ProcessEnv;
  signal?: AbortSignal;
};

export type HookRuntimeRunResult = {
  effects: G9AgentHookEffect[];
  events: G9AgentHookExecutionEvent[];
  blockingErrors: G9AgentLifecycleError[];
  nonBlockingErrors: G9AgentLifecycleError[];
};

export class HookRuntime {
  constructor(
    private readonly settings: G9AgentHooksSettings = {},
    private readonly commandExecutor = new CommandHookExecutor(),
    private readonly eventBus = new HookExecutionEventBus(),
    private readonly asyncRegistry = new AsyncHookRegistry(),
    private readonly promptExecutor = new PromptHookExecutor(),
    private readonly httpExecutor = new HttpHookExecutor(),
    private readonly agentExecutor = new AgentHookExecutor(),
    private readonly callbackExecutor = new CallbackHookExecutor(),
  ) {}

  /**
   * Expose the {@link CallbackHookExecutor} so the caller can register
   * per-process callbacks (e.g. the gateway's interactive permission
   * hook) before the runtime starts dispatching events.
   */
  getCallbackExecutor(): CallbackHookExecutor {
    return this.callbackExecutor;
  }

  async run(input: HookRuntimeRunInput): Promise<HookRuntimeRunResult> {
    const effects: G9AgentHookEffect[] = [];
    const events: G9AgentHookExecutionEvent[] = [];
    const blockingErrors: G9AgentLifecycleError[] = [];
    const nonBlockingErrors: G9AgentLifecycleError[] = [];

    for (const { matcher, hook } of this.matchHooks(input)) {
      const hookName = matcher.pluginName ? `${matcher.pluginName}:${hook.type}` : hook.type;
      const started: G9AgentHookExecutionEvent = {
        type: "started",
        hookName,
        hookEvent: input.event,
      };
      events.push(started);
      this.eventBus.emit(started);

      const result = await this.executeHook(hook, input, matcher.pluginRoot);
      const response: G9AgentHookExecutionEvent = {
        type: "response",
        hookName,
        hookEvent: input.event,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        outcome: result.outcome,
      };
      events.push(response);
      this.eventBus.emit(response);

      if (result.output.type === "async") {
        this.asyncRegistry.register({
          id: `${hookName}:${Date.now()}`,
          startedAt: new Date(),
          hookName,
          hookEvent: input.event,
          stdout: result.stdout,
          stderr: result.stderr,
          responseDelivered: false,
          asyncRewake: hook.type === "command" ? hook.asyncRewake : undefined,
        });
      }

      if (result.outcome === "blocking") {
        const message = result.stderr || result.stdout || "Hook blocked execution.";
        blockingErrors.push({ code: "hook_blocking_error", message, hookName, exitCode: result.exitCode });
        effects.push({ type: "block", reason: message });
      } else if (result.outcome === "non_blocking_error" || result.outcome === "timeout" || result.outcome === "cancelled") {
        nonBlockingErrors.push({
          code: result.outcome === "cancelled" ? "hook_cancelled" : "hook_non_blocking_error",
          message: result.stderr || result.stdout || `Hook ended with outcome ${result.outcome}.`,
          hookName,
          exitCode: result.exitCode,
        });
      }

      effects.push(...effectsFromHookOutput(result.output, hookName));
    }

    return { effects, events, blockingErrors, nonBlockingErrors };
  }

  collectAsyncResponses(): ReturnType<AsyncHookRegistry["collectResponses"]> {
    return this.asyncRegistry.collectResponses();
  }

  removeDeliveredAsyncResponses(): void {
    this.asyncRegistry.removeDelivered();
  }

  private *matchHooks(input: HookRuntimeRunInput): Generator<{
    matcher: NonNullable<G9AgentHooksSettings[G9AgentHookEvent]>[number];
    hook: G9AgentHookCommand;
  }> {
    for (const matcher of this.settings[input.event] ?? []) {
      if (!matchHookMatcher(matcher.matcher, input.matchQuery)) {
        continue;
      }
      for (const hook of matcher.hooks) {
        if (
          matchHookCondition(hook.if, {
            toolName: typeof input.hookInput.toolName === "string" ? input.hookInput.toolName : undefined,
            toolInput: input.hookInput.toolInput,
          })
        ) {
          yield { matcher, hook };
        }
      }
    }
  }

  private executeHook(
    hook: G9AgentHookCommand,
    input: HookRuntimeRunInput,
    pluginRoot: string | undefined,
  ) {
    switch (hook.type) {
      case "command":
        return this.commandExecutor.execute({
          hook,
          hookInput: input.hookInput,
          cwd: pluginRoot ?? input.cwd,
          env: input.env,
          signal: input.signal,
          timeoutMs: input.event === "SessionEnd" ? G9AGENT_SESSION_END_HOOK_TIMEOUT_MS : undefined,
        });
      case "prompt":
        return this.promptExecutor.execute({ hook, hookInput: input.hookInput, signal: input.signal });
      case "http":
        return this.httpExecutor.execute({ hook, hookInput: input.hookInput, env: input.env, signal: input.signal });
      case "agent":
        return this.agentExecutor.execute({ hook, hookInput: input.hookInput, signal: input.signal });
      case "callback":
        return this.callbackExecutor.execute({ hook, hookInput: input.hookInput, signal: input.signal });
    }
  }
}

function effectsFromHookOutput(output: G9AgentHookOutput, hookName: string): G9AgentHookEffect[] {
  if (output.type === "async") {
    return [];
  }

  const effects: G9AgentHookEffect[] = [];
  if (output.systemMessage) {
    effects.push({ type: "system_message", content: output.systemMessage });
  }
  if (isBlockingOutput(output)) {
    effects.push({
      type: "block",
      reason: output.reason ?? output.stopReason ?? "Hook blocked execution.",
      stopReason: output.stopReason,
    });
  }
  if (output.specific) {
    const specific = output.specific;
    if (specific.additionalContext) {
      effects.push({ type: "additional_context", content: specific.additionalContext, source: hookName });
    }
    if (specific.initialUserMessage) {
      effects.push({ type: "initial_user_message", message: specific.initialUserMessage });
    }
    if (specific.watchPaths?.length) {
      effects.push({ type: "watch_paths", paths: specific.watchPaths });
    }
    if (specific.worktreePath) {
      effects.push({ type: "worktree_path", path: specific.worktreePath });
    }
    if (specific.permissionDecision) {
      effects.push({
        type: "permission_decision",
        behavior: specific.permissionDecision,
        reason: specific.permissionDecisionReason,
      });
    }
    if (specific.updatedInput) {
      effects.push({ type: "updated_tool_input", input: specific.updatedInput });
    }
    if (specific.updatedMCPToolOutput !== undefined) {
      effects.push({ type: "updated_mcp_tool_output", output: specific.updatedMCPToolOutput });
    }
    if (specific.decision) {
      effects.push({ type: "permission_request_result", result: specific.decision });
    }
    if (specific.retry) {
      effects.push({ type: "retry_permission_denied" });
    }
  }

  return effects;
}

function isBlockingOutput(output: G9AgentHookSyncOutput): boolean {
  return output.continue === false || output.decision === "block";
}
