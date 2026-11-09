export const PRODUCT_NAME = 'G9Agent';
export const CHINESE_PRODUCT_NAME = '九格智能体';

/** Display labels follow the interface language; persistent IDs stay stable. */
export function productName(language = 'en'): string {
  return language.toLowerCase().startsWith('zh') ? CHINESE_PRODUCT_NAME : PRODUCT_NAME;
}
