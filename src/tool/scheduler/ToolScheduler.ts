import type { G9AgentToolResult } from "../protocol/result.js";
import type { G9AgentToolCall, G9AgentToolRuntimeContext } from "../protocol/types.js";

export type G9AgentToolScheduler = {
  executeAll(calls: G9AgentToolCall[], context: G9AgentToolRuntimeContext): Promise<G9AgentToolResult[]>;
};
