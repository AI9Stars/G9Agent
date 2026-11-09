import type { G9AgentToolResult } from "../protocol/result.js";
import type { G9AgentToolCall, G9AgentToolRuntimeContext } from "../protocol/types.js";
import type { ToolRuntime } from "../execution/ToolRuntime.js";
import type { G9AgentToolScheduler } from "./ToolScheduler.js";

export class SequentialToolScheduler implements G9AgentToolScheduler {
  constructor(private readonly runtime: ToolRuntime) {}

  async executeAll(
    calls: G9AgentToolCall[],
    context: G9AgentToolRuntimeContext,
  ): Promise<G9AgentToolResult[]> {
    const results: G9AgentToolResult[] = [];
    for (const call of calls) {
      results.push(await this.runtime.execute(call, context));
    }
    return results;
  }
}
