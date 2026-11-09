// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { syncProductBrand } from './productBrand';
import { clearWebNotificationBadge } from './systemNotifications';
import { buildSystemNotification } from '../../shared/notifications.js';

afterEach(() => { document.head.querySelectorAll('[data-brand-fixture]').forEach(node => node.remove()); document.documentElement.lang = 'en'; });

it.each([['en', 'G9Agent'], ['zh-CN', '九格智能体']])('localizes unnamed conversation notifications in %s', (language, name) => {
  expect(buildSystemNotification({
    id: 'notice', sessionId: 'session', scope: 'workspace', kind: 'completed',
    createdAt: '2026-01-01T00:00:00.000Z',
  }, {}, language).title).toBe(name);
});

it('updates the title and install metadata, including after clearing notification badges', async () => {
  const manifest = document.createElement('link'); manifest.rel = 'manifest'; manifest.dataset.brandFixture = '';
  const meta = document.createElement('meta'); meta.name = 'apple-mobile-web-app-title'; meta.dataset.brandFixture = '';
  document.head.append(manifest, meta);
  for (const [language, name, file] of [['zh-CN', '九格智能体', '/manifest.zh-CN.json'], ['en', 'G9Agent', '/manifest.json']]) {
    syncProductBrand(language);
    expect(document.title).toBe(name);
    expect(meta.content).toBe(name);
    expect(manifest.getAttribute('href')).toBe(file);
    await clearWebNotificationBadge();
    expect(document.title).toBe(name);
  }
});
