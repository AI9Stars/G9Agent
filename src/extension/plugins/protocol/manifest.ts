import type { G9AgentHooksSettings } from "../../hooks/protocol/settings.js";

export type G9AgentPluginManifest = {
  name: string;
  version?: string;
  description?: string;
  commands?: string | string[];
  agents?: string | string[];
  skills?: string | string[];
  hooks?: string | G9AgentHooksSettings;
  mcpServers?: Record<string, unknown>;
  lspServers?: Record<string, unknown>;
  outputStyles?: string | string[];
  marketplace?: G9AgentMarketplaceReference;
  mcpb?: string;
  settings?: Record<string, unknown>;
};

export type G9AgentMarketplaceReference = {
  name: string;
  plugin: string;
  version?: string;
  source?: "marketplace" | "git" | "zip" | "mcpb";
  url?: string;
};
