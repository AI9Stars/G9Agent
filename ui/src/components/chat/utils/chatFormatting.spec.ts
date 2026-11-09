import { expect, it } from 'vitest';
import { formatUsageLimitText } from './chatFormatting';

it.each(['G9Agent', '九格智能体', '九格智能体平台', '9GClaw'])('formats persisted usage limits from %s', name => {
  const text = formatUsageLimitText(`${name} usage limit reached|1794182400`);
  expect(text).toContain('Usage limit reached. Your limit will reset at **');
  expect(text).not.toContain('|1794182400');
});

it('keeps unrelated conversation text unchanged', () => {
  expect(formatUsageLimitText('Keep this project name: 9GClaw')).toBe('Keep this project name: 9GClaw');
});
