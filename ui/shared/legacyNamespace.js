export const LEGACY_PRODUCT_NAME = '9GClaw';

/** Copy renamed browser preferences once; retain old values for recovery. */
export function migrateLegacyStorage(storage) {
  const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter(Boolean);
  for (const key of keys) {
    const current = key.replace(/9gclaw|ninegclaw/gi, 'g9agent');
    if (current !== key && storage.getItem(current) === null) {
      const value = storage.getItem(key);
      if (value !== null) storage.setItem(current, value === '9gclaw' ? 'g9agent' : value);
    }
  }
}
