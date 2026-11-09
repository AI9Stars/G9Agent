import type { G9AgentHookEvent } from "./events.js";

export type G9AgentHookBaseInput = {
  sessionId: string;
  transcriptPath: string;
  cwd: string;
  permissionMode?: string;
  agentId?: string;
  agentType?: string;
};

export type G9AgentHookInput = G9AgentHookBaseInput &
  Record<string, unknown> & {
    hookEventName: G9AgentHookEvent;
  };

export function createHookInput(
  event: G9AgentHookEvent,
  base: G9AgentHookBaseInput,
  payload: Record<string, unknown> = {},
): G9AgentHookInput {
  return {
    ...base,
    ...payload,
    hookEventName: event,
  };
}

export function toLegacyHookInput(input: G9AgentHookInput): Record<string, unknown> {
  const {
    hookEventName,
    sessionId,
    transcriptPath,
    permissionMode,
    agentId,
    agentType,
    ...rest
  } = input;

  const legacy: Record<string, unknown> = {
    ...camelRecordToSnake(rest),
    hook_event_name: hookEventName,
    session_id: sessionId,
    transcript_path: transcriptPath,
    cwd: input.cwd,
  };

  if (permissionMode !== undefined) legacy.permission_mode = permissionMode;
  if (agentId !== undefined) legacy.agent_id = agentId;
  if (agentType !== undefined) legacy.agent_type = agentType;
  return legacy;
}

function camelRecordToSnake(record: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    output[camelToSnake(key)] = value;
  }
  return output;
}

function camelToSnake(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
