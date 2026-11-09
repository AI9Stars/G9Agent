import { productName } from '../../../apps/desktop/src/brand';

/** Keep browser chrome and installed-app metadata aligned with the interface. */
export function syncProductBrand(language: string) {
  const name = productName(language);
  document.title = name;
  document.documentElement.lang = language === 'zh-CN' ? 'zh-CN' : 'en';
  document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', name);
  document.querySelector('link[rel="manifest"]')?.setAttribute('href',
    language === 'zh-CN' ? '/manifest.zh-CN.json' : '/manifest.json');
}
