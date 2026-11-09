import type { G9AgentHooksSettings } from "../../hooks/protocol/settings.js";
import type { PromptContribution } from "../../contributions/PromptContribution.js";
import type { RouterContribution } from "../../contributions/RouterContribution.js";
import type { LoadedPluginCommand } from "../loading/PluginCommandLoader.js";
import type { G9AgentPluginManifest } from "./manifest.js";

export type G9AgentPluginSourceKind = "builtin" | "global" | "project";

export type G9AgentLoadedPlugin = {
  name: string;
  path: string;
  source: G9AgentPluginSourceKind;
  manifest: G9AgentPluginManifest;
  hooksConfig?: G9AgentHooksSettings;
  commands?: LoadedPluginCommand[];
  skills?: LoadedPluginCommand[];
  outputStyles?: LoadedPluginCommand[];
  mcpServers?: Record<string, unknown>;
  lspServers?: Record<string, unknown>;
  /**
   * Programmatic contributions are currently only available to builtin or
   * test-injected plugins. Disk-loaded JSON plugins cannot provide functions.
   */
  promptContributions?: PromptContribution[];
  routerContributions?: RouterContribution[];
};
