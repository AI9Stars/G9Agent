import type { G9AgentHooksSettings } from "../../hooks/protocol/settings.js";
import type { G9AgentLoadedPlugin } from "../protocol/plugin.js";

export function loadPluginHooks(plugins: G9AgentLoadedPlugin[]): G9AgentHooksSettings {
  const settings: G9AgentHooksSettings = {};
  for (const plugin of plugins) {
    for (const [event, matchers] of Object.entries(plugin.hooksConfig ?? {}) as Array<
      [keyof G9AgentHooksSettings, NonNullable<G9AgentHooksSettings[keyof G9AgentHooksSettings]>]
    >) {
      settings[event] = [
        ...(settings[event] ?? []),
        ...matchers.map((matcher) => ({
          ...matcher,
          pluginName: plugin.name,
          pluginId: `${plugin.name}@${plugin.source}`,
          pluginRoot: plugin.path,
        })),
      ];
    }
  }
  return settings;
}
