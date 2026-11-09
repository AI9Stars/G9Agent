import { expect, it } from 'vitest';
import { formatUsageLimitText } from './chatFormatting';
import { LEGACY_PRODUCT_NAME } from '../../../../shared/legacyNamespace';

it.each(['G9Agent', '九格智能体', '九格智能体平台', LEGACY_PRODUCT_NAME])('formats persisted usage limits from %s', name => {
  const text = formatUsageLimitText(`${name} usage limit reached|1794182400`);
  expect(text).toContain('Usage limit reached. Your limit will reset at **');
  expect(text).not.toContain('|1794182400');
});

it('keeps unrelated conversation text unchanged', () => {
  expect(formatUsageLimitText('Keep this project name: G9Agent')).toBe('Keep this project name: G9Agent');
  const text = `Keep this historical project name: ${LEGACY_PRODUCT_NAME}`;
  expect(formatUsageLimitText(text)).toBe(text);
});
