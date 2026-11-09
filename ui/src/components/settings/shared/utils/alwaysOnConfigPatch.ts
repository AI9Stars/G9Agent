import type { SettingsProject } from "../types";

type G9AgentConfigLike = Record<string, any>;

export function getAlwaysOnProjectRoot(project: SettingsProject): string {
  const root = project.fullPath || project.path || "";
  return typeof root === "string" ? root.trim().replace(/[\\/]+$/, "") : "";
}

export function isAlwaysOnProjectEnabled(
  config: G9AgentConfigLike,
  project: SettingsProject,
): boolean {
  const root = getAlwaysOnProjectRoot(project);
  return Boolean(root && config.alwaysOn?.projects?.[root]?.enabled === true);
}

export function setAlwaysOnProjectEnabled<T extends G9AgentConfigLike>(
  config: T,
  project: SettingsProject,
  enabled: boolean,
): T {
  const root = getAlwaysOnProjectRoot(project);
  if (!root) return config;

  return {
    ...config,
    alwaysOn: {
      ...config.alwaysOn,
      projects: {
        ...config.alwaysOn?.projects,
        [root]: {
          ...config.alwaysOn?.projects?.[root],
          enabled,
        },
      },
    },
  };
}
