import type { StartupTiming } from '../../../../apps/desktop/src/startupPresentation';

export function hasStartupShell() {
  return Boolean(window.__g9agentStartupUpdate && document.getElementById('startup'));
}

export function updateStartupShell(state: StartupTiming, language: string, leaving: boolean) {
  const element = document.getElementById('startup');
  if (!element || !window.__g9agentStartupUpdate) return;
  element.style.visibility = 'visible';
  window.__g9agentStartupUpdate({ ...state, language, leaving });
}

export function hideStartupShell() {
  const element = document.getElementById('startup');
  if (element) element.style.visibility = 'hidden';
}

export function releaseStartupShell() {
  window.__g9agentStartupCleanup?.();
  document.getElementById('g9agent-startup-shell')?.remove();
  delete window.__g9agentStartupCleanup;
  delete window.__g9agentStartupUpdate;
}
