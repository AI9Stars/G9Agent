import type { G9AgentLoadedPlugin } from "../protocol/plugin.js";

export class PluginRegistry {
  private readonly plugins = new Map<string, G9AgentLoadedPlugin>();

  replaceAll(plugins: G9AgentLoadedPlugin[]): void {
    this.plugins.clear();
    for (const plugin of plugins) {
      this.plugins.set(`${plugin.name}@${plugin.source}`, plugin);
    }
  }

  list(): G9AgentLoadedPlugin[] {
    return [...this.plugins.values()];
  }
}
