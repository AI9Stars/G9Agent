import type { G9AgentMarketplaceReference } from "./manifest.js";

export type G9AgentPluginMarketplaceStatus = "resolved" | "deferred";

export type G9AgentMarketplaceResolution = {
  status: G9AgentPluginMarketplaceStatus;
  reference: G9AgentMarketplaceReference;
  reason?: string;
};

export function resolveMarketplaceReference(reference: G9AgentMarketplaceReference): G9AgentMarketplaceResolution {
  if (reference.source === "git" || reference.source === "zip" || reference.source === "mcpb") {
    return {
      status: "deferred",
      reference,
      reason: `${reference.source} installation is not implemented in the local runtime.`,
    };
  }
  return { status: "resolved", reference };
}
