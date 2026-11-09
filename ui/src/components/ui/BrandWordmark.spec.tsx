// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { afterEach, expect, it } from 'vitest';
import { createTestI18n } from '../../i18n/testInstance';
import BrandWordmark from './BrandWordmark';

afterEach(cleanup);

it('switches the visible logo text and accessible name with the interface language', async () => {
  const i18n = await createTestI18n('en');
  render(<I18nextProvider i18n={i18n}><BrandWordmark /></I18nextProvider>);
  expect(screen.getByRole('img', { name: 'G9Agent' }).textContent).toBe('G9Agent');
  await act(() => i18n.changeLanguage('zh-CN'));
  expect(screen.getByRole('img', { name: '九格智能体' }).textContent).toBe('九格智能体');
  expect(screen.queryByText('G9Agent')).toBeNull();
  await act(() => i18n.changeLanguage('en'));
  expect(screen.getByRole('img', { name: 'G9Agent' })).toBeTruthy();
});
