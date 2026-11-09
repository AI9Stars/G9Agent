// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
afterEach(() => { window.g9agentDesktop = undefined; localStorage.clear(); vi.resetModules(); });
it('new desktop installs start enabled before native settings load', async () => {
  window.g9agentDesktop = { platform: 'win32' } as any;
  const { getNotificationPreferences } = await import('./useNotificationPreferences');
  expect(getNotificationPreferences().enabled).toBe(true);
});
it('preserves explicit desktop opt-out and leaves browser permission opt-in intact', async () => {
  window.g9agentDesktop = { platform: 'win32' } as any;
  localStorage.setItem('g9agent-notifications-v1', JSON.stringify({ enabled: false }));
  expect((await import('./useNotificationPreferences')).getNotificationPreferences().enabled).toBe(false);
  vi.resetModules(); localStorage.clear(); window.g9agentDesktop = undefined;
  expect((await import('./useNotificationPreferences')).getNotificationPreferences().enabled).toBe(false);
});
