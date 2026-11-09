import type {
  G9AgentToolAvailability,
  G9AgentToolAvailabilityContext,
  G9AgentToolDefinition,
} from "../protocol/types.js";
import { ToolRegistry, type ToolUnavailableDiagnostic } from "./ToolRegistry.js";

export type G9AgentUnavailableToolDiagnostic = {
  toolName: string;
  code: Exclude<G9AgentToolAvailability, { ok: true }>["code"];
  reason: string;
};

export type FilterAvailableToolsResult = {
  registry: ToolRegistry;
  unavailable: G9AgentUnavailableToolDiagnostic[];
};

export async function filterAvailableTools(
  registry: ToolRegistry,
  context: G9AgentToolAvailabilityContext,
): Promise<FilterAvailableToolsResult> {
  const filtered = new ToolRegistry();
  const unavailable: G9AgentUnavailableToolDiagnostic[] = [];
  for (const { diagnostic, aliases } of registry.listUnavailableEntries()) {
    filtered.markUnavailable(diagnostic, aliases);
    unavailable.push(diagnostic);
  }
  const checkCache = new Map<
    NonNullable<G9AgentToolDefinition["checkAvailability"]>,
    Promise<G9AgentToolAvailability>
  >();

  for (const tool of registry.list()) {
    const availability = await resolveToolAvailability(tool, context, checkCache);
    if (availability.ok) {
      filtered.register(tool);
      continue;
    }

    const diagnostic: G9AgentUnavailableToolDiagnostic = {
      toolName: tool.name,
      code: availability.code,
      reason: availability.reason,
    };
    unavailable.push(diagnostic);
    const marked: ToolUnavailableDiagnostic = diagnostic;
    filtered.markUnavailable(marked, tool.aliases);
  }

  return { registry: filtered, unavailable };
}

async function resolveToolAvailability(
  tool: G9AgentToolDefinition,
  context: G9AgentToolAvailabilityContext,
  cache: Map<NonNullable<G9AgentToolDefinition["checkAvailability"]>, Promise<G9AgentToolAvailability>>,
): Promise<G9AgentToolAvailability> {
  const check = tool.checkAvailability;
  if (!check) {
    return { ok: true };
  }

  let promise = cache.get(check);
  if (!promise) {
    promise = Promise.resolve()
      .then(() => check(context))
      .catch((error): G9AgentToolAvailability => ({
        ok: false,
        code: "failed_check",
        reason: error instanceof Error ? error.message : String(error),
      }));
    cache.set(check, promise);
  }

  return promise;
}
