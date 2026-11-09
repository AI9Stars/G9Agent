// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { migrateLegacyStorage } from '../../shared/legacyNamespace';
afterEach(() => localStorage.clear());
it('copies legacy browser preferences without replacing current preferences or unrelated values', () => {
  const old = ['9gclaw', 'layout'].join('-');
  localStorage.setItem(old, '{"width":250}');
  localStorage.setItem('g9agent-theme', 'dark');
  localStorage.setItem(['9gclaw', 'theme'].join('-'), 'light');
  localStorage.setItem('userLanguage', 'en');
  migrateLegacyStorage(localStorage);
  expect(localStorage.getItem('g9agent-layout')).toBe('{"width":250}');
  expect(localStorage.getItem('g9agent-theme')).toBe('dark');
  expect(localStorage.getItem(old)).toBe('{"width":250}');
  expect(localStorage.getItem('userLanguage')).toBe('en');
});
