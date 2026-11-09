import type { G9AgentSettings } from '../types/types';
import { authenticatedFetch } from '../../../utils/api.js';

export const G9AGENT_SETTINGS_KEY = 'g9agent-settings';

export const getDraftInputStorageKey = (
  projectName: string,
  sessionId?: string | null,
): string => `draft_input_${projectName}:${sessionId || 'new'}`;

export const safeLocalStorage = {
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error: any) {
      if (error?.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old data');

        const keys = Object.keys(localStorage);
        const draftKeys = keys.filter((k) => k.startsWith('draft_input_'));
        draftKeys.forEach((k) => {
          localStorage.removeItem(k);
        });

        try {
          localStorage.setItem(key, value);
        } catch (retryError) {
          console.error('Failed to save to localStorage even after cleanup:', retryError);
        }
      } else {
        console.error('localStorage error:', error);
      }
    }
  },
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage getItem error:', error);
      return null;
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage removeItem error:', error);
    }
  },
};

// When localStorage has no cached permission settings, fall back to the
// conservative default (false). The authoritative value lives on disk
// (~/.g9agent/permissions.json) and is synced to localStorage when the
// Settings page loads or after a save round-trip. This avoids the old
// problem where a browser cache clear silently re-enabled bypass mode.

export function getG9AgentSettings(): G9AgentSettings {
  const raw = safeLocalStorage.getItem(G9AGENT_SETTINGS_KEY);
  if (!raw) {
    return {
      allowedTools: [],
      askTools: [],
      disallowedTools: [],
      skipPermissions: false,
      projectSortOrder: 'date',
    };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      allowedTools: Array.isArray(parsed.allowedTools) ? parsed.allowedTools : [],
      askTools: Array.isArray(parsed.askTools) ? parsed.askTools : [],
      disallowedTools: Array.isArray(parsed.disallowedTools) ? parsed.disallowedTools : [],
      skipPermissions:
        typeof parsed.skipPermissions === 'boolean'
          ? parsed.skipPermissions
          : false,
      projectSortOrder: parsed.projectSortOrder || 'date',
    };
  } catch {
    return {
      allowedTools: [],
      askTools: [],
      disallowedTools: [],
      skipPermissions: false,
      projectSortOrder: 'date',
    };
  }
}

export async function fetchG9AgentPermissionSettings(): Promise<G9AgentSettings> {
  const response = await authenticatedFetch('/api/settings/permissions');
  if (!response.ok) {
    throw new Error(`Failed to fetch permission settings: HTTP ${response.status}`);
  }
  const data = await response.json();
  return mergePermissionSettings(data.permissions);
}

export async function saveG9AgentPermissionSettings(
  updates: Partial<G9AgentSettings>,
): Promise<G9AgentSettings> {
  const response = await authenticatedFetch('/api/settings/permissions', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error(`Failed to save permission settings: HTTP ${response.status}`);
  }
  const data = await response.json();
  const next = mergePermissionSettings(data.permissions);
  safeLocalStorage.setItem(G9AGENT_SETTINGS_KEY, JSON.stringify({
    ...getG9AgentSettings(),
    ...next,
  }));
  window.dispatchEvent(new Event('g9agent-settings-changed'));
  return next;
}

function unionStringArrays(a: string[], b: string[]): string[] {
  const set = new Set(a);
  for (const item of b) set.add(item);
  return [...set];
}

function mergePermissionSettings(value: unknown): G9AgentSettings {
  const current = getG9AgentSettings();
  const parsed = value && typeof value === 'object' ? value as Partial<G9AgentSettings> : {};
  const backendAllowed = Array.isArray(parsed.allowedTools) ? parsed.allowedTools : [];
  const backendAsk = Array.isArray(parsed.askTools) ? parsed.askTools : [];
  const backendDisallowed = Array.isArray(parsed.disallowedTools) ? parsed.disallowedTools : [];
  return {
    ...current,
    ...parsed,
    allowedTools: unionStringArrays(current.allowedTools, backendAllowed),
    askTools: unionStringArrays(current.askTools, backendAsk),
    disallowedTools: unionStringArrays(current.disallowedTools, backendDisallowed),
    skipPermissions: typeof parsed.skipPermissions === 'boolean' ? parsed.skipPermissions : current.skipPermissions,
    projectSortOrder: current.projectSortOrder || 'date',
  };
}
