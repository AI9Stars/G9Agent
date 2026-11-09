import type { G9AgentLoadedPlugin } from "../protocol/plugin.js";

export function discoverBuiltinPlugins(plugins: G9AgentLoadedPlugin[] = []): G9AgentLoadedPlugin[] {
  return plugins.filter((plugin) => plugin.source === "builtin");
}
