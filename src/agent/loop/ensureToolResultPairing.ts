import type { CanonicalToolCall } from "../../model/index.js";
import type { G9AgentToolErrorResult, G9AgentToolResult } from "../../tool/index.js";
import { buildToolErrorRecovery } from "../../tool/execution/errorRecovery.js";

export type MissingToolResultRecoveryContext = {
  cwd?: string;
  permissionMode?: string;
};

export function ensureToolResultPairing(
  calls: CanonicalToolCall[],
  results: G9AgentToolResult[],
  now: () => Date = () => new Date(),
  message = "Tool execution did not produce a result.",
  recoveryContext?: MissingToolResultRecoveryContext,
): G9AgentToolResult[] {
  const resultsByCallId = new Map<string, G9AgentToolResult[]>();
  for (const result of results) {
    const queue = resultsByCallId.get(result.toolCallId);
    if (queue) {
      queue.push(result);
    } else {
      resultsByCallId.set(result.toolCallId, [result]);
    }
  }

  const paired: G9AgentToolResult[] = [];

  for (const call of calls) {
    paired.push(
      resultsByCallId.get(call.id)?.shift()
        ?? createMissingToolResult(call, now, message, recoveryContext),
    );
  }

  return paired;
}

export function createMissingToolResult(
  call: CanonicalToolCall,
  now: () => Date = () => new Date(),
  message = "Tool execution did not produce a result.",
  recoveryContext?: MissingToolResultRecoveryContext,
): G9AgentToolErrorResult {
  const timestamp = now().toISOString();
  const recovery = buildToolErrorRecovery({
    code: "tool_execution_failed",
    toolName: call.name,
    message,
    cwd: recoveryContext?.cwd ?? ".",
    permissionMode: recoveryContext?.permissionMode ?? "default",
  });
  return {
    type: "error",
    toolCallId: call.id,
    toolName: call.name,
    error: {
      code: "tool_execution_failed",
      message,
    },
    content: [{ type: "text", text: recovery.message }],
    metadata: {
      recovery: recovery.advice,
    },
    startedAt: timestamp,
    completedAt: timestamp,
  };
}
