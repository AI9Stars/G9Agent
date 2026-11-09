import type { G9AgentConfig } from "../../modelPool/types";

export function isCronConfigEnabled(config: G9AgentConfig): boolean {
  return config.cron?.enabled !== false;
}
