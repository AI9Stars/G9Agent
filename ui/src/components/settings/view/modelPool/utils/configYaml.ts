import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import type { G9AgentConfig } from "../types";

export function safeParseYaml(text: string): G9AgentConfig | null {
  try {
    const value = parseYaml(text);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as G9AgentConfig;
    }
    return null;
  } catch {
    return null;
  }
}

export function configToYamlString(config: G9AgentConfig): string {
  return stringifyYaml(config, { indent: 2, lineWidth: 0 });
}
